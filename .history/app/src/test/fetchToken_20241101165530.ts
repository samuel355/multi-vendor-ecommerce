import { useState } from "react";
import { useAuth, } from "@clerk/nextjs";

const [token, setToken] = useState<string | null>(null);
const {getToken } = useAuth();

const fetchToken = async () => {
  try {
    token = await getToken();
    console.log("Clerk Token:", token);
  } catch (error) {
    console.log("Failed to retrieve token:", error);
  }
};
