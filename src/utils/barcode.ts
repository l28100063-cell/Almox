/**
 * Barcode utilities: EAN-13 check digit calculation, generator, and Code 128 SVG patterns.
 */

/**
 * Calculates the EAN-13 check digit for the first 12 digits using standard Modulo 10.
 */
export function calculateEan13CheckDigit(first12Digits: string): number {
  if (!/^\d{12}$/.test(first12Digits)) {
    throw new Error('EAN-13 requer os primeiros 12 dígitos numéricos');
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12Digits[i], 10);
    // Even indexes (0, 2, 4...) have weight 1; odd indexes (1, 3, 5...) have weight 3
    sum += i % 2 === 0 ? digit * 1 : digit * 3;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Validates whether a barcode is a valid EAN-13 barcode (13 digits with matching check digit).
 */
export function isValidEan13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;
  const first12 = barcode.slice(0, 12);
  const expectedCheck = calculateEan13CheckDigit(first12);
  return parseInt(barcode[12], 10) === expectedCheck;
}

/**
 * Generates a valid random Brazilian EAN-13 barcode (starts with 789 or 790).
 */
export function generateRandomEan13(): string {
  const prefix = Math.random() > 0.5 ? '789' : '790';
  let body = prefix;
  for (let i = 0; i < 9; i++) {
    body += Math.floor(Math.random() * 10).toString();
  }
  const checkDigit = calculateEan13CheckDigit(body);
  return body + checkDigit.toString();
}

/**
 * Auto-generates a clean internal SKU / product code (e.g. PRD-1042).
 */
