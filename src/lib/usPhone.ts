/**
 * US phone number check for the WhatsApp sign-up.
 * Used by both the form (instant feedback) and the API route (the real check).
 *
 * Accepts US numbers in any common format: 9515550123, (951) 555-0123,
 * 951-555-0123, +1 951 555 0123, 1-951-555-0123.
 *
 * Rejects:
 * - numbers from other countries (anything that isn't +1 with 10 digits)
 * - +1 numbers outside the US: Canada and the Caribbean share the +1 code
 * - toll-free and premium-rate numbers, which can't be WhatsApp phones
 * - numbers that can't exist (area or exchange codes starting with 0 or 1)
 */

// Area codes that use +1 but aren't in the US: Canada and the Caribbean
const NON_US_AREA_CODES = new Set([
  // Canada
  "204", "226", "236", "249", "250", "263", "289", "306", "343", "354", "365", "367",
  "368", "382", "403", "416", "418", "428", "431", "437", "438", "450", "468", "474",
  "506", "514", "519", "548", "579", "581", "584", "587", "604", "613", "639", "647",
  "672", "683", "705", "709", "742", "753", "778", "780", "782", "807", "819", "825",
  "867", "873", "879", "902", "905", "942",
  // Caribbean and Bermuda
  "242", "246", "264", "268", "284", "345", "441", "473", "649", "658", "664", "721",
  "758", "767", "784", "809", "829", "849", "868", "869", "876",
]);

// Toll-free and premium-rate prefixes
const SERVICE_AREA_CODES = new Set(["800", "833", "844", "855", "866", "877", "888", "900"]);

/** Returns the 10-digit US number, or null if it isn't a valid US number. */
export function normalizeUsPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;

  // NXX-NXX-XXXX: area code and exchange can't start with 0 or 1
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;

  const areaCode = digits.slice(0, 3);
  if (areaCode.endsWith("11")) return null; // 211, 311 ... 911 are service codes
  if (NON_US_AREA_CODES.has(areaCode) || SERVICE_AREA_CODES.has(areaCode)) return null;

  return digits;
}

/** "9515550123" becomes "+1 (951) 555-0123" */
export function formatUsPhone(digits: string): string {
  return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
