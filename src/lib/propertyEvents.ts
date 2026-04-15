const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000')

type PropertyEventPayload = {
  propertyId?: string
  propertySlug?: string
  eventType: 'PROPERTY_OPENED' | 'CONTACT_CLICKED' | 'BOOKING_CLICKED'
  page?: string
}

export function trackPropertyEvent(payload: PropertyEventPayload) {
  void fetch(`${API_BASE_URL}/api/property-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => undefined)
}
