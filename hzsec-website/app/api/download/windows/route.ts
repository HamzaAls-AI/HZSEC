import { redirect } from 'next/navigation';

const WINDOWS_DOWNLOAD_URL =
  'https://github.com/HamzaAls-AI/HZSEC/releases/latest/download/HZSec-Setup.exe';

export function GET() {
  redirect(WINDOWS_DOWNLOAD_URL);
}
