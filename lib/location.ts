export async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Location access denied or unavailable:', error.message);
        resolve(null);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
