import { GlobalFonts } from '@napi-rs/canvas';

let fontsLoaded = false;

const ROBOTO_REGULAR_URL = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto%5Bwdth,wght%5D.ttf';
const ROBOTO_BOLD_URL = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf';

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download font: ${url} - ${response.status}`);
  }
  return await response.arrayBuffer();
}

export async function ensureFontsLoaded(): Promise<void> {
  if (fontsLoaded) return;

  try {
    // Try to register Roboto Regular
    const regularBuffer = await fetchArrayBuffer(ROBOTO_REGULAR_URL);
    GlobalFonts.registerFromBuffer(Buffer.from(regularBuffer), 'Roboto');

    // Try to register Roboto Bold
    const boldBuffer = await fetchArrayBuffer(ROBOTO_BOLD_URL);
    GlobalFonts.registerFromBuffer(Buffer.from(boldBuffer), 'Roboto Bold');

    fontsLoaded = true;
  } catch (error) {
    // If remote font download fails, fall back silently – Chart.js will still draw,
    // but text may not render. We log for observability.
    // eslint-disable-next-line no-console
    console.warn('Font registration failed:', error);
  }
}

export const DEFAULT_FONT_FAMILY = 'Roboto';

