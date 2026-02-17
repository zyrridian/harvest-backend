"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Heart,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Calendar,
  Eye,
  Edit,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
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
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
  errorBg: "#fee2e2",
  warning: "#ca8a04",
};

interface Post {
  id: string;
  title: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  images: { id: string; url: string }[];
  tags: { tag: string }[];
}

export default function FarmerCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newImages, setNewImages] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/community/posts?filter=my_posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setPosts(data.data.posts || []);
      } else {
        throw new Error(data.message || "Failed to fetch posts");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !newContent.trim()) return;

    setCreating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          tags: newTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          images: newImages
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPosts([data.data, ...posts]);
        setShowNewPostModal(false);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        setNewImages("");
      } else {
        throw new Error(data.message || "Failed to create post");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/community/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPosts(posts.filter((p) => p.id !== postId));
        setShowDeleteModal(null);
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete post");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.accent,
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: colors.body }}>Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
            Community
          </h1>
          <p className="text-sm" style={{ color: colors.body }}>
            Share updates and connect with your customers
          </p>
        </div>
        <button
          onClick={() => setShowNewPostModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: colors.accent,
            color: colors.white,
            borderRadius: "4px",
          }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 border flex items-center gap-3"
          style={{
            backgroundColor: colors.errorBg,
            borderColor: colors.error,
            borderRadius: "4px",
          }}
        >
          <AlertCircle size={20} style={{ color: colors.error }} />
          <p style={{ color: colors.error }}>{error}</p>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div
          className="p-12 text-center border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <MessageSquare
            size={48}
            className="mx-auto mb-4"
            style={{ color: colors.border }}
          />
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: colors.heading }}
          >
            No posts yet
          </h2>
          <p className="mb-4" style={{ color: colors.body }}>
            Share your first update with the community
          </p>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            <Plus size={16} />
            Create your first post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: colors.heading }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-xs flex items-center gap-1"
                    style={{ color: colors.body }}
                  >
                    <Calendar size={12} />
                    {formatDate(post.createdAt)}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowDeleteModal(
                        showDeleteModal === post.id ? null : post.id,
                      )
                    }
                    className="p-2 hover:bg-gray-100 transition-colors"
                    style={{ borderRadius: "4px" }}
                  >
                    <MoreHorizontal size={16} style={{ color: colors.body }} />
                  </button>
                  {showDeleteModal === post.id && (
                    <div
                      className="absolute right-0 top-full mt-1 py-1 border shadow-lg z-10 min-w-[120px]"
                      style={{
                        backgroundColor: colors.white,
                        borderColor: colors.border,
                        borderRadius: "4px",
                      }}
                    >
                      <Link
                        href={`/community/${post.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        style={{ color: colors.body }}
                      >
                        <Eye size={14} />
                        View
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deleting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                        style={{ color: colors.error }}
                      >
                        {deleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Preview */}
              <p
                className="text-sm mb-3 line-clamp-3"
                style={{ color: colors.body }}
              >
                {post.content}
              </p>

              {/* Images Preview */}
              {post.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {post.images.slice(0, 4).map((img, idx) => (
                    <div
                      key={img.id}
                      className="w-20 h-20 shrink-0 overflow-hidden"
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: "4px",
                      }}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {post.images.length > 4 && (
                    <div
                      className="w-20 h-20 shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: "4px",
                      }}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.body }}
                      >
                        +{post.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.tag}
                      className="px-2 py-1 text-xs"
                      style={{
                        backgroundColor: colors.successBg,
                        color: colors.accent,
                        borderRadius: "4px",
                      }}
                    >
                      #{tag.tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div
                className="flex items-center gap-4 pt-3 border-t"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: colors.body }}
                >
                  <Heart size={16} />
                  {post.likesCount}
                </div>
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: colors.body }}
                >
                  <MessageSquare size={16} />
                  {post.commentsCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowNewPostModal(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: colors.white,
              borderRadius: "4px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <h2
                className="font-bold text-lg"
                style={{ color: colors.heading }}
              >
                Create New Post
              </h2>
            </div>
            <form onSubmit={handleCreatePost} className="p-4 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.heading }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-3 py-2 border text-sm"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.heading }}
                >
                  Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your updates, tips, or farm news..."
                  rows={5}
                  className="w-full px-3 py-2 border text-sm resize-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.heading }}
                >
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="organic, vegetables, tips"
                  className="w-full px-3 py-2 border text-sm"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.heading }}
                >
                  Image URLs (one per line)
                </label>
                <textarea
                  value={newImages}
                  onChange={(e) => setNewImages(e.target.value)}
                  placeholder="https://example.com/image1.jpg"
                  rows={3}
                  className="w-full px-3 py-2 border text-sm resize-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium border"
                  style={{
                    borderColor: colors.border,
                    color: colors.body,
                    borderRadius: "4px",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim() || !newContent.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                    opacity:
                      creating || !newTitle.trim() || !newContent.trim()
                        ? 0.7
                        : 1,
                  }}
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
