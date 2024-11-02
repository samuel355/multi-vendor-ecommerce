import { useState } from "react";
import { useAuth, } from "@clerk/nextjs";


export const fetchUserToken = async () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  try {
    const token = await getToken();
    setUserToken(token);
    console.log("Clerk Token:", token);
    return userToken;
  } catch (error) {
    console.log("Failed to retrieve token:", error);
  }
};


