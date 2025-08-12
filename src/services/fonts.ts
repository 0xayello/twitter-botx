import { GlobalFonts } from '@napi-rs/canvas';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

let fontsLoaded = false;

const ROBOTO_REGULAR_URL = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto%5Bwdth,wght%5D.ttf';
const ROBOTO_BOLD_URL = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf';

async function downloadToFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download font: ${url} - ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(arrayBuffer));
}

export async function ensureFontsLoaded(): Promise<void> {
  if (fontsLoaded) return;

  try {
    const regularPath = join(tmpdir(), 'roboto-variable.ttf');
    const boldPath = join(tmpdir(), 'roboto-bold.ttf');

    await downloadToFile(ROBOTO_REGULAR_URL, regularPath);
    GlobalFonts.registerFromPath(regularPath, 'Roboto');

    await downloadToFile(ROBOTO_BOLD_URL, boldPath);
    GlobalFonts.registerFromPath(boldPath, 'Roboto Bold');

    fontsLoaded = true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Font registration failed:', error);
  }
}

export const DEFAULT_FONT_FAMILY = 'Roboto';

