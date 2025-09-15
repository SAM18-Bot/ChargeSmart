'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Charger } from '@/lib/types';
import { Users, Navigation, Loader2, Crosshair } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MapViewProps {
  chargers: Charger[];
}

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '0.8rem'
};

const defaultCenter = {
  lat: 18.5204,
  lng: 73.8567
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#7c93a3" },
        { "lightness": "-10" }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry",
      "stylers": [
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#a0a4a5" }
      ]
    },
    {
      "featureType": "administrative.province",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#62838e" }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#f2f5f6" }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.stroke",
      "stylers": [
        { "color": "#a0a4a5" }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
        { "saturation": -100 },
        { "lightness": 45 },
        { "visibility": "simplified" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#ffffff" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#7c93a3" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [
        { "visibility": "simplified" }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        { "color": "#e5e5e5" }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text",
      "stylers": [
        { "color": "#7c93a3" }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
        { "color": "#dde6e8" },
        { "visibility": "on" }
      ]
    }
  ]
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function MapView({ chargers }: MapViewProps) {
  const [center, setCenter] = useState(defaultCenter);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: API_KEY,
  });

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(newCenter);
          if (mapRef.current) {
            mapRef.current.panTo(newCenter);
            mapRef.current.setZoom(14);
          }
        },
        () => {
          // Handle error or user denial
          alert("Could not get your location. Please enable location services in your browser.");
        }
      );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    // We still try to locate on initial load for a better user experience
    handleLocateMe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkerClick = (charger: Charger) => {
    setSelectedCharger(charger);
    if(mapRef.current) {
        mapRef.current.panTo({ lat: charger.lat, lng: charger.lng });
    }
  };

  const handleDirectionsClick = (charger: Charger) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${charger.lat},${charger.lng}`;
    window.open(url, '_blank');
  };

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const onUnmount = () => {
    mapRef.current = null;
  };

  if (loadError) {
    return <Card><CardContent className="p-4"><p className='text-destructive'>Error loading maps. Please check the API key.</p></CardContent></Card>;
  }

  if (!API_KEY) {
    return <Card><CardContent className="p-4"><p className='text-destructive'>Google Maps API Key is missing.</p></CardContent></Card>;
  }

  return (
    <Card className="overflow-hidden shadow-lg aspect-square relative">
      <CardContent className="p-0 h-full w-full">
        {isLoaded ? (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute top-3 right-3 z-10 bg-background/80 hover:bg-background"
                    onClick={handleLocateMe}
                    aria-label="Locate me"
                    >
                        <Crosshair className="h-5 w-5 text-foreground" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Locate stations near me</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              options={mapOptions}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {chargers.map(charger => (
                <MarkerF
                  key={charger.id}
                  position={{ lat: charger.lat, lng: charger.lng }}
                  onClick={() => handleMarkerClick(charger)}
                  title={charger.name}
                  icon={{
                    path: 'M13 10V3L4 14h7v7l9-11h-7z',
                    fillColor: charger.status === 'Available' ? '#4ade80' : '#facc15',
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: '#000000',
                    scale: 1.5,
                    anchor: new window.google.maps.Point(12, 12),
                  }}
                />
              ))}

              {selectedCharger && (
                <InfoWindowF
                  position={{ lat: selectedCharger.lat, lng: selectedCharger.lng }}
                  onCloseClick={() => setSelectedCharger(null)}
                  options={{
                      pixelOffset: new window.google.maps.Size(0, -30)
                  }}
                >
                  <div className="p-2 font-body max-w-xs">
                    <h3 className="font-bold font-headline text-lg mb-2">{selectedCharger.name}</h3>
                    <div className='flex justify-between items-center mb-3'>
                      <Badge className={selectedCharger.status === 'Available' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}>
                          {selectedCharger.status}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-1 h-4 w-4" /> {selectedCharger.queue.length} in queue
                      </div>
                    </div>
                    <Button onClick={() => handleDirectionsClick(selectedCharger)} className="w-full">
                      <Navigation className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          </>
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
