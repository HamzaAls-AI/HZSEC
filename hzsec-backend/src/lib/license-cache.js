// In-memory LRU-ish cache for license validation.
//
// The desktop app caches its validation result for 24h on its end (per the
// spec). On the server we add a much shorter cache (60s default) so a burst
// of requests from one machine (proxy calls during a chat session) doesn't
// hammer the DB. Cache is invalidated on any webhook that changes a
// license's status — see invalidate() callers.
//
// Process-local. Two replicas means two caches; that's fine for 60s TTL —
// the worst case is one replica serves stale data for up to TTL after a
// status change. Acceptable for our scale.

const TTL_MS = 60_000;
const MAX_ENTRIES = 5_000;

const store = new Map();

function get(key) {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.exp) {
    store.delete(key);
    return null;
  }
  // LRU touch: re-insert to move to end of insertion order.
  store.delete(key);
  store.set(key, e);
  return e.val;
}

function set(key, val) {
  if (store.size >= MAX_ENTRIES) {
    // Drop the oldest (first) entry. Map preserves insertion order.
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, { val, exp: Date.now() + TTL_MS });
}

function invalidate(key) {
  store.delete(key);
}

function clear() {
  store.clear();
}

module.exports = { get, set, invalidate, clear, TTL_MS };
