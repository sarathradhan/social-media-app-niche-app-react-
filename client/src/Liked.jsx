// Liked posts page. Recent changes add loading/error/empty-state handling for a more reliable browsing experience.
import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import { EmptyState, ErrorState, LoadingState } from "./StatePanel";
import ImageLightbox from "./ImageLightbox";
import IconButton from "./components/IconButton";
import { HeartOffIcon } from "./components/Icons";

export default function Liked({ session }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const { addToast } = useToast();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/posts/liked");
      if (!res.ok) throw new Error("Unable to load liked posts");
      setPosts((await res.json()).posts || []);
    } catch (error) {
      const message = getApiErrorMessage({ message: error.message }, "Unable to load liked posts");
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleLike(id) {
    try {
      const res = await apiFetch(`/api/posts/${id}/like`, { method: "POST" });
      if (res.ok) setPosts((p) => p.filter((x) => x.id !== id));
    } catch (error) {
      addToast("Unable to update like", "error");
    }
  }

  if (loading) return <main className="main-rail"><LoadingState label="Loading liked posts..." /></main>;

  return (
    <main className="main-rail">
      <h1>Liked Posts</h1>
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!error && posts.length === 0 ? <EmptyState title="No liked posts" message="Like posts from the feed to see them here." /> : null}
      <div className="posts-container">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <div className="post-avatar">
                <img src={post.profile_pic_url ? `${API_BASE}${post.profile_pic_url}` : "/default.png"} alt={`avatar of ${post.username}`} loading="lazy" />
              </div>
              <a href={`/profile/${post.username}`} className="username-link">{post.username}</a>
            </div>
            <p>{post.caption}</p>
            {post.image_url && (
              <img
                src={`${API_BASE}${post.image_url}`}
                alt="Post Image"
                className="post-image"
                loading="lazy"
                onClick={() => setSelectedImage(`${API_BASE}${post.image_url}`)}
              />
            )}
            <div className="post-actions">
              <IconButton label="Unlike post" variant="accent" size="sm" onClick={() => toggleLike(post.id)}>
                <HeartOffIcon />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      <ImageLightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
    </main>
  );
}
