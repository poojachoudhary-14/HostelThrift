"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, or } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Conversation = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
};

export default function ChatsListPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchConversations = async () => {
      try {
        // Fetch conversations where user is the buyer
        const buyerQuery = query(
          collection(db, "conversations"),
          where("buyerId", "==", user.uid)
        );
        // Fetch conversations where user is the seller
        const sellerQuery = query(
          collection(db, "conversations"),
          where("sellerId", "==", user.uid)
        );

        const [buyerSnap, sellerSnap] = await Promise.all([
          getDocs(buyerQuery),
          getDocs(sellerQuery),
        ]);

        const buyerConvos = buyerSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Conversation[];

        const sellerConvos = sellerSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Conversation[];

        // Merge and remove duplicates (in case user is somehow both, e.g. testing)
        const merged = [...buyerConvos];
        sellerConvos.forEach((sc) => {
          if (!merged.find((c) => c.id === sc.id)) {
            merged.push(sc);
          }
        });

        setConversations(merged);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  if (authLoading || loading) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  if (!user) {
    return <p className="p-8 text-center">Please log in to view your chats.</p>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chats</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-600">
          No conversations yet. Message a seller from an item page to start one.
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const isSeller = c.sellerId === user.uid;
            return (
              <Link
                key={c.id}
                href={`/chats/${c.id}`}
                className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-50 transition"
              >
                {c.itemImage && (
                  <img
                    src={c.itemImage}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.itemTitle}</p>
                  <p className="text-sm text-gray-500">
                    {isSeller ? "Buyer inquiry" : `Chat with ${c.sellerName}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}