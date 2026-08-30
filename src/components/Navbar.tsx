"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          HostelThrift
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {loading ? null : user ? (
            <>
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/sell" className="hover:underline">Sell</Link>
              <Link href="/chats" className="hover:underline">Chats</Link>
              <Link href="/help" className="hover:underline">Help</Link>
              <Link href="/profile" className="hover:underline">
                {profile?.name || "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-black text-white px-3 py-1.5 rounded hover:opacity-90"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Log In</Link>
              <Link
                href="/signup"
                className="bg-black text-white px-3 py-1.5 rounded hover:opacity-90"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}