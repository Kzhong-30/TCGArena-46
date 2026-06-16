"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PropertyWithDetails } from "@/types";
import PropertyCard from "@/components/PropertyCard";
import { MapPin, Loader2 } from "lucide-react";

const DEFAULT_CENTER: [number, number] = [31.2304, 121.4737];
const DEFAULT_ZOOM = 12;

interface PropertyMapProps {
  properties: PropertyWithDetails[];
  isLoading: boolean;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createPriceIcon = (price: number) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
      <span>¥${price.toLocaleString()}</span>
    </div>`,
    iconSize: [100, 36],
    iconAnchor: [50, 36],
    popupAnchor: [0, -40],
  });
};

function MapBoundsController({
  bounds,
}: {
  bounds: [[number, number], [number, number]] | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  return null;
}

export default function PropertyMap({
  properties,
  isLoading,
}: PropertyMapProps) {
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, []);

  const getBounds = () => {
    if (properties.length === 0) return undefined;

    const validProperties = properties.filter(
      (p) => p.latitude !== null && p.longitude !== null
    );

    if (validProperties.length === 0) return undefined;

    const latitudes = validProperties.map((p) => Number(p.latitude));
    const longitudes = validProperties.map((p) => Number(p.longitude));

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const padding = 0.02;
    return [
      [minLat - padding, minLng - padding],
      [maxLat + padding, maxLng + padding],
    ] as [[number, number], [number, number]];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-500">加载地图中...</p>
        </div>
      </div>
    );
  }

  const validProperties = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null
  );

  if (properties.length > 0 && validProperties.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <MapPin className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700">
            暂无位置信息
          </h3>
          <p className="text-gray-500">
            当前筛选的房源暂无经纬度信息，无法在地图上显示
          </p>
        </div>
      </div>
    );
  }

  const bounds = getBounds();

  return (
    <div className="relative h-full min-h-[600px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        key={mapKey}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%", minHeight: "600px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsController bounds={bounds} />

        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[Number(property.latitude), Number(property.longitude)]}
            icon={createPriceIcon(property.price)}
          >
            <Popup maxWidth={350} minWidth={350}>
              <div className="p-2">
                <PropertyCard
                  property={property}
                  showActions={false}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {validProperties.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            共 <span className="font-semibold text-blue-600">{validProperties.length}</span> 套房源
          </p>
        </div>
      )}
    </div>
  );
}
