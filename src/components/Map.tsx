// At the top of src/components/Map.tsx
import 'leaflet-draw/dist/leaflet.draw.css';

// src/components/Map.tsx
"use client";

import { MapContainer, TileLayer, FeatureGroup, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useDashboardStore } from '../lib/store';// Adjust path if needed

// Leaflet's default icon breaks in Next.js, so we fix it
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});


export default function Map() {
  // Get the state and actions from our store
  const { polygons, addPolygon } = useDashboardStore();

  const handlePolygonCreated = (e: any) => {
    const { layer } = e;
    const points = layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng]);
    
    // Use our action to add the new polygon to the global state
    addPolygon(points);
  };

  return (
    <MapContainer
      center={[28.6139, 77.2090]} // Default center (e.g., New Delhi)
      zoom={11}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* This component holds the drawn layers and the drawing controls */}
      <FeatureGroup>
        <EditControl
          position="topright"
          onCreated={handlePolygonCreated}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              shapeOptions: {
                color: "#805ad5", // Purple
              },
            },
          }}
          edit={{
            featureGroup: new L.FeatureGroup(
                polygons.map(p => L.polygon(p.points))
            )
          }}
        />
      </FeatureGroup>

      {/* Render all polygons from our store */}
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.points}
          pathOptions={{ color: "purple" }} // Temporary color
        />
      ))}
    </MapContainer>
  );
}