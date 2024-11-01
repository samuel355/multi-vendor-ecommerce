import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Your protected page content */}
      </div>
    </ProtectedRoute>
  );
}