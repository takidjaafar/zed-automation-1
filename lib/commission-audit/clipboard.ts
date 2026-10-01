/**
 * Clipboard helper shared by the share dialog (Feature 3) and the email
 * template generator (Feature 6).
 *
 * Uses the async Clipboard API when available and falls back to the legacy
 * `execCommand('copy')` path for non-secure origins and older browsers.
 */

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (clipboard?.writeText) {
      await clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    if (typeof document === 'undefined') return false;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