export function generateProductCode(existingCodes: string[]): string {
  const prefix = 'PRD-';
  let nextNumber = existingCodes.length + 1;
  let code = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  
  while (existingCodes.includes(code)) {
    nextNumber++;
    code = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
  return code;
}

/**
 * Code 128 Encoding Table for Subset B (ASCII 32 to 126).
 * Each character is represented by 6 alternating bar/space widths (summing to 11 modules).
 * Format: widths array [bar, space, bar, space, bar, space].
 */
const CODE128_PATTERNS: number[][] = [
  [2,1,2,2,2,2], [2,2,2,1,2,2], [2,2,2,2,2,1], [1,2,1,2,2,3], [1,2,1,3,2,2], // 0-4
  [1,3,1,2,2,2], [1,2,2,2,1,3], [1,2,2,3,1,2], [1,3,2,2,1,2], [2,2,1,2,1,3], // 5-9
  [2,2,1,3,1,2], [2,3,1,2,1,2], [1,1,2,2,3,2], [1,2,2,1,3,2], [1,2,2,2,3,1], // 10-14
  [1,1,3,2,2,2], [1,2,3,1,2,2], [1,2,3,2,2,1], [2,2,3,2,1,1], [2,2,1,1,3,2], // 15-19
  [2,2,1,2,3,1], [2,1,3,2,1,2], [2,2,3,1,1,2], [3,1,2,1,3,1], [3,1,1,2,2,2], // 20-24
  [3,2,1,1,2,2], [3,2,1,2,2,1], [3,1,2,2,1,2], [3,2,2,1,1,2], [3,2,2,2,1,1], // 25-29
  [2,1,2,1,2,3], [2,1,2,3,2,1], [2,3,2,1,2,1], [1,1,1,3,2,3], [1,3,1,1,2,3], // 30-34
  [1,3,1,3,2,1], [1,1,2,3,1,3], [1,3,2,1,1,3], [1,3,2,3,1,1], [2,1,1,3,1,3], // 35-39
  [2,3,1,1,1,3], [2,3,1,3,1,1], [1,1,2,1,3,3], [1,1,2,3,3,1], [1,3,2,1,3,1], // 40-44
  [1,1,3,1,2,3], [1,1,3,3,2,1], [1,3,3,1,2,1], [3,1,3,1,2,1], [2,1,1,3,3,1], // 45-49
  [2,3,1,1,3,1], [2,1,3,1,1,3], [2,1,3,3,1,1], [2,1,3,1,3,1], [3,1,1,1,2,3], // 50-54
  [3,1,1,3,2,1], [3,3,1,1,2,1], [3,1,2,1,1,3], [3,1,2,3,1,1], [3,3,2,1,1,1], // 55-59
  [3,1,4,1,1,1], [2,2,1,4,1,1], [4,3,1,1,1,1], [1,1,1,2,2,4], [1,1,1,4,2,2], // 60-64
  [1,2,1,1,2,4], [1,2,1,4,2,1], [1,4,1,1,2,2], [1,4,1,2,2,1], [1,1,2,2,1,4], // 65-69
  [1,1,2,4,1,2], [1,2,2,1,1,4], [1,2,2,4,1,1], [1,4,2,1,1,2], [1,4,2,2,1,1], // 70-74
  [2,4,1,2,1,1], [2,2,1,1,1,4], [4,1,3,1,1,1], [2,4,1,1,1,2], [1,3,4,1,1,1], // 75-79
  [1,1,1,2,4,2], [1,2,1,1,4,2], [1,2,1,2,4,1], [1,1,4,2,1,2], [1,2,4,1,1,2], // 80-84
  [1,2,4,2,1,1], [4,1,1,2,1,2], [4,2,1,1,1,2], [4,2,1,2,1,1], [2,1,2,1,4,1], // 85-89
  [2,1,4,1,2,1], [4,1,2,1,2,1], [1,1,1,1,4,3], [1,1,1,3,4,1], [1,3,1,1,4,1], // 90-94
  [1,1,4,1,1,3], [1,1,4,3,1,1], [4,1,1,1,1,3], [4,1,1,3,1,1], [1,1,3,1,4,1], // 95-99
  [1,1,4,1,3,1], [3,1,1,1,4,1], [4,1,1,1,3,1], [2,1,1,4,1,2], [2,1,1,2,1,4], // 100-104
  [2,1,1,2,3,2], // 105: Start B
];

// Stop pattern: [2,3,3,1,1,1,2] (7 widths)
const CODE128_STOP_PATTERN = [2,3,3,1,1,1,2];

export interface BarcodeBar {
  x: number;
  width: number;
  isBar: boolean;
}

/**
 * Encodes text into Code 128 (Subset B) bars and spaces.
 * Returns array of rectangles (x position and width in modules) for SVG rendering.
 */
export function encodeCode128(text: string): { bars: BarcodeBar[]; totalWidth: number } {
  // Fallback to text or default if empty
  const sanitized = text ? text.replace(/[^\x20-\x7E]/g, '') : '000000';
  const cleanText = sanitized.length > 0 ? sanitized : '000000';

  const START_B = 104; // Index 104 in standard Code 128 is Start B
  let checksum = START_B;
  const indices: number[] = [START_B];

  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    const index = charCode - 32;
    if (index >= 0 && index <= 95) {
      indices.push(index);
      checksum += index * (i + 1);
    }
  }

  const checkDigitIndex = checksum % 103;
  indices.push(checkDigitIndex);

  // Convert pattern widths to bars
  const bars: BarcodeBar[] = [];
  let currentX = 10; // quiet zone at start

  // Encode symbols
  for (const index of indices) {
    const pattern = CODE128_PATTERNS[index];
    if (!pattern) continue;

    for (let p = 0; p < pattern.length; p++) {
      const w = pattern[p];
      const isBar = p % 2 === 0;
      bars.push({
        x: currentX,
        width: w,
        isBar
      });
      currentX += w;
    }
  }

  // Encode STOP symbol
  for (let p = 0; p < CODE128_STOP_PATTERN.length; p++) {
    const w = CODE128_STOP_PATTERN[p];
    const isBar = p % 2 === 0;
    bars.push({
      x: currentX,
      width: w,
      isBar
    });
    currentX += w;
  }

  // Final quiet zone
  currentX += 10;

  return {
    bars: bars.filter(b => b.isBar),
    totalWidth: currentX
  };
}
