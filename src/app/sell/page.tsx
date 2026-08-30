"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "Ethnic Wear",
  "Western Wear",
  "Bags & Shoes",
  "Electronics",
  "Books & Equipment",
  "Other",
];

const CONDITIONS = [
  "Brand New with Tags",
  "Like New",
  "Gently Used",
  "Well Loved",
];

export default function SellPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 4); // max 4 images
      setImages(filesArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to list an item.");
      return;
    }

    if (images.length === 0) {
      setError("Please add at least one photo.");
      return;
    }

    setSubmitting(true);
    try {
            // 1. Upload each image to Cloudinary, collect their URLs
      const imageUrls: string[] = [];
      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "hostelthrift_unsigned");
        formData.append("folder", `hostelthrift/${user.uid}`);
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/wgxoyx3e/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error("Image upload failed. Please try again.");
        }

        const data = await res.json();
        imageUrls.push(data.secure_url);
      }

      // 2. Save the item document to Firestore
      await addDoc(collection(db, "items"), {
        sellerId: user.uid,
        sellerName: profile?.name || "Unknown",
        hostelBlock: profile?.hostelBlock || "",
        title,
        description,
        category,
        condition,
        price: Number(price),
        status: "available",
        imageUrls,
        createdAt: new Date().toISOString(),
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <p className="p-8">Loading...</p>;

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg">You must be logged in to list an item.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">List an Item</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Blue Denim Jacket"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Any defects, fit notes, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 250"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Photos (up to 4)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full"
          />
          {images.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {images.length} photo(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post Item"}
        </button>
      </form>
    </div>
  );
}