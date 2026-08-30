"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

type Conversation = {
  itemId: string;
  itemTitle: string;
  itemImage: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
};

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch conversation details once
  useEffect(() => {
    const fetchConversation = async () => {
      const convoRef = doc(db, "conversations", id);
      const convoSnap = await getDoc(convoRef);
      if (convoSnap.exists()) {
        setConversation(convoSnap.data() as Conversation);
      }
      setLoading(false);
    };
    fetchConversation();
  }, [id]);

  // Fetch messages, then poll every 5 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(
        collection(db, "conversations", id, "messages"),
        orderBy("createdAt", "asc")
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];
      setMessages(fetched);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    setSending(true);
    const messageText = text;
    setText(""); // clear input immediately for responsiveness

    try {
      await addDoc(collection(db, "conversations", id, "messages"), {
        senderId: user.uid,
        text: messageText,
        createdAt: new Date().toISOString(),
      });

      // Optimistically add to local state so it shows instantly
      setMessages((prev) => [
        ...prev,
        {
          id: "temp-" + Date.now(),
          senderId: user.uid,
          text: messageText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (!conversation) return <p className="p-8 text-center">Conversation not found.</p>;

  const otherPersonName =
    user?.uid === conversation.buyerId
      ? conversation.sellerName
      : "Buyer"; // we'll improve this later with buyer's name

  return (
    <div className="max-w-lg mx-auto px-4 py-4 flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="border-b pb-3 mb-3 flex items-center gap-3">
        {conversation.itemImage && (
          <img
            src={conversation.itemImage}
            alt=""
            className="w-10 h-10 rounded object-cover"
          />
        )}
        <div>
          <p className="font-medium text-sm">{conversation.itemTitle}</p>
          <p className="text-xs text-gray-500">Chat with {otherPersonName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">
            No messages yet. Say hi!
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                    isMine
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t pt-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}