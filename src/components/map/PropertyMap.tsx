import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';

// Fix leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function PropertyMap({ properties, center, radius, onSelectProperty }: { properties: any[], center: [number, number], radius: number, onSelectProperty: (id: string) => void }) {
  const defaultCenter: [number, number] = [-0.1807, -78.4678];
  const { isFavorited, toggleFavorite } = useFavorites();

  return (
    <div className="w-full h-full relative" style={{ zIndex: 0 }}>
      {/* Global CSS override for Leaflet dark mode popups inside React */}
      <style>{`
        .leaflet-popup-content-wrapper { background: #1E1E1E; color: #fff; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
        .leaflet-popup-tip { background: #1E1E1E; border: 1px solid rgba(255,255,255,0.1); }
        .leaflet-container { background: #121212; }
      `}</style>
      <MapContainer center={defaultCenter} zoom={13} style={{ width: '100%', height: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} zoom={radius > 5000 ? 12 : 14} />
        
        {radius > 0 && <Circle center={center} radius={radius} pathOptions={{ color: '#CFFB01', fillColor: '#CFFB01', fillOpacity: 0.1, weight: 1 }} />}

        <MarkerClusterGroup
          chunkedLoading
          polygonOptions={{
            fillColor: '#CFFB01',
            color: '#CFFB01',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.2
          }}
        >
          {properties.map((prop) => (
            prop.lat && prop.lng && (
              <Marker key={prop.id} position={[prop.lat, prop.lng]}>
                <Popup>
                  <div className="min-w-[150px]">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-electric-lime font-bold text-lg leading-none">${Number(prop.price).toLocaleString()}</div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(prop.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${isFavorited(prop.id) ? "fill-electric-lime text-electric-lime" : "text-gray-400"}`} />
                      </button>
                    </div>
                    <div className="font-bold font-display text-base leading-tight mb-2 ">{prop.title}</div>
                    <div className="text-gray-400 text-xs font-medium mb-3">{prop.rooms} Bed • {prop.bathrooms} Bath</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProperty(prop.id);
                      }}
                      className="w-full bg-white text-kliyvo-black font-bold py-1.5 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
