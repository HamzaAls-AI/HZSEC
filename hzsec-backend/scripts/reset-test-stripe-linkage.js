// One-shot script: clear stale TEST-mode Stripe fields from a user's license.
//
// Run in the Railway environment so it gets DATABASE_URL automatically:
//   railway run node scripts/reset-test-stripe-linkage.js <clerkId>
//
// What it does:
//   - Finds all License rows for the given Clerk user that have a Stripe
//     customer or subscription ID attached.
//   - Sets stripeCustomerId = null, stripeSubscriptionId = null,
//     status = 'canceled', trialEndsAt = null, currentPeriodEnd = null.
//   - Leaves the User row, licenseKey, usage, and audit_events untouched.
//
// What it does NOT do:
//   - Delete any rows.
//   - Touch live Stripe objects (read-only from our side here).
//   - Affect any other user.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clerkId = process.argv[2];
  if (!clerkId) {
    console.error('Usage: node scripts/reset-test-stripe-linkage.js <clerkId>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { licenses: true }
  });

  if (!user) {
    console.error(`No user found with clerkId: ${clerkId}`);
    process.exit(1);
  }

  console.log(`User: ${user.email} (${user.clerkId})`);

  const stale = user.licenses.filter(
    l => l.stripeCustomerId || l.stripeSubscriptionId
  );

  if (stale.length === 0) {
    console.log('No licenses with Stripe linkage found — nothing to reset.');
    process.exit(0);
  }

  console.log(`Found ${stale.length} license(s) with Stripe linkage:`);
  for (const l of stale) {
    console.log(`  id=${l.id}  status=${l.status}  tier=${l.tier}`);
    console.log(`    stripeCustomerId:     ${l.stripeCustomerId}`);
    console.log(`    stripeSubscriptionId: ${l.stripeSubscriptionId}`);
  }

  console.log('\nClearing Stripe fields and setting status=canceled …');

  for (const l of stale) {
    await prisma.license.update({
      where: { id: l.id },
      data: {
        stripeCustomerId:     null,
        stripeSubscriptionId: null,
        status:               'canceled',
        trialEndsAt:          null,
        currentPeriodEnd:     null
      }
    });
    console.log(`  ✓ License ${l.id} cleared`);
  }

  console.log('\nDone. The next checkout will create a fresh live Stripe customer.');
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
