import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function captureReceipt(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      width: 1200,
      height: 1600,
    });
    return photo.base64String ?? null;
  } catch {
    return null;
  }
}

export async function pickFromGallery(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      width: 1200,
      height: 1600,
    });
    return photo.base64String ?? null;
  } catch {
    return null;
  }
}
