import { useState } from "react";
import { useAuth, } from "@clerk/nextjs";


const {isLoaded, userId, getToken } = useAuth();

export const fetchUserToken = async () => {
  try {
    const token = await getToken();
    setUserToken(token);
    console.log("Clerk Token:", token);
    return userToken;
  } catch (error) {
    console.log("Failed to retrieve token:", error);
  }
};


