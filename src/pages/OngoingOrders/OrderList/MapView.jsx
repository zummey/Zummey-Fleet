import React, { useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default center (Benin City, Nigeria)
const defaultCenter = {
  lat: 6.3350,
  lng: 5.6037,
};

/**
 * MapView Component
 * Displays Google Maps with markers for ongoing orders
 * Supports click-to-focus from order cards
 */
const MapView = ({ orders, selectedOrderId, isLoading }) => {
  const mapRef = useRef(null);
  const [directions, setDirections] = React.useState(null);

  // Use useJsApiLoader instead of LoadScript to prevent re-loading
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    id: 'google-map-script', // Important: prevents multiple loads
  });

  // Handle map load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    console.log('🗺️ Map loaded!');
    
    // If we already have a selected order, focus it immediately
    if (selectedOrderId && orders.length > 0) {
      console.log('🎯 Map loaded with selected order, focusing now...');
      const selectedOrder = orders.find(order => order.id === selectedOrderId);
      
      if (selectedOrder && selectedOrder.pickupLocation.lat && selectedOrder.destination.lat) {
        console.log('✅ Selected order has coordinates:', {
          pickup: { lat: selectedOrder.pickupLocation.lat, lng: selectedOrder.pickupLocation.lng },
          destination: { lat: selectedOrder.destination.lat, lng: selectedOrder.destination.lng }
        });
        
        const bounds = new window.google.maps.LatLngBounds();
        
        bounds.extend({
          lat: selectedOrder.pickupLocation.lat,
          lng: selectedOrder.pickupLocation.lng,
        });
        
        bounds.extend({
          lat: selectedOrder.destination.lat,
          lng: selectedOrder.destination.lng,
        });
        
        map.fitBounds(bounds);
        
        // Set zoom after a brief delay
        setTimeout(() => {
          map.setZoom(13);
          
          // Also trigger directions immediately
          console.log('🚗 Requesting directions from onMapLoad...');
          const directionsService = new window.google.maps.DirectionsService();
          
          directionsService.route(
            {
              origin: {
                lat: selectedOrder.pickupLocation.lat,
                lng: selectedOrder.pickupLocation.lng,
              },
              destination: {
                lat: selectedOrder.destination.lat,
                lng: selectedOrder.destination.lng,
              },
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                console.log('✅ Directions loaded from onMapLoad');
                setDirections(result);
              } else {
                console.error('❌ Directions failed from onMapLoad:', status);
              }
            }
          );
        }, 500);
      }
    }
  }, [selectedOrderId, orders]);

  // Fit bounds to show all markers
  useEffect(() => {
    if (mapRef.current && orders.length > 0 && !selectedOrderId) {
      const bounds = new window.google.maps.LatLngBounds();
      
      orders.forEach(order => {
        // Only add markers that have coordinates
        if (order.pickupLocation.lat && order.pickupLocation.lng) {
          bounds.extend({
            lat: order.pickupLocation.lat,
            lng: order.pickupLocation.lng,
          });
        }
        
        if (order.destination.lat && order.destination.lng) {
          bounds.extend({
            lat: order.destination.lat,
            lng: order.destination.lng,
          });
        }
      });
      
      // Fit map to show all markers
      mapRef.current.fitBounds(bounds);
    }
  }, [orders, selectedOrderId]);

  // Focus on specific order when card is clicked
  useEffect(() => {
    console.log('🗺️ MapView useEffect triggered');
    console.log('selectedOrderId:', selectedOrderId);
    console.log('orders:', orders);
    console.log('mapRef.current:', mapRef.current);
    
    if (mapRef.current && selectedOrderId && orders.length > 0) {
      const selectedOrder = orders.find(order => order.id === selectedOrderId);
      
      console.log('🎯 Selected order:', selectedOrder);
      
      if (selectedOrder && selectedOrder.pickupLocation.lat && selectedOrder.destination.lat) {
        console.log('✅ Order has valid coordinates');
        
        const bounds = new window.google.maps.LatLngBounds();
        
        // Add pickup and destination to bounds
        bounds.extend({
          lat: selectedOrder.pickupLocation.lat,
          lng: selectedOrder.pickupLocation.lng,
        });
        
        bounds.extend({
          lat: selectedOrder.destination.lat,
          lng: selectedOrder.destination.lng,
        });
        
        // Fit and zoom to this specific order
        mapRef.current.fitBounds(bounds);
        
        setTimeout(() => {
          mapRef.current.setZoom(13);
        }, 100);
        
        console.log('🚗 Requesting directions...');
        
        // Draw route between pickup and destination
        const directionsService = new window.google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin: {
              lat: selectedOrder.pickupLocation.lat,
              lng: selectedOrder.pickupLocation.lng,
            },
            destination: {
              lat: selectedOrder.destination.lat,
              lng: selectedOrder.destination.lng,
            },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              console.log('✅ Directions loaded successfully');
              setDirections(result);
            } else {
              console.error('❌ Directions request failed:', status);
              setDirections(null);
            }
          }
        );
      } else {
        console.log('❌ Order missing coordinates');
      }
    } else {
      console.log('⚠️ Conditions not met:', {
        hasMap: !!mapRef.current,
        hasSelectedId: !!selectedOrderId,
        hasOrders: orders.length > 0
      });
      // Clear directions when no order is selected
      setDirections(null);
    }
  }, [selectedOrderId, orders]);

  // Show loading state while Google Maps API is loading
  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-red-600">Error loading Google Maps</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Show message if no orders with coordinates
  if (orders.length === 0 || !orders.some(o => o.pickupLocation.lat && o.destination.lat)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-sm text-gray-600">No orders with location data</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={orders.length === 0 ? defaultCenter : undefined}
      zoom={orders.length === 0 ? 12 : undefined}
      onLoad={onMapLoad}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Show orange/blue markers ONLY for NON-selected orders */}
      {!selectedOrderId && orders.map((order) => (
        <React.Fragment key={order.id}>
          {/* Pickup Marker (Orange) */}
          {order.pickupLocation.lat && order.pickupLocation.lng && (
            <Marker
              position={{
                lat: order.pickupLocation.lat,
                lng: order.pickupLocation.lng,
              }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
              }}
              title={`Pickup: ${order.pickupLocation.name}`}
            />
          )}
          
          {/* Destination Marker (Blue) */}
          {order.destination.lat && order.destination.lng && (
            <Marker
              position={{
                lat: order.destination.lat,
                lng: order.destination.lng,
              }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              title={`Destination: ${order.destination.name}`}
            />
          )}
        </React.Fragment>
      ))}

      {/* Red route line - suppress default markers */}
      {selectedOrderId && directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true, // ✅ Hide default markers so we can use custom ones
            suppressInfoWindows: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: '#1677FF',
              strokeWeight: 4,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

      {/* Custom A and B markers with YOUR custom colors */}
      {selectedOrderId && directions && (() => {
        const selected = orders.find(o => o.id === selectedOrderId);
        if (!selected) return null;
        
        return (
          <>
            {/* A Marker (Pickup) - Orange */}
            {selected.pickupLocation.lat && selected.pickupLocation.lng && (
              <Marker
                position={{
                  lat: selected.pickupLocation.lat,
                  lng: selected.pickupLocation.lng,
                }}
                label={{
                  text: 'A',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 20,
                  fillColor: '#343C6A', // 🎨 Change this to your desired color for A
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 3,
                }}
                title={`Pickup: ${selected.pickupLocation.name}`}
                zIndex={1000}
              />
            )}
            
            {/* B Marker (Destination) - Red */}
            {selected.destination.lat && selected.destination.lng && (
              <Marker
                position={{
                  lat: selected.destination.lat,
                  lng: selected.destination.lng,
                }}
                
                label={{
                  text: 'B',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 20,
                  fillColor: '#343C6A', // 🎨 Change this to your desired color for B
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 3,
                }}
                title={`Destination: ${selected.destination.name}`}
                zIndex={1000}
                
              />
            )}
          </>
        );
      })()}
    </GoogleMap>
  );
};

export default MapView;