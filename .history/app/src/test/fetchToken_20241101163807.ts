import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

const [token, setToken] = useState<string | null>(null);
const { userId, getToken } = useAuth();

const fetchToken = async () => {
  try {
    const token = await getToken();
    setToken(token);
    console.log("Clerk Token:", token);
  } catch (error) {
    console.log("Failed to retrieve token:", error);
  }
};