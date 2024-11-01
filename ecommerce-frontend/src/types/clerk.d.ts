interface ClerkSession {
  getToken(): Promise<string | null>;
}

interface Clerk {
  session: ClerkSession | null;
}

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}

// Add this line to ensure this file is treated as a module
export {};