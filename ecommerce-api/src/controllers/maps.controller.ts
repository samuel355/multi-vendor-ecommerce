import { Request, Response } from "express";
import { Pool } from "pg";
import { getPool } from "../config/database";
import locationService from "../services/location.service";
import ResponseHandler from "../utils/responseHandler";
import catchAsync from "../utils/catchAsync";
import { UpdateLocationDTO, NearbyVendorsDTO } from "../dtos/location.dto";
import ApiError from "../utils/apiError";

export class MapController {
  private pool: Pool;

  constructor() {
    this.initializePool();
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  getNearbyVendors = catchAsync(async (req: Request, res: Response) => {
    const {
      latitude,
      longitude,
      radius = 5,
    } = req.query as unknown as NearbyVendorsDTO;

    const query = `
      SELECT
        v.*,
        ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326),
          ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)
        ) * 111.319 as distance
      FROM vendors v
      WHERE v.is_active = true
      AND v.location_verified = true
      HAVING ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326),
        ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)
      ) * 111.319 <= $3
      ORDER BY distance
    `;

    const result = await this.pool.query(query, [longitude, latitude, radius]);

    ResponseHandler.success(
      res,
      result.rows,
      "Nearby vendors retrieved successfully",
    );
  });

  updateVendorLocation = catchAsync(async (req: Request, res: Response) => {
    const { vendorId } = req.params;
    const locationData: UpdateLocationDTO = req.body;

    // Validate and convert digital address
    const coordinates = await locationService.convertDigitalAddress(
      locationData.digitalAddress,
    );

    const query = `
      UPDATE vendors
      SET
        digital_address = $1,
        latitude = $2,
        longitude = $3,
        street_address = $4,
        landmark = $5,
        location_verified = true,
        region = $6,
        district = $7
      WHERE id = $8
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      locationData.digitalAddress,
      coordinates.latitude,
      coordinates.longitude,
      locationData.streetAddress || null,
      locationData.landmark || null,
      coordinates.region,
      coordinates.district,
      vendorId,
    ]);

    if (!result.rows[0]) {
      ApiError.notFound("Vendor not found");
      throw Error;
    }

    ResponseHandler.success(
      res,
      "Vendor location updated successfully",
      result.rows[0],
    );
  });

  getVendorsInRegion = catchAsync(async (req: Request, res: Response) => {
    const { region } = req.params;
    const bounds = await locationService.getRegionBounds(region);

    const query = `
      SELECT *
      FROM vendors
      WHERE latitude BETWEEN $1 AND $2
      AND longitude BETWEEN $3 AND $4
      AND is_active = true
      AND location_verified = true
    `;

    const result = await this.pool.query(query, [
      bounds.minLat,
      bounds.maxLat,
      bounds.minLng,
      bounds.maxLng,
    ]);

    ResponseHandler.success(
      res,
      result.rows,
      "Vendors in region retrieved successfully",
    );
  });
}

export default new MapController();

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
