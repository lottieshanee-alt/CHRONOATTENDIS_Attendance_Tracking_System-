/**
 * Pure TypeScript SVG Code 128 (Subset B) barcode generator.
 * Zero external runtime dependencies.
 */

// Code 128 patterns (widths of 3 bars and 3 spaces, total module width 11)
const CODE128_PATTERNS: number[] = [
  0x6cc, 0x66c, 0x666, 0x498, 0x48c, 0x44c, 0x4c8, 0x4c4, 0x464, 0x648,
  0x644, 0x624, 0x59c, 0x4dc, 0x4ce, 0x5dc, 0x4ae, 0x49e, 0x69e, 0x68e,
  0x6ce, 0x76c, 0x71c, 0x73c, 0x76e, 0x71e, 0x73e, 0x78e, 0x7ce, 0x7ac,
  0x7cc, 0x7c6, 0x7ac, 0x718, 0x70c, 0x706, 0x718, 0x70c, 0x706, 0x714,
  0x708, 0x704, 0x678, 0x66c, 0x666, 0x674, 0x668, 0x664, 0x698, 0x68c,
  0x686, 0x6a8, 0x6a4, 0x694, 0x6b8, 0x6b4, 0x6ac, 0x69c, 0x68e, 0x6ce,
  0x748, 0x744, 0x724, 0x538, 0x534, 0x4b8, 0x4b4, 0x494, 0x568, 0x564,
  0x4d8, 0x4d4, 0x4ca, 0x598, 0x594, 0x4ec, 0x4ea, 0x6a4, 0x76c, 0x768,
  0x734, 0x732, 0x758, 0x754, 0x72c, 0x72a, 0x76a, 0x764, 0x74a, 0x744,
  0x754, 0x752, 0x6a4, 0x6b4, 0x6b2, 0x694, 0x692, 0x714, 0x712, 0x628,
  0x624, 0x518, 0x514, 0x468, 0x774, // Stop character: 106 (pattern 106 has 13 modules)
];

const STOP_PATTERN = 0x1b19; // 1100011101011 (13 modules)
const START_B = 104;

/**
 * Encodes ASCII string into SVG path rectangles for Code 128 (Subset B).
 */
export function generateCode128Svg(
  text: string,
  options?: {
    height?: number;
    moduleWidth?: number;
    showText?: boolean;
  }
): string {
  const height = options?.height ?? 60;
  const moduleWidth = options?.moduleWidth ?? 2;
  const showText = options?.showText ?? true;

  // Convert chars to Code 128B values
  const codes: number[] = [START_B];
  let checksum = START_B;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      codes.push(code);
      checksum += code * (i + 1);
    }
  }

  codes.push(checksum % 103);

  // Convert codes to binary module string (1 = bar, 0 = space)
  let modules = '0000000000'; // 10-module quiet zone

  for (const c of codes) {
    const pattern = CODE128_PATTERNS[c] ?? 0x6cc;
    for (let bit = 10; bit >= 0; bit--) {
      modules += (pattern >> bit) & 1 ? '1' : '0';
    }
  }

  // Append STOP pattern (13 modules)
  for (let bit = 12; bit >= 0; bit--) {
    modules += (STOP_PATTERN >> bit) & 1 ? '1' : '0';
  }

  modules += '0000000000'; // Quiet zone

  const totalWidth = modules.length * moduleWidth;
  const totalHeight = showText ? height + 18 : height;

  // Generate SVG bars
  let rects = '';
  let inBar = false;
  let barStart = 0;

  for (let i = 0; i < modules.length; i++) {
    const isBar = modules[i] === '1';
    if (isBar && !inBar) {
      inBar = true;
      barStart = i;
    } else if (!isBar && inBar) {
      inBar = false;
      const w = (i - barStart) * moduleWidth;
      rects += `<rect x="${barStart * moduleWidth}" y="0" width="${w}" height="${height}" fill="#0A1C33" />`;
    }
  }

  if (inBar) {
    const w = (modules.length - barStart) * moduleWidth;
    rects += `<rect x="${barStart * moduleWidth}" y="0" width="${w}" height="${height}" fill="#0A1C33" />`;
  }

  const textElement = showText
    ? `<text x="${totalWidth / 2}" y="${height + 14}" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#0A1C33">${text}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">${rects}${textElement}</svg>`;
}

