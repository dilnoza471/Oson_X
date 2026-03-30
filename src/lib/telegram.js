export function isInsideTelegram() {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData);
}

export function openTelegramLink(url) {
  if (isInsideTelegram()) {
    try {
      window.Telegram.WebApp.openTelegramLink(url);
      return;
    } catch (error) {
      console.warn('Telegram link open failed, falling back to window.open', error);
    }
  }

  window.open(url, '_blank', 'noreferrer');
}

export function initTelegramWebApp() {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
    return;
  }

  try {
    if (typeof window.Telegram.WebApp.ready === 'function') {
      window.Telegram.WebApp.ready();
    }
    if (typeof window.Telegram.WebApp.expand === 'function') {
      window.Telegram.WebApp.expand();
    }
  } catch (error) {
    console.warn('Telegram WebApp initialization failed', error);
  }
}
