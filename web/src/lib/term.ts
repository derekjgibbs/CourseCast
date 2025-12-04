/**
 * Term suffix codes representing academic semesters.
 * A = Spring, B = Summer, C = Fall
 */
const enum TermSuffix {
  Spring = "A",
  Summer = "B",
  Fall = "C",
}

export function termSuffixToNumber(suffix: TermSuffix) {
  switch (suffix) {
    case TermSuffix.Spring:
      return 0;
    case TermSuffix.Summer:
      return 1;
    case TermSuffix.Fall:
      return 2;
  }
}

/**
 * Represents a parsed term with year and suffix components.
 */
interface Term {
  year: number;
  suffix: TermSuffix;
}

/** Terms with available course data files */
export const enum SupportedTerm {
  Fall2025 = "2025C",
}

/** The current active term for new scenarios */
export const CURRENT_TERM = SupportedTerm.Fall2025;

/**
 * Returns the byte length of the parquet file for a term.
 * HACK: Hard-coded because the library needs to know this ahead of time.
 * Vercel CDN doesn't provide Content-Length headers via HEAD requests.
 */
export function getTermByteLength(term: SupportedTerm) {
  switch (term) {
    case SupportedTerm.Fall2025:
      return 98826;
  }
}

/** Validates and narrows a string to a SupportedTerm */
export function toSupportedTerm(term: string): SupportedTerm {
  switch (term) {
    case SupportedTerm.Fall2025:
      return term;
  }
  throw new Error(`Unsupported term: ${term}`);
}

/**
 * Parses a term string into its components.
 * @throws Error if the term string is invalid
 */
function parseTerm(termString: string) {
  if (termString.length !== 5) throw new Error(`Invalid term format: ${termString}`);

  const year = Number.parseInt(termString.slice(0, 4), 10);
  if (Number.isNaN(year)) throw new Error(`Invalid year in term: ${termString}`);

  const suffix = termString.charAt(4);
  switch (suffix) {
    case TermSuffix.Spring:
    case TermSuffix.Summer:
    case TermSuffix.Fall:
      return { year, suffix } as Term;
    default:
      throw new Error(`Invalid term suffix: ${suffix}`);
  }
}

/**
 * Returns a human-readable label for a term.
 * Example: "2025C" -> "Fall 2025"
 */
export function getTermLabel(termString: string) {
  const term = parseTerm(termString);

  let semesterName: "Spring" | "Summer" | "Fall";
  switch (term.suffix) {
    case TermSuffix.Spring:
      semesterName = "Spring";
      break;
    case TermSuffix.Summer:
      semesterName = "Summer";
      break;
    case TermSuffix.Fall:
      semesterName = "Fall";
      break;
    default:
      throw new Error(`Invalid term suffix: ${term.suffix}`);
  }

  return `${semesterName} ${term.year}`;
}

/**
 * Compares two terms for sorting (descending order - newest first).
 * Returns negative if a > b, positive if a < b, zero if equal.
 */
export function compareTermsDescending(a: string, b: string) {
  const termA = parseTerm(a);
  const termB = parseTerm(b);

  if (termA.year !== termB.year) return termB.year - termA.year;

  // Suffix order: C (Fall) > B (Summer) > A (Spring)
  return termSuffixToNumber(termB.suffix) - termSuffixToNumber(termA.suffix);
}
