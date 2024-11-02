import { Router } from "express";
import chatController from "../controllers/chat.controller";
import { requireAuth, isVendor } from "../middleware/auth.middleware";

const chatRouter = Router();

// User routes
chatRouter.post("/rooms", requireAuth, chatController.createRoom);
chatRouter.get(
  "/rooms/:roomId/messages",
  requireAuth,
  chatController.getMessages,
);
chatRouter.post(
  "/rooms/:roomId/messages",
  requireAuth,
  chatController.sendMessage,
);
chatRouter.patch("/rooms/:roomId/read", requireAuth, chatController.markAsRead);

// Vendor routes
chatRouter.get(
  "/vendor/:vendorId/rooms/:roomId/messages",
  requireAuth,
  isVendor,
  chatController.getMessages,
);
chatRouter.post(
  "/vendor/:vendorId/rooms/:roomId/messages",
  requireAuth,
  isVendor,
  chatController.sendMessage,
);
chatRouter.patch(
  "/vendor/:vendorId/rooms/:roomId/read",
  requireAuth,
  isVendor,
  chatController.markAsRead,
);

export default chatRouter;

//Frontend Integration Example
// components/VendorMap.tsx
// import React, { useEffect, useState } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import axios from 'axios';

// const VendorMap = () => {
//   const [vendors, setVendors] = useState([]);
//   const [userLocation, setUserLocation] = useState(null);

//   useEffect(() => {
//     // Get user's location
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setUserLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         });

//         // Fetch nearby vendors
//         fetchNearbyVendors(position.coords.latitude, position.coords.longitude);
//       },
//       (error) => console.error(error)
//     );
//   }, []);

//   const fetchNearbyVendors = async (lat, lng) => {
//     try {
//       const response = await axios.get(`/api/v1/map/nearby`, {
//         params: { latitude: lat, longitude: lng, radius: 5 }
//       });
//       setVendors(response.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}>
//       <GoogleMap
//         center={userLocation}
//         zoom={14}
//         mapContainerStyle={{ width: '100%', height: '400px' }}
//       >
//         {vendors.map((vendor) => (
//           <Marker
//             key={vendor.id}
//             position={{ lat: vendor.latitude, lng: vendor.longitude }}
//             title={vendor.business_name}
//           />
//         ))}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

//Frontend integration example
// components/Chat.tsx
// import React, { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import axios from 'axios';

// const Chat = ({ vendorId, userId }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [socket, setSocket] = useState(null);
//   const [roomId, setRoomId] = useState(null);

//   useEffect(() => {
//     // Initialize chat
//     initializeChat();

//     // Connect to WebSocket
//     const newSocket = io(process.env.WEBSOCKET_URL, {
//       auth: {
//         token: localStorage.getItem('token')
//       }
//     });

//     setSocket(newSocket);

//     return () => newSocket.close();
//   }, []);

//   const initializeChat = async () => {
//     try {
//       // Create or get chat room
//       const roomResponse = await axios.post('/api/v1/chat/rooms', { vendorId });
//       setRoomId(roomResponse.data.data.id);

//       // Get messages
//       const messagesResponse = await axios.get(`/api/v1/chat/rooms/${roomResponse.data.data.id}/messages`);
//       setMessages(messagesResponse.data.data);

//       // Join socket room
//       socket?.emit('join_room', roomResponse.data.data.id);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const sendMessage = async () => {
//     try {
//       await axios.post(`/api/v1/chat/rooms/${roomId}/messages`, {
//         message: newMessage,
//         messageType: 'text'
//       });
//       setNewMessage('');
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div>
//       <div className="messages">
//         {messages.map((message) => (
//           <div key={message.id} className={`message ${message.sender_id === userId ? 'sent' : 'received'}`}>
//             {message.message}
//           </div>
//         ))}
//       </div>
//       <div className="input-area">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// };
// ```