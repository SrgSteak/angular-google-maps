import { LatLngLiteral } from './services/google-maps-types';

// exported map types
export { DataMouseEvent, KmlMouseEvent, LatLngBounds, LatLngBoundsLiteral, LatLngLiteral, MarkerLabel, PolyMouseEvent } from './services/google-maps-types';

/**
 * MouseEvent gets emitted when the user triggers mouse events on the map.
 */
export interface MouseEvent {
  coords: LatLngLiteral;
  placeId?: string;
}
