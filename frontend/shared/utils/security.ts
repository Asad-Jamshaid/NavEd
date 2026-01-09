// ==========================================
// Security Utilities
// Functions for sanitizing user input to prevent XSS attacks
// ==========================================

/**
 * Escape HTML special characters to prevent XSS
 * Escapes: < > & " '
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape JavaScript string for use in template literals
 * Escapes: \ ' " ` $ { }
 */
export function escapeJsString(unsafe: string): string {
  return unsafe
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

/**
 * Sanitize XML content by removing all tags and entities
 * More thorough than simple regex replacement
 */
export function sanitizeXml(xml: string): string {
  // First, decode common XML entities
  let text = xml
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

  // Remove all XML tags
  text = text.replace(/<[^>]+>/g, '');

  // Remove any remaining XML processing instructions
  text = text.replace(/<\?[^?]+\?>/g, '');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

