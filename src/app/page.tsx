"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Item = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  imageUrls: string[];
  hostelBlock: string;
  status: string;
};

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[];
        setItems(fetchedItems);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (authLoading || loading) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg mb-4">Welcome to HostelThrift</p>
        <p className="text-gray-600 mb-4">
          Log in with your college email to browse and list items.
        </p>
        <Link href="/login" className="underline font-medium">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Browse Items</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">No items listed yet. Be the first to sell something!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-square bg-gray-100">
                {item.imageUrls?.[0] && (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-gray-600 text-sm">₹{item.price}</p>
                <p className="text-gray-400 text-xs">{item.hostelBlock}</p>
                {item.status !== "available" && (
                  <span className="text-xs text-red-500 font-medium">
                    {item.status === "sold" ? "Sold" : "Reserved"}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}