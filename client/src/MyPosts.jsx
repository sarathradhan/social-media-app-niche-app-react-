// My Posts page. Recent changes add loading/error/empty states and replace the old browser confirm flow
// with an in-app confirmation dialog before deleting a post.
import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import { EmptyState, ErrorState, LoadingState } from "./StatePanel";
import ImageLightbox from "./ImageLightbox";
import IconButton from "./components/IconButton";
import { CloseIcon, TrashIcon } from "./components/Icons";

export default function MyPosts({ session }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { addToast } = useToast();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/posts/mine");
      if (!res.ok) throw new Error("Unable to load your posts");
      setPosts((await res.json()).posts || []);
    } catch (error) {
      const message = getApiErrorMessage({ message: error.message }, "Unable to load your posts");
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!pendingDeleteId) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [pendingDeleteId]);

  async function removePost(id) {
    try {
      const res = await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Post deleted", "success");
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || err.error || "Delete failed", "error");
      }
    } catch (error) {
      addToast("Unable to delete post", "error");
    }
  }

  if (loading) return <main className="main-rail"><LoadingState label="Loading your posts..." /></main>;

  return (
    <main className="main-rail">
      <h1>My Posts</h1>
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!error && posts.length === 0 ? <EmptyState title="No posts yet" message="Share your first post to get started." /> : null}
      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
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
              <IconButton label="Delete post" variant="danger" size="sm" onClick={() => setPendingDeleteId(post.id)}>
                <TrashIcon />
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      {pendingDeleteId && (
        <div className="modal-overlay" onClick={() => setPendingDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this post?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <IconButton label="Cancel" variant="ghost" onClick={() => setPendingDeleteId(null)}>
                <CloseIcon />
              </IconButton>
              <IconButton
                label="Delete post"
                variant="danger"
                onClick={() => {
                  const id = pendingDeleteId;
                  setPendingDeleteId(null);
                  removePost(id);
                }}
              >
                <TrashIcon />
              </IconButton>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
    </main>
  );
}
