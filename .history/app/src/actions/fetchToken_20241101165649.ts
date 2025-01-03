import { useState } from "react";
import { useAuth, } from "@clerk/nextjs";

const [userToken, setUserToken] = useState<string | null>(null);
const {getToken } = useAuth();

const fetchUserToken = async () => {
  try {
    const token = await getToken();
    setUserToken(token);
    console.log("Clerk Token:", token);
    return userT
  } catch (error) {
    console.log("Failed to retrieve token:", error);
  }
};

