import { redirect } from 'next/navigation';

const MAC_DOWNLOAD_URL =
  'https://github.com/HamzaAls-AI/HZSEC/releases/latest/download/HZSec-1.0.0-arm64.dmg';

export function GET() {
  redirect(MAC_DOWNLOAD_URL);
}
