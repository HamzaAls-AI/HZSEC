/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The website only ever calls the backend over HTTPS in production. Local
  // dev hits http://localhost:8080 — declared in .env.local.
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
  }
};
