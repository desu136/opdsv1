'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Store, Navigation, MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

interface TrackingMapProps {
  pharmacyLoc: Location;
  customerLoc: Location;
  agentLoc?: Location | null;
}

// Custom icons using Lucide rendered to SVG strings
const createCustomIcon = (iconSvgString: string, colorClass: string, bgClass: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        width: 36px; 
        height: 36px; 
        background-color: ${bgClass}; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        ${iconSvgString}
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent; 
        border-right: 6px solid transparent; 
        border-top: 8px solid ${bgClass}; 
        margin: -2px auto 0;
      "></div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

const PharmacyIcon = createCustomIcon(
  renderToString(<Store size={18} color="white" />),
  'text-white',
  '#0f172a' // slate-900
);

const AgentIcon = createCustomIcon(
  renderToString(<Navigation size={18} color="white" />),
  'text-white',
  '#2563eb' // primary-600
);

const CustomerIcon = createCustomIcon(
  renderToString(<MapPin size={18} color="white" />),
  'text-white',
  '#22c55e' // green-500
);

// Component to handle auto-fitting bounds based on markers
function MapBoundsFit({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
       const bounds = L.latLngBounds(positions);
       map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, positions]);
  return null;
}

export default function TrackingMap({ pharmacyLoc, customerLoc, agentLoc }: TrackingMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-3xl">
        <span className="text-slate-400 font-medium text-sm">Loading Live Map...</span>
      </div>
    );
  }

  // Determine path and all valid positions
  const pathPositions: [number, number][] = [];
  const allPositions: [number, number][] = [];

  // Always have pharmacy
  if (pharmacyLoc.lat && pharmacyLoc.lng) {
    const p: [number, number] = [pharmacyLoc.lat, pharmacyLoc.lng];
    pathPositions.push(p);
    allPositions.push(p);
  }

  // If agent exists, route goes through agent
  if (agentLoc?.lat && agentLoc?.lng) {
    const a: [number, number] = [agentLoc.lat, agentLoc.lng];
    pathPositions.push(a);
    allPositions.push(a);
  }

  // Always end at customer
  if (customerLoc.lat && customerLoc.lng) {
    const c: [number, number] = [customerLoc.lat, customerLoc.lng];
    pathPositions.push(c);
    allPositions.push(c);
  }

  // Fallback center if everything is missing
  const defaultCenter: [number, number] = allPositions.length > 0 ? allPositions[0] : [9.02, 38.74]; // Addis Ababa fallback

  return (
    <div className="w-full h-full relative z-0 rounded-3xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapBoundsFit positions={allPositions} />

        {/* Path Line */}
        {pathPositions.length > 1 && (
          <Polyline 
            positions={pathPositions} 
            pathOptions={{ color: '#2563eb', weight: 4, dashArray: '10, 10', opacity: 0.6 }} 
          />
        )}

        {/* Pharmacy Marker */}
        {pharmacyLoc.lat && pharmacyLoc.lng && (
          <Marker position={[pharmacyLoc.lat, pharmacyLoc.lng]} icon={PharmacyIcon}>
            <Popup className="font-sans font-bold text-slate-800">
              {pharmacyLoc.name || 'Pharmacy'}
            </Popup>
          </Marker>
        )}

        {/* Agent Marker */}
        {agentLoc?.lat && agentLoc?.lng && (
          <Marker position={[agentLoc.lat, agentLoc.lng]} icon={AgentIcon}>
            <Popup className="font-sans font-bold text-primary-700">
              Delivery Agent<br/>
              <span className="text-xs font-normal text-slate-500">Currently Here</span>
            </Popup>
          </Marker>
        )}

        {/* Customer Marker */}
        {customerLoc.lat && customerLoc.lng && (
          <Marker position={[customerLoc.lat, customerLoc.lng]} icon={CustomerIcon}>
            <Popup className="font-sans font-bold text-green-700">
              Delivery Destination
            </Popup>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}
