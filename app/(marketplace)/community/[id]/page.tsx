"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Loader2,
  MoreHorizontal,
  User,
  Trash2,
  CheckCircle,
  Leaf,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  error: "#dc2626",
};

interface Post {
  id: string;
  title: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    userType?: string;
  };
  farmer?: {
    id: string;
    name: string;
    profileImage: string | null;
    isVerified: boolean;
  } | null;
  images: { id: string; url: string; displayOrder: number }[];
  tags: { tag: string }[];
  is_liked_by_user?: boolean;
  _count: {
    likes: number;
    comments: number;
  };
}

interface Comment {
  id: string;
  content: string;
  likesCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  is_liked_by_user?: boolean;
  _count?: {
    likes: number;
  };
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likingComment, setLikingComment] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
      getCurrentUser();
    }
  }, [postId]);

  const getCurrentUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.data.user_id);
      }
    } catch (error) {
      console.error("Get user error:", error);
    }
  };

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/community/posts/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (response.ok) {
        setPost(data.data);
      } else {
        router.push("/community");
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/v1/community/posts/${postId}/comments`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const data = await response.json();
      if (response.ok) {
        setComments(data.data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleLikePost = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/community/${postId}`);
      return;
    }

    if (!post) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/v1/community/posts/${postId}/like`, {
        method: post.is_liked_by_user ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPost({
          ...post,
          is_liked_by_user: !post.is_liked_by_user,
          _count: {
            ...post._count,
            likes: post.is_liked_by_user
              ? post._count.likes - 1
              : post._count.likes + 1,
          },
        });
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/community/${postId}`);
      return;
    }

    setLikingComment(commentId);
    try {
      const response = await fetch(
        `/api/v1/community/comments/${commentId}/like`,
        {
          method: isLiked ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              const currentLikes = c._count?.likes ?? 0;
              return {
                ...c,
                is_liked_by_user: !isLiked,
                _count: {
                  likes: isLiked ? currentLikes - 1 : currentLikes + 1,
                },
              };
            }
            return c;
          }),
        );
      }
    } catch (error) {
      console.error("Like comment error:", error);
    } finally {
      setLikingComment(null);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/community/${postId}`);
      return;
    }

    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/v1/community/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: commentText }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        setComments((prev) => [data.data, ...prev]);
        setCommentText("");
        if (post) {
          setPost({
            ...post,
            _count: { ...post._count, comments: post._count.comments + 1 },
          });
        }
      }
    } catch (error) {
      console.error("Submit comment error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (!confirm("Delete this comment?")) return;

    try {
      const response = await fetch(`/api/v1/community/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        if (post) {
          setPost({
            ...post,
            _count: { ...post._count, comments: post._count.comments - 1 },
          });
        }
      }
    } catch (error) {
      console.error("Delete comment error:", error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, url });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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

  if (!post) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: colors.heading }}
          >
            Post not found
          </h1>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            <ChevronLeft size={16} />
            Back to community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2"
            style={{ color: colors.heading }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-semibold" style={{ color: colors.heading }}>
            Post
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        {/* Post */}
        <article
          className="border-b"
          style={{ backgroundColor: colors.white, borderColor: colors.border }}
        >
          {/* Author */}
          <div className="flex items-center gap-3 p-4">
            {post.farmer ? (
              <Link
                href={`/farmers/${post.farmer.id}`}
                className="w-12 h-12 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: "#dcfce7",
                  borderRadius: "9999px",
                }}
              >
                {post.farmer.profileImage ? (
                  <img
                    src={post.farmer.profileImage}
                    alt={post.farmer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Leaf size={24} style={{ color: colors.accent }} />
                )}
              </Link>
            ) : (
              <div
                className="w-12 h-12 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: colors.background,
                  borderRadius: "9999px",
                }}
              >
                {post.user.avatarUrl ? (
                  <img
                    src={post.user.avatarUrl}
                    alt={post.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={24} style={{ color: colors.body }} />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {post.farmer ? (
                  <Link
                    href={`/farmers/${post.farmer.id}`}
                    className="font-medium hover:underline truncate"
                    style={{ color: colors.heading }}
                  >
                    {post.farmer.name}
                  </Link>
                ) : (
                  <p
                    className="font-medium truncate"
                    style={{ color: colors.heading }}
                  >
                    {post.user.name}
                  </p>
                )}
                {post.farmer?.isVerified && (
                  <CheckCircle
                    size={16}
                    style={{ color: colors.success }}
                    className="shrink-0"
                  />
                )}
                {post.farmer && (
                  <span
                    className="text-xs px-2 py-0.5 shrink-0"
                    style={{
                      backgroundColor: "#dcfce7",
                      color: colors.accent,
                      borderRadius: "4px",
                    }}
                  >
                    Farm
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: colors.body }}>
                {formatDate(post.createdAt)}
              </p>
            </div>
            <button className="p-2">
              <MoreHorizontal size={20} style={{ color: colors.body }} />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            <h1
              className="text-xl font-bold mb-3"
              style={{ color: colors.heading }}
            >
              {post.title}
            </h1>
            <p className="whitespace-pre-wrap" style={{ color: colors.body }}>
              {post.content}
            </p>
          </div>

          {/* Images */}
          {post.images.length > 0 && (
            <div className="px-4 pb-4">
              <div
                className={`grid gap-2 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
              >
                {post.images.map((image, idx) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(idx)}
                    className="aspect-video relative overflow-hidden"
                    style={{ borderRadius: "8px", backgroundColor: "#f4f4f5" }}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {post.tags.map((t) => (
                <Link
                  key={t.tag}
                  href={`/community?tag=${t.tag}`}
                  className="text-sm"
                  style={{ color: colors.accent }}
                >
                  #{t.tag}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div
            className="flex items-center gap-6 px-4 py-3 border-t"
            style={{ borderColor: colors.border }}
          >
            <button
              onClick={handleLikePost}
              disabled={liking}
              className="flex items-center gap-2"
              style={{
                color: post.is_liked_by_user ? colors.error : colors.body,
              }}
            >
              <Heart
                size={22}
                fill={post.is_liked_by_user ? colors.error : "none"}
              />
              <span className="text-sm font-medium">{post._count.likes}</span>
            </button>
            <div
              className="flex items-center gap-2"
              style={{ color: colors.body }}
            >
              <MessageCircle size={22} />
              <span className="text-sm font-medium">
                {post._count.comments}
              </span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2"
              style={{ color: colors.body }}
            >
              <Share2 size={22} />
            </button>
          </div>
        </article>

        {/* Comment Form */}
        <form
          onSubmit={handleSubmitComment}
          className="p-4 border-b flex items-center gap-3"
          style={{ backgroundColor: colors.white, borderColor: colors.border }}
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border text-sm"
            style={{
              borderColor: colors.border,
              borderRadius: "9999px",
              backgroundColor: colors.background,
            }}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || submitting}
            className="p-2 disabled:opacity-50"
            style={{ color: colors.accent }}
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        {/* Comments */}
        <div style={{ backgroundColor: colors.white }}>
          {comments.length === 0 ? (
            <div className="p-8 text-center">
              <p style={{ color: colors.body }}>
                No comments yet. Be the first!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border-b"
                style={{ borderColor: colors.border }}
              >
                <div className="flex gap-3">
                  <div
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: "9999px",
                    }}
                  >
                    {comment.user.avatarUrl ? (
                      <img
                        src={comment.user.avatarUrl}
                        alt={comment.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} style={{ color: colors.body }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-medium text-sm"
                        style={{ color: colors.heading }}
                      >
                        {comment.user.name}
                      </span>
                      <span className="text-xs" style={{ color: colors.body }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: colors.body }}>
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() =>
                          handleLikeComment(
                            comment.id,
                            comment.is_liked_by_user || false,
                          )
                        }
                        disabled={likingComment === comment.id}
                        className="flex items-center gap-1 text-sm"
                        style={{
                          color: comment.is_liked_by_user
                            ? colors.error
                            : colors.body,
                        }}
                      >
                        <Heart
                          size={14}
                          fill={
                            comment.is_liked_by_user ? colors.error : "none"
                          }
                        />
                        {(comment._count?.likes ?? 0) > 0 &&
                          (comment._count?.likes ?? 0)}
                      </button>
                      {currentUserId === comment.user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center gap-1 text-sm"
                          style={{ color: colors.body }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={post.images[selectedImage].url}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
