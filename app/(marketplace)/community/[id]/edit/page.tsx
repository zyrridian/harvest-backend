"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Image as ImageIcon,
  X,
  Loader2,
  Hash,
} from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentHover: "#14532d",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
};

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/community/posts/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (response.ok) {
        setTitle(data.data.title);
        setContent(data.data.content);
        setTags((data.data.tags || []).map((t: {tag:string}) => t.tag));
        setImages((data.data.images || []).map((i: {url:string}) => i.url));
      } else {
        setError("Post not found");
      }
    } catch {
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (tag && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/community/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/community/${postId}`);
      } else {
        setError(data.message || "Failed to update post");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: colors.accent }}
        />
      </div>
    );
  }

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
              Edit Post
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
              "Save"
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

          {/* Tags (read-only display for now, editable via API later) */}
          {tags.length > 0 && (
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
              </div>
              <div className="flex flex-wrap gap-2">
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
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images (read-only display) */}
          {images.length > 0 && (
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
              <div className="grid grid-cols-2 gap-2">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-video relative overflow-hidden"
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "#f4f4f5",
                    }}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
