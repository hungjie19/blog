// Small status toast under the topbar (styles: `.toast` in src/styles/global.css).
// One element is reused; a new message restarts the timer.

const VISIBLE_MS = 1600;
let timer: number | undefined;

// Lucide-style stroke icons, same look as the topbar buttons
const ICON_PATHS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  sun:
    '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>' +
    '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
    '<line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' +
    '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
} as const;

export type ToastIcon = keyof typeof ICON_PATHS;

/** `check` is tinted with the success colour; state icons (sun / moon) keep the text colour. */
export function showToast(message: string, icon?: ToastIcon) {
  let toast = document.querySelector<HTMLDivElement>('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.replaceChildren();
  if (icon) {
    const iconEl = document.createElement('span');
    iconEl.className = icon === 'check' ? 'toast-icon toast-icon--success' : 'toast-icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.innerHTML =
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[icon]}</svg>`;
    toast.appendChild(iconEl);
  }
  toast.appendChild(document.createTextNode(message));
  toast.classList.add('is-visible');
  clearTimeout(timer);
  timer = window.setTimeout(() => toast.classList.remove('is-visible'), VISIBLE_MS);
}

// navigator.clipboard only exists in secure contexts (https / localhost). Over plain http
// (e.g. the dev server reached through a Tailscale IP) fall back to execCommand('copy').
function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  textarea.remove();
  return ok;
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // permission denied etc. → try the legacy path below
    }
  }
  return legacyCopy(text);
}

/** Copy text and confirm with a toast. Resolves false when both clipboard paths fail. */
export async function copyWithToast(text: string, message: string): Promise<boolean> {
  const copied = await copyText(text);
  if (copied) showToast(message, 'check');
  return copied;
}
