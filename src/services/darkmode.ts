import { Capacitor } from '@capacitor/core';

export function setupDarkMode(): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  applyDarkMode(prefersDark.matches);
  prefersDark.addEventListener('change', (e) => applyDarkMode(e.matches));
}

function applyDarkMode(isDark: boolean): void {
  document.body.classList.toggle('dark', isDark);
}
