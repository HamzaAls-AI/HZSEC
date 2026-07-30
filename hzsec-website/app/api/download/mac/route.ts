import { redirect } from 'next/navigation';

const MAC_DOWNLOAD_URL =
  'https://github.com/HamzaAls-AI/HZSEC/releases/latest/download/HZSec-mac-arm64.dmg';

export function GET() {
  redirect(MAC_DOWNLOAD_URL);
}
