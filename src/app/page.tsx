"use client";

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, profile, loading } = useAuth();

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      {user ? (
        <div>
          <p className="text-xl">Welcome, {profile?.name || user.email}! 👋</p>
          <p className="text-gray-600">Hostel: {profile?.hostelBlock}</p>
        </div>
      ) : (
        <p className="text-xl">You are not logged in.</p>
      )}
    </div>
  );
}