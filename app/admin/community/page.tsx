"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Heart,
  MessageSquare,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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
};

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
  post: {
    id: string;
    title: string;
  };
  _count: {
    likes: number;
  };
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === "posts") {
      fetchPosts();
    } else {
      fetchComments();
    }
  }, [activeTab, searchTerm, currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/v1/admin/community/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(data.data.posts);
      setTotalPages(data.data.pagination.total_pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `/api/v1/admin/community/comments?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setComments(data.data.comments);
      setTotalPages(data.data.pagination.total_pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/admin/community/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Post deleted successfully");
      fetchPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/v1/admin/community/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Comment deleted successfully");
      fetchComments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: colors.heading }}
        >
          Community Moderation
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.body }}>
          Moderate posts and comments from the community
        </p>
      </div>

      {/* Tabs and Search */}
      <div
        className="border"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        <div className="border-b" style={{ borderColor: colors.border }}>
          <div className="flex gap-4 px-6">
            <button
              onClick={() => {
                setActiveTab("posts");
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className="py-4 px-2 font-medium transition-colors"
              style={{
                borderBottom: `2px solid ${activeTab === "posts" ? colors.accent : "transparent"}`,
                color: activeTab === "posts" ? colors.accent : colors.body,
              }}
            >
              Posts
            </button>
            <button
              onClick={() => {
                setActiveTab("comments");
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className="py-4 px-2 font-medium transition-colors"
              style={{
                borderBottom: `2px solid ${activeTab === "comments" ? colors.accent : "transparent"}`,
                color: activeTab === "comments" ? colors.accent : colors.body,
              }}
            >
              Comments
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.body }}
            />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border outline-none"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="border"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        {loading ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            Loading {activeTab}...
          </div>
        ) : error ? (
          <div
            className="p-8 text-center flex items-center justify-center gap-2"
            style={{ color: colors.error }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        ) : activeTab === "posts" ? (
          posts.length === 0 ? (
            <div className="p-8 text-center" style={{ color: colors.body }}>
              No posts found
            </div>
          ) : (
            <>
              <div>
                {posts.map((post, index) => (
                  <div
                    key={post.id}
                    className={`p-6 ${index < posts.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: colors.border }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3
                          className="text-base font-semibold mb-2"
                          style={{ color: colors.heading }}
                        >
                          {post.title}
                        </h3>
                        <p
                          className="text-sm mb-3"
                          style={{ color: colors.body }}
                        >
                          {post.content}
                        </p>
                        <div
                          className="flex items-center gap-4 text-xs"
                          style={{ color: colors.body }}
                        >
                          <span>By: {post.user.name}</span>
                          <span style={{ color: colors.border }}>|</span>
                          <span>{formatDate(post.created_at)}</span>
                          <span style={{ color: colors.border }}>|</span>
                          <span className="flex items-center gap-1">
                            <Heart size={12} style={{ color: colors.error }} />
                            {post._count.likes} likes
                          </span>
                          <span style={{ color: colors.border }}>|</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare
                              size={12}
                              style={{ color: colors.body }}
                            />
                            {post._count.comments} comments
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="ml-4 p-2 transition-colors hover:bg-red-50"
                        style={{ borderRadius: "4px" }}
                      >
                        <Trash2
                          size={16}
                          strokeWidth={1.5}
                          style={{ color: colors.error }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div
                className="px-6 py-4 border-t flex items-center justify-between"
                style={{ borderColor: colors.border }}
              >
                <div className="text-sm" style={{ color: colors.body }}>
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                    style={{ borderColor: colors.border, borderRadius: "4px" }}
                  >
                    <ChevronLeft size={16} style={{ color: colors.body }} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                    style={{ borderColor: colors.border, borderRadius: "4px" }}
                  >
                    <ChevronRight size={16} style={{ color: colors.body }} />
                  </button>
                </div>
              </div>
            </>
          )
        ) : comments.length === 0 ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            No comments found
          </div>
        ) : (
          <>
            <div>
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className={`p-6 ${index < comments.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: colors.border }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p
                        className="text-sm mb-3"
                        style={{ color: colors.heading }}
                      >
                        {comment.content}
                      </p>
                      <div
                        className="text-xs mb-2"
                        style={{ color: colors.body }}
                      >
                        <span className="font-medium">On post:</span>{" "}
                        {comment.post.title}
                      </div>
                      <div
                        className="flex items-center gap-4 text-xs"
                        style={{ color: colors.body }}
                      >
                        <span>By: {comment.user.name}</span>
                        <span style={{ color: colors.border }}>|</span>
                        <span>{formatDate(comment.created_at)}</span>
                        <span style={{ color: colors.border }}>|</span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} style={{ color: colors.error }} />
                          {comment._count.likes} likes
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-4 p-2 transition-colors hover:bg-red-50"
                      style={{ borderRadius: "4px" }}
                    >
                      <Trash2
                        size={16}
                        strokeWidth={1.5}
                        style={{ color: colors.error }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <div className="text-sm" style={{ color: colors.body }}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                  style={{ borderColor: colors.border, borderRadius: "4px" }}
                >
                  <ChevronLeft size={16} style={{ color: colors.body }} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                  style={{ borderColor: colors.border, borderRadius: "4px" }}
                >
                  <ChevronRight size={16} style={{ color: colors.body }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
