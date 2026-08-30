"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc, updateDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
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
  const [starting, setStarting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const handleMessageSeller = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setStarting(true);
    try {
      const q = query(
        collection(db, "conversations"),
        where("itemId", "==", id),
        where("buyerId", "==", user.uid)
      );
      const existing = await getDocs(q);

      let conversationId: string;

      if (!existing.empty) {
        conversationId = existing.docs[0].id;
      } else {
        const newConvo = await addDoc(collection(db, "conversations"), {
          itemId: id,
          itemTitle: item.title,
          itemImage: item.imageUrls?.[0] || "",
          buyerId: user.uid,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          createdAt: new Date().toISOString(),
        });
        conversationId = newConvo.id;
      }

      router.push(`/chats/${conversationId}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
    } finally {
      setStarting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "items", id));
      router.push("/");
    } catch (err) {
      console.error("Error deleting item:", err);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "items", id), { status: newStatus });
      setItem((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
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
          onClick={handleMessageSeller}
          disabled={starting}
          className="w-full bg-black text-white rounded px-3 py-2.5 disabled:opacity-50"
        >
          {starting ? "Starting chat..." : "Message Seller"}
        </button>
      )}

            {isOwnItem && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 text-center mb-1">
            This is your own listing.
          </p>

          <div className="flex gap-2">
            {["available", "reserved", "sold"].map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => handleStatusChange(statusOption)}
                disabled={updatingStatus || item.status === statusOption}
                className={`flex-1 text-sm rounded px-2 py-2 border capitalize disabled:opacity-50 ${
                  item.status === statusOption
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {statusOption}
              </button>
            ))}
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full border border-red-500 text-red-500 rounded px-3 py-2.5 disabled:opacity-50 hover:bg-red-50"
          >
            {deleting ? "Deleting..." : "Delete Listing"}
          </button>
        </div>
      )}
    </div>
  );
}