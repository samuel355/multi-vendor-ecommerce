import { useAuth } from '@clerk/nextjs';
import { headers } from 'next/headers';

async function getProfile() {
  try {
    // Get the auth token
    const { getToken } = useAuth();
    const token = await getToken();
    
    // Get headers
    const headersList = headers();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // Add any specific headers from the headersList if needed
        // 'x-custom-header': headersList.get('x-custom-header'),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export default async function ProfilePage() {
  try {
    const { user } = await getProfile();

    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Email</h2>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Role</h2>
              <p className="mt-1">{user.role}</p>
            </div>
            {/* Add more user details */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 text-red-600 p-4 rounded">
          Failed to load profile. Please try again later.
        </div>
      </div>
    );
  }
}