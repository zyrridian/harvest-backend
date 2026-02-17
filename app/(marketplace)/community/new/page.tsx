"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Image as ImageIcon,
  X,
  Loader2,
  Hash,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentHover: "#14532d",
  border: "#E4E4E7",
  error: "#dc2626",
};

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddImage = () => {
    const url = prompt("Enter image URL:");
    if (url && !images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter((i) => i !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login?redirect=/community/new");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/v1/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags.length > 0 ? tags : undefined,
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/community/${data.data.id}`);
      } else {
        setError(data.message || "Failed to create post");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen"
    >
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2"
              style={{ color: colors.heading }}
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-semibold" style={{ color: colors.heading }}>
              New Post
            </h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !content.trim()}
            className="px-4 py-2 text-sm font-medium disabled:opacity-50"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Post"
            )}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              className="mx-4 mt-4 p-3 text-sm"
              style={{
                backgroundColor: "#fee2e2",
                color: colors.error,
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
            }}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              maxLength={200}
              className="w-full text-xl font-semibold outline-none"
              style={{
                color: colors.heading,
                backgroundColor: "transparent",
              }}
            />
          </div>

          {/* Content */}
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
            }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, tips, or experiences..."
              rows={8}
              className="w-full outline-none resize-none"
              style={{
                color: colors.body,
                backgroundColor: "transparent",
              }}
            />
          </div>

          {/* Tags */}
          <div
            className="p-4 border-b"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Hash size={18} style={{ color: colors.body }} />
              <span
                className="text-sm font-medium"
                style={{ color: colors.heading }}
              >
                Tags
              </span>
              <span className="text-xs" style={{ color: colors.body }}>
                (up to 5)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.accent,
                    borderRadius: "9999px",
                  }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add a tag and press Enter"
                className="w-full px-3 py-2 border text-sm outline-none"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  backgroundColor: colors.background,
                }}
              />
            )}
          </div>

          {/* Images */}
          <div className="p-4" style={{ backgroundColor: colors.white }}>
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon size={18} style={{ color: colors.body }} />
              <span
                className="text-sm font-medium"
                style={{ color: colors.heading }}
              >
                Images
              </span>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-video relative overflow-hidden"
                    style={{ borderRadius: "8px", backgroundColor: "#f4f4f5" }}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-2 right-2 p-1"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: "9999px",
                      }}
                    >
                      <X size={16} style={{ color: colors.white }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddImage}
              className="w-full p-4 border-2 border-dashed text-sm font-medium"
              style={{
                borderColor: colors.border,
                color: colors.body,
                borderRadius: "8px",
              }}
            >
              + Add image URL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
