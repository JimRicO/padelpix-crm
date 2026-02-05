// Normalize country names to a standard format
const COUNTRY_ALIASES: Record<string, string> = {
  'usa': 'United States',
  'u.s.a.': 'United States',
  'u.s.a': 'United States',
  'u.s.': 'United States',
  'us': 'United States',
  'united states of america': 'United States',
  'uk': 'United Kingdom',
  'u.k.': 'United Kingdom',
  'great britain': 'United Kingdom',
  'england': 'United Kingdom',
  'rsa': 'South Africa',
  'za': 'South Africa',
  'sa': 'South Africa',
};

/**
 * Normalizes a country name to its standard form.
 * E.g., "USA" → "United States", "UK" → "United Kingdom"
 */
export function normalizeCountry(country: string | null | undefined): string | null {
  if (!country) return null;
  
  const trimmed = country.trim();
  const lower = trimmed.toLowerCase();
  
  // Check if it's an alias that needs normalization
  if (COUNTRY_ALIASES[lower]) {
    return COUNTRY_ALIASES[lower];
  }
  
  // Return original with proper casing if no alias found
  return trimmed;
}

/**
 * Normalizes an array of countries and returns unique values
 */
export function normalizeCountryList(countries: (string | null | undefined)[]): string[] {
  const normalized = countries
    .map(normalizeCountry)
    .filter((c): c is string => c !== null);
  
  return [...new Set(normalized)].sort((a, b) => a.localeCompare(b));
}

/**
 * Checks if two country names refer to the same country
 */
export function countriesMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const normalizedA = normalizeCountry(a);
  const normalizedB = normalizeCountry(b);
  
  if (!normalizedA || !normalizedB) return false;
  return normalizedA.toLowerCase() === normalizedB.toLowerCase();
}
