"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  Plus,
  Loader2,
  MoreHorizontal,
  User,
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
  accentHover: "#14532d",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
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

type FilterType = "all" | "following" | "my_posts";

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [liking, setLiking] = useState<string | null>(null);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [filter, selectedTag]);

  const fetchPosts = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", "10");
      params.set("filter", filter);
      if (selectedTag) {
        params.set("tag", selectedTag);
      }

      const response = await fetch(`/api/v1/community/posts?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (response.ok) {
        const newPosts = data.data.posts || [];
        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }
        setHasMore(pageNum < data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/community");
      return;
    }

    setLiking(postId);
    try {
      const response = await fetch(`/api/v1/community/posts/${postId}/like`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                is_liked_by_user: !isLiked,
                _count: {
                  ...post._count,
                  likes: isLiked
                    ? post._count.likes - 1
                    : post._count.likes + 1,
                },
              };
            }
            return post;
          }),
        );
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLiking(null);
    }
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/community/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
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

  const filteredPosts = posts.filter(
    (post) =>
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const popularTags = [
    "organic",
    "farming",
    "tips",
    "recipes",
    "harvest",
    "sustainable",
  ];

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Header */}
      <section
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold" style={{ color: colors.heading }}>
              Community
            </h1>
            <Link
              href="/community/new"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              <Plus size={16} />
              New Post
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.body }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                backgroundColor: colors.white,
              }}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(["all", "following", "my_posts"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 text-sm font-medium whitespace-nowrap"
                style={{
                  backgroundColor: filter === f ? colors.accent : colors.white,
                  color: filter === f ? colors.white : colors.body,
                  borderRadius: "9999px",
                  border: `1px solid ${filter === f ? colors.accent : colors.border}`,
                }}
              >
                {f === "all"
                  ? "All Posts"
                  : f === "following"
                    ? "Following"
                    : "My Posts"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Popular Tags */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className="px-3 py-1 text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor:
                  selectedTag === tag ? colors.successBg : colors.white,
                color: selectedTag === tag ? colors.accent : colors.body,
                borderRadius: "9999px",
                border: `1px solid ${selectedTag === tag ? colors.accent : colors.border}`,
              }}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: colors.body }}>No posts found</p>
            {filter === "my_posts" && (
              <Link
                href="/community/new"
                className="inline-block mt-4 px-6 py-2 text-sm font-medium"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  borderRadius: "4px",
                }}
              >
                Create your first post
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "8px",
                }}
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 p-4">
                  {post.farmer ? (
                    <Link
                      href={`/farmers/${post.farmer.id}`}
                      className="w-10 h-10 flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: colors.successBg,
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
                        <Leaf size={20} style={{ color: colors.accent }} />
                      )}
                    </Link>
                  ) : (
                    <div
                      className="w-10 h-10 flex items-center justify-center overflow-hidden"
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
                        <User size={20} style={{ color: colors.body }} />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {post.farmer ? (
                        <Link
                          href={`/farmers/${post.farmer.id}`}
                          className="font-medium text-sm hover:underline truncate"
                          style={{ color: colors.heading }}
                        >
                          {post.farmer.name}
                        </Link>
                      ) : (
                        <p
                          className="font-medium text-sm truncate"
                          style={{ color: colors.heading }}
                        >
                          {post.user.name}
                        </p>
                      )}
                      {post.farmer?.isVerified && (
                        <CheckCircle
                          size={14}
                          style={{ color: colors.success }}
                          className="shrink-0"
                        />
                      )}
                      {post.farmer && (
                        <span
                          className="text-xs px-2 py-0.5 shrink-0"
                          style={{
                            backgroundColor: colors.successBg,
                            color: colors.accent,
                            borderRadius: "4px",
                          }}
                        >
                          Farm
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: colors.body }}>
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <button className="p-2">
                    <MoreHorizontal size={20} style={{ color: colors.body }} />
                  </button>
                </div>

                {/* Post Content */}
                <Link href={`/community/${post.id}`}>
                  <div className="px-4 pb-3">
                    <h2
                      className="font-semibold text-lg mb-2 hover:underline"
                      style={{ color: colors.heading }}
                    >
                      {post.title}
                    </h2>
                    <p
                      className="text-sm line-clamp-3"
                      style={{ color: colors.body }}
                    >
                      {post.content}
                    </p>
                  </div>
                </Link>

                {/* Post Images */}
                {post.images.length > 0 && (
                  <Link href={`/community/${post.id}`}>
                    <div
                      className={`grid gap-1 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                    >
                      {post.images.slice(0, 4).map((image, idx) => (
                        <div
                          key={image.id}
                          className="aspect-video relative"
                          style={{ backgroundColor: "#f4f4f5" }}
                        >
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {idx === 3 && post.images.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold text-xl">
                                +{post.images.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Link>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-4 py-3">
                    {post.tags.map((t) => (
                      <button
                        key={t.tag}
                        onClick={() => setSelectedTag(t.tag)}
                        className="text-xs"
                        style={{ color: colors.accent }}
                      >
                        #{t.tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div
                  className="flex items-center gap-6 px-4 py-3 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <button
                    onClick={() =>
                      handleLike(post.id, post.is_liked_by_user || false)
                    }
                    disabled={liking === post.id}
                    className="flex items-center gap-2 text-sm"
                    style={{
                      color: post.is_liked_by_user ? colors.error : colors.body,
                    }}
                  >
                    <Heart
                      size={18}
                      fill={post.is_liked_by_user ? colors.error : "none"}
                    />
                    {post._count.likes}
                  </button>
                  <Link
                    href={`/community/${post.id}`}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: colors.body }}
                  >
                    <MessageCircle size={18} />
                    {post._count.comments}
                  </Link>
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: colors.body }}
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </article>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium border"
                  style={{
                    borderColor: colors.border,
                    color: colors.heading,
                    borderRadius: "4px",
                    backgroundColor: colors.white,
                  }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
