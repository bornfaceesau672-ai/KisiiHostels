/**
 * Security utilities to protect the application from common vulnerabilities like XSS.
 */

/**
 * Sanitizes input text to strip HTML tags and prevent XSS (Cross-Site Scripting) injections.
 * Standard React handles escaping naturally, but this cleans raw input values as an extra layer of defense.
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    // Replace html tags (anything between < and >)
    .replace(/<[^>]*>/g, '')
    // Replace script block handlers or event tags (e.g. onerror, onload, javascript:)
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Basic character escape for high risk entities
    .replace(/'/g, '&#x27;')
    .replace(/"/g, '&quot;')
    .trim();
}
