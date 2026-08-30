"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Item = {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  status: string;
  imageUrls: string[];
  hostelBlock: string;
  sellerId: string;
  sellerName: string;
};

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItem(docSnap.data() as Item);
        }
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) return <p className="p-8 text-center">Loading...</p>;

  if (!item) {
    return <p className="p-8 text-center">Item not found.</p>;
  }

  const isOwnItem = user?.uid === item.sellerId;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Image gallery */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
        {item.imageUrls?.[activeImage] && (
          <img
            src={item.imageUrls[activeImage]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {item.imageUrls?.length > 1 && (
        <div className="flex gap-2 mb-6">
          {item.imageUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-16 rounded overflow-hidden border-2 ${
                i === activeImage ? "border-black" : "border-transparent"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold">{item.title}</h1>
        {item.status !== "available" && (
          <span className="text-sm font-medium text-red-500 border border-red-500 px-2 py-0.5 rounded">
            {item.status === "sold" ? "Sold" : "Reserved"}
          </span>
        )}
      </div>

      <p className="text-xl font-semibold mb-4">₹{item.price}</p>

      <div className="flex gap-2 text-sm text-gray-600 mb-4">
        <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
        <span className="bg-gray-100 px-2 py-1 rounded">{item.condition}</span>
      </div>

      {item.description && (
        <p className="text-gray-700 mb-4">{item.description}</p>
      )}

      <div className="border-t pt-4 mb-6">
        <p className="text-sm text-gray-600">
          Seller: <span className="font-medium">{item.sellerName}</span>
        </p>
        <p className="text-sm text-gray-600">Hostel: {item.hostelBlock}</p>
      </div>

      {!isOwnItem && item.status === "available" && (
        <button
          onClick={() => alert("Chat feature coming next!")}
          className="w-full bg-black text-white rounded px-3 py-2.5"
        >
          Message Seller
        </button>
      )}

      {isOwnItem && (
        <p className="text-sm text-gray-500 text-center">
          This is your own listing.
        </p>
      )}
    </div>
  );
}