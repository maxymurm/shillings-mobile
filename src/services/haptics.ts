import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export async function hapticSuccess(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch { /* web fallback — no haptics */ }
}

export async function hapticLight(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* web fallback */ }
}

export async function hapticWarning(): Promise<void> {
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch { /* web fallback */ }
}
