/**
 * URL-Miner // URL Extraction & Sanitization Utilities
 */

export function sanitizeUrl(rawUrl, { removeTrailingSlash = false, stripUtm = false } = {}) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Strip trailing punctuation common in prose, markdown or code
  url = url.replace(/[.,;:!?)\]}'"`]+$/, '');

  // Normalize www. to https://www.
  if (/^www\./i.test(url)) {
    url = 'https://' + url;
  }

  // Remove trailing slash if configured (unless it's just http:// or https://)
  if (removeTrailingSlash && url.endsWith('/') && !/^https?:\/\/[^/]+\/$/.test(url)) {
    url = url.slice(0, -1);
  }

  // Strip tracking parameters if configured
  if (stripUtm && url.includes('?')) {
    try {
      const u = new URL(url);
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid', '_hsenc', '_hsmi', 'ref'
      ];
      trackingParams.forEach(p => u.searchParams.delete(p));
      url = u.toString();
    } catch {
      // In case of invalid URL object, keep original sanitized string
    }
  }

  return url;
}

export function extractUrls(text, options = {}) {
  if (!text || typeof text !== 'string') return [];

  const {
    includeWww = true,
    removeTrailingSlash = false,
    stripUtm = false,
    domainFilter = ''
  } = options;

  // Regex to match URLs starting with http://, https:// or optionally www.
  const regex = includeWww
    ? /((?:https?:\/\/|www\.)[^\s<>'"`]+)/gi
    : /(https?:\/\/[^\s<>'"`]+)/gi;

  const rawMatches = text.match(regex) || [];

  const sanitized = rawMatches
    .map(match => sanitizeUrl(match, { removeTrailingSlash, stripUtm }))
    .filter(url => url && url.length > 3);

  // Filter by domain/keyword if provided
  if (domainFilter && domainFilter.trim() !== '') {
    const filterLower = domainFilter.trim().toLowerCase();
    return sanitized.filter(url => url.toLowerCase().includes(filterLower));
  }

  return sanitized;
}
