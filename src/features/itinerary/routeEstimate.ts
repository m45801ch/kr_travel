export interface Coordinates { latitude: number; longitude: number }
export interface RouteEstimate { distanceKm: number; walkMinutes: number }

export function estimateRoute(from: Coordinates, to: Coordinates): RouteEstimate {
  const earthRadiusKm = 6371
  const latitudeDelta = (to.latitude - from.latitude) * Math.PI / 180
  const longitudeDelta = (to.longitude - from.longitude) * Math.PI / 180
  const latitude1 = from.latitude * Math.PI / 180
  const latitude2 = to.latitude * Math.PI / 180
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2
  const distanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return { distanceKm: Math.round(distanceKm * 10) / 10, walkMinutes: Math.max(1, Math.round(distanceKm / 4.5 * 60)) }
}

export function formatRouteEstimate(estimate: RouteEstimate, nextName: string): string {
  return `距${nextName}約 ${estimate.distanceKm} km · 步行約 ${estimate.walkMinutes} 分`
}
