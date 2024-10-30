import { Request, Response } from 'express';
import vendorService from '../services/vendor.service';
import ResponseHandler from '../utils/responseHandler';
import catchAsync from '../utils/catchAsync';

export class MapsController {
  getNearbyVendors = catchAsync(async (req: Request, res: Response) => {
    const { latitude, longitude, radius, category } = req.query;
    
    const vendors = await vendorService.getNearbyVendors(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      radius ? parseFloat(radius as string) : undefined,
      category as string
    );

    ResponseHandler.success(res, 'Nearby vendors retrieved successfully', vendors);
  });

  getVendorLocation = catchAsync(async (req: Request, res: Response) => {
    const vendor = await vendorService.getVendorById(req.params.id);
    
    const locationData = {
      id: vendor.id,
      businessName: vendor.business_name,
      digitalAddress: vendor.digital_address,
      coordinates: {
        lat: vendor.latitude,
        lng: vendor.longitude
      },
      category: vendor.shop_category,
      rating: vendor.average_rating,
      openingHours: vendor.opening_hours
    };

    ResponseHandler.success(res, 'Vendor location retrieved successfully', locationData);
  });
}

export default new MapsController();



//Fronte End Integration:
// components/VendorMap.tsx
// import React, { useEffect, useState } from 'react';
// import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

// interface VendorLocation {
//   id: string;
//   businessName: string;
//   coordinates: {
//     lat: number;
//     lng: number;
//   };
//   category: string;
//   rating: number;
// }

// const VendorMap: React.FC = () => {
//   const [vendors, setVendors] = useState<VendorLocation[]>([]);
//   const [selectedVendor, setSelectedVendor] = useState<VendorLocation | null>(null);
//   const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

//   useEffect(() => {
//     // Get user's location
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setUserLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         });
        
//         // Fetch nearby vendors
//         fetchNearbyVendors(
//           position.coords.latitude,
//           position.coords.longitude
//         );
//       },
//       (error) => {
//         console.error('Error getting location:', error);
//         // Use default location (e.g., Accra)
//         setUserLocation({ lat: 5.6037, lng: -0.1870 });
//       }
//     );
//   }, []);

//   const fetchNearbyVendors = async (lat: number, lng: number) => {
//     try {
//       const response = await fetch(
//         `/api/v1/maps/nearby?latitude=${lat}&longitude=${lng}&radius=5`
//       );
//       const data = await response.json();
//       setVendors(data.data);
//     } catch (error) {
//       console.error('Error fetching vendors:', error);
//     }
//   };

//   return (
//     <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}>
//       <GoogleMap
//         center={userLocation || { lat: 5.6037, lng: -0.1870 }}
//         zoom={13}
//         mapContainerStyle={{ width: '100%', height: '400px' }}
//       >
//         {vendors.map(vendor => (
//           <Marker
//             key={vendor.id}
//             position={vendor.coordinates}
//             onClick={() => setSelectedVendor(vendor)}
//             icon={{
//               url: `/markers/${vendor.category}.png`,
//               scaledSize: new window.google.maps.Size(30, 30)
//             }}
//           />
//         ))}

//         {selectedVendor && (
//           <InfoWindow
//             position={selectedVendor.coordinates}
//             onCloseClick={() => setSelectedVendor(null)}
//           >
//             <div>
//               <h3>{selectedVendor.businessName}</h3>
//               <p>Rating: {selectedVendor.rating} ⭐</p>
//               <button onClick={() => window.location.href = `/vendors/${selectedVendor.id}`}>
//                 View Shop
//               </button>
//             </div>
//           </InfoWindow>
//         )}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default VendorMap;