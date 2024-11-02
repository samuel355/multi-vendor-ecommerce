import { useState } from "react";

const [token, setToken] = useState<string | null>(null);

const fetchToken = async () => {
  try {
    const token = await getToken();
    setToken(token);
    console.log("Clerk Token:", token);
  } catch (error) {
    console.log("Failed to retrieve token:", error);
  }
};