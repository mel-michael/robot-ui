import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L, { type LatLngExpression } from 'leaflet';

import { POLYGON } from '../config/polygon';

export const MapBoundsHandler: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(POLYGON as LatLngExpression[]);
    map.fitBounds(bounds.pad(0.2)); // small padding around polygon
  }, [map]);
  return null;
};
