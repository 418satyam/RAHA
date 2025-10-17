import { Hospital } from '@/types';

// Utility functions
const toRad = (v: number) => (v * Math.PI) / 180;
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class HospitalsService {
  // Approximate 10 min radius at 30 km/h
  static DEFAULT_SPEED_KMH = 30;
  static DEFAULT_MINUTES = 10;
  static DEFAULT_RADIUS_KM = (HospitalsService.DEFAULT_MINUTES / 60) * HospitalsService.DEFAULT_SPEED_KMH; // ~5 km

  // Overpass API endpoint
  static OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

  static buildOverpassQuery(lat: number, lon: number, radiusMeters: number): string {
    // Search hospitals around the point within radius
    return `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        relation["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      );
      out center tags 50;
    `;
  }

  static extractAddress(tags: Record<string, any> | undefined): string {
    if (!tags) return 'Address not available';
    const parts: string[] = [];
    const hn = tags['addr:housenumber'];
    const street = tags['addr:street'] || tags['addr:road'];
    const area = tags['addr:suburb'] || tags['addr:neighbourhood'];
    const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'];
    const state = tags['addr:state'];
    const pc = tags['addr:postcode'];

    const line1 = [hn, street].filter(Boolean).join(' ');
    const line2 = [area, city].filter(Boolean).join(', ');
    const line3 = [state, pc].filter(Boolean).join(' ');
    const addr = [line1, line2, line3].filter(Boolean).join(', ');

    return addr || tags['addr:full'] || 'Address not available';
  }

  static extractPhone(tags: Record<string, any> | undefined): string | undefined {
    if (!tags) return undefined;
    return tags['contact:phone'] || tags['phone'] || tags['contact:telephone'] || undefined;
  }

  static async getNearbyHospitals(lat: number, lon: number, radiusKm?: number): Promise<Hospital[]> {
    const rKm = typeof radiusKm === 'number' ? radiusKm : HospitalsService.DEFAULT_RADIUS_KM;
    const radiusMeters = Math.max(500, Math.round(rKm * 1000));
    const query = HospitalsService.buildOverpassQuery(lat, lon, radiusMeters);

    const url = `${HospitalsService.OVERPASS_URL}?data=${encodeURIComponent(query)}`;

    const resp = await fetch(url, { method: 'GET' });
    if (!resp.ok) {
      throw new Error(`Overpass API error: ${resp.status}`);
    }
    const data = await resp.json();
    const elements: any[] = Array.isArray(data?.elements) ? data.elements : [];

    const hospitals: Hospital[] = elements
      .map((el) => {
        const id = String(el.id);
        const tags = el.tags || {};
        const name: string = tags.name || 'Hospital';
        const latLng = {
          lat: el.lat ?? el.center?.lat,
          lon: el.lon ?? el.center?.lon,
        };
        if (typeof latLng.lat !== 'number' || typeof latLng.lon !== 'number') return null;

        const distance = haversineDistanceKm(lat, lon, latLng.lat, latLng.lon);
        const address = HospitalsService.extractAddress(tags);
        const phone = HospitalsService.extractPhone(tags) || '+91';

        const h: Hospital = {
          id,
          name,
          address,
          phone,
          distance,
          latitude: latLng.lat,
          longitude: latLng.lon,
        };
        return h;
      })
      .filter(Boolean) as Hospital[];

    // Sort by distance
    hospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return hospitals;
  }
}
