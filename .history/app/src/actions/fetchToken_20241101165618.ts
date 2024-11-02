import { useState } from "react";
import { useAuth, } from "@clerk/nextjs";

const [userToken, setToken] = useState<string | null>(null);
const {getToken } = useAuth();

const fetchToken = async () => {
  try {
    const token = await getToken();
    setToken(token);
    console.log("Clerk Token:", token);
  } catch (error) {
    console.log("Failed to retrieve token:", error);
  }
};
