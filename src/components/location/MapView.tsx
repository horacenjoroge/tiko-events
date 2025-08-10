// src/components/location/MapView.tsx - Location Integration
'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Car, 
  Bus, 
  Walking,
  ExternalLink,
  Share,
  Bookmark
} from 'lucide-react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Venue {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  coordinates?: Coordinates;
  facilities?: string[];
  hours?: {
    open: string;
    close: string;
  };
}

interface MapViewProps {
  venue: Venue;
  showDirections?: boolean;
  showDetails?: boolean;
  height?: string;
}

export function MapView({ 
  venue, 
  showDirections = true, 
  showDetails = true,
  height = "h-64" 
}: MapViewProps) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [travelTimes, setTravelTimes] = useState<{
    driving?: string;
    walking?: string;
    transit?: string;
  }>({});

  useEffect(() => {
    getCurrentLocation();
    if (venue.coordinates && userLocation) {
      calculateTravelTimes();
    }
  }, [venue.coordinates, userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Nairobi coordinates if location access denied
          setUserLocation({ lat: -1.2921, lng: 36.8219 });
        }
      );
    }
  };

  const calculateTravelTimes = () => {
    // In a real implementation, you would use Google Maps Distance Matrix API
    // For now, we'll show mock data
    setTravelTimes({
      driving: '25 mins',
      walking: '1h 30m',
      transit: '45 mins'
    });
  };

  const getGoogleMapsUrl = (mode: 'driving' | 'walking' | 'transit' = 'driving') => {
    if (!venue.coordinates) return '';
    
    const { lat, lng } = venue.coordinates;
    const baseUrl = 'https://www.google.com/maps/dir/';
    const destination = `${lat},${lng}`;
    const travelMode = mode === 'driving' ? '' : `&travelmode=${mode}`;
    
    return `${baseUrl}/${destination}${travelMode}`;
  };

  const handleGetDirections = (mode: 'driving' | 'walking' | 'transit' = 'driving') => {
    const url = getGoogleMapsUrl(mode);
    window.open(url, '_blank');
  };

  const handleShareLocation = async () => {
    const shareData = {
      title: venue.name,
      text: `Check out ${venue.name} at ${venue.address}`,
      url: venue.coordinates ? 
        `https://www.google.com/maps/search/?api=1&query=${venue.coordinates.lat},${venue.coordinates.lng}` :
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareData.url);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Map Container */}
      <div className={`${height} bg-gray-100 relative`}>
        {venue.coordinates ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Interactive map would load here</p>
              <p className="text-sm text-gray-500">
                Lat: {venue.coordinates.lat}, Lng: {venue.coordinates.lng}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Map not available</p>
            </div>
          </div>
        )}
        
        {/* Map Overlay Actions */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleShareLocation}
            className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            <Share className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
            <Bookmark className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Venue Details */}
      {showDetails && (
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{venue.name}</h3>
              <p className="text-gray-600 flex items-start">
                <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                {venue.address}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {venue.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${venue.phone}`} className="text-purple-600 hover:text-purple-700">
                  {venue.phone}
                </a>
              </div>
            )}
            
            {venue.website && (
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <a 
                  href={venue.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Visit Website
                </a>
              </div>
            )}
            
            {venue.hours && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {venue.hours.open} - {venue.hours.close}
                </span>
              </div>
            )}
          </div>

          {/* Facilities */}
          {venue.facilities && venue.facilities.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {venue.facilities.map(facility => (
                  <span 
                    key={facility}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Travel Times */}
          {Object.keys(travelTimes).length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Estimated Travel Time</h4>
              <div className="grid grid-cols-3 gap-3">
                {travelTimes.driving && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Car className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">{travelTimes.driving}</div>
                    <div className="text-xs text-gray-500">Driving</div>
                  </div>
                )}
                {travelTimes.transit && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bus className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">{travelTimes.transit}</div>
                    <div className="text-xs text-gray-500">Transit</div>
                  </div>
                )}
                {travelTimes.walking && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Walking className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">{travelTimes.walking}</div>
                    <div className="text-xs text-gray-500">Walking</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Directions Buttons */}
          {showDirections && venue.coordinates && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleGetDirections('driving')}
                className="btn btn-primary flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </button>
              <button
                onClick={() => handleGetDirections('transit')}
                className="btn btn-outline flex-1"
              >
                <Bus className="w-4 h-4 mr-2" />
                Public Transport
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// src/components/location/LocationPicker.tsx - For event creation
interface LocationPickerProps {
  onLocationSelect: (location: { address: string; coordinates?: Coordinates }) => void;
  initialLocation?: string;
}

export function LocationPicker({ onLocationSelect, initialLocation = '' }: LocationPickerProps) {
  const [address, setAddress] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock locations for Kenya - in real app, use Google Places API
  const kenyanLocations = [
    'KICC, Nairobi',
    'Carnivore Restaurant, Nairobi',
    'Strathmore University, Nairobi',
    'Naro Moru Gate, Mt. Kenya',
    'Mombasa Sports Club, Mombasa',
    'Kisumu Imperial Hotel, Kisumu',
    'Nakuru Athletic Club, Nakuru',
    'Safari Park Hotel, Nairobi',
    'Karen Blixen Coffee Garden, Nairobi',
    'Two Rivers Mall, Nairobi'
  ];

  const handleAddressChange = (value: string) => {
    setAddress(value);
    
    if (value.length > 2) {
      const filtered = kenyanLocations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setSuggestions([]);
    
    // In real implementation, geocode the address to get coordinates
    onLocationSelect({
      address: selectedAddress,
      coordinates: { lat: -1.2921, lng: 36.8219 } // Mock coordinates
    });
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // In real implementation, reverse geocode to get address
          const mockAddress = `Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
          setAddress(mockAddress);
          onLocationSelect({
            address: mockAddress,
            coordinates: coords
          });
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <label className="form-label">Event Location</label>
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter venue address..."
            className="form-input pl-10"
          />
          
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="btn btn-outline whitespace-nowrap"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Use Current
            </>
          )}
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        Enter the venue address or use your current location
      </p>
    </div>
  );
}