import { Preferences } from '@capacitor/preferences';

let biometricAvailable = false;

export async function checkBiometricAvailability(): Promise<boolean> {
  try {
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
    const result = await BiometricAuth.checkBiometry();
    biometricAvailable = result.isAvailable;
    return biometricAvailable;
  } catch {
    biometricAvailable = false;
    return false;
  }
}

export function isBiometricAvailable(): boolean {
  return biometricAvailable;
}

export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
    await BiometricAuth.authenticate({
      reason: 'Unlock Shillings',
      cancelTitle: 'Use Password',
    });
    return true;
  } catch {
    return false;
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  const { value } = await Preferences.get({ key: 'biometric_enabled' });
  return value === 'true';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await Preferences.set({ key: 'biometric_enabled', value: String(enabled) });
}
