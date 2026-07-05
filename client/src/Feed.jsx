// Home feed page. Recent changes add loading skeletons, empty/error states, retry handling,
// and more reliable like-feedback behavior for a smoother browsing experience.
import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import { EmptyState, ErrorState, FeedSkeleton, LoadingState } from "./StatePanel";
import CommentSection from "./CommentSection";
import ImageLightbox from "./ImageLightbox";
import IconButton from "./components/IconButton";
import { CheckIcon, CloseIcon, EditIcon } from "./components/Icons";

export default function Feed({ session }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const { addToast } = useToast();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await apiFetch("/api/posts");
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Failed to load posts");
      }
      const j = await r.json();
      setPosts(j.posts || []);
    } catch (err) {
      const message = getApiErrorMessage({ message: err.message }, "Network error loading posts");
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleLike(postId) {
    try {
      const res = await apiFetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        setPosts((p) => p.map((x) => {
          if (x.id === Number(postId)) {
            const currentCount = Number(x.like_count) || 0;
            return { ...x, user_liked: !x.user_liked, like_count: x.user_liked ? currentCount - 1 : currentCount + 1 };
          }
          return x;
        }));
        addToast("Like updated", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast(errData.message || errData.error || "Failed to update like", "error");
      }
    } catch (e) {
      addToast("Network error updating like", "error");
    }
  }

  if (loading) return <main className="main-rail"><FeedSkeleton /></main>;

  return (
    <main className="main-rail">
      <h1>Posts</h1>
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!error && posts.length === 0 ? <EmptyState title="No posts yet" message="Be the first to share something with the community." /> : null}
      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-avatar">
                <img src={post.profile_pic_url ? `${API_BASE}${post.profile_pic_url}` : "/default.png"} alt="avatar" loading="lazy" />
              </div>
              <a href={`/profile/${post.username}`} className="username-link">{post.username}</a>
              {session && session.userId === post.user_id ? (
                <IconButton
                  label="Edit post"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditingId(post.id); setEditCaption(post.caption || ""); }}
                >
                  <EditIcon />
                </IconButton>
              ) : null}
            </div>

            {editingId === post.id ? (
              <div>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={3}
                  disabled={savingEdit}
                />
                <div className="edit-actions">
                  <IconButton
                    label={savingEdit ? "Saving post" : "Save post"}
                    variant="success"
                    size="sm"
                    disabled={savingEdit}
                    onClick={async () => {
                      if (savingEdit) return;
                      const trimmed = (editCaption || "").trim();
                      if (trimmed.length > 220) {
                        addToast("Caption must be 220 characters or less.", "error");
                        return;
                      }
                      if (!trimmed && !post.image_url) {
                        addToast("Post must have a caption or an image.", "error");
                        return;
                      }
                      setSavingEdit(true);
                      try {
                        const res = await apiFetch(`/api/posts/${post.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ caption: trimmed })
                        });
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          throw new Error(err.message || err.error || "Failed to update post");
                        }
                        const body = await res.json();
                        const updated = body.post;
                        setPosts((p) => p.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
                        addToast("Post updated", "success");
                        setEditingId(null);
                      } catch (e) {
                        const msg = e.message || "Network error updating post";
                        addToast(msg, "error");
                      } finally {
                        setSavingEdit(false);
                      }
                    }}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    label="Cancel edit"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingId(null); setEditCaption(""); }}
                    disabled={savingEdit}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            ) : (
              <p>{post.caption}</p>
            )}
            {post.image_url && (
              <img
                src={`${API_BASE}${post.image_url}`}
                alt="Post Image"
                className="post-image"
                loading="lazy"
                onClick={() => setSelectedImage(`${API_BASE}${post.image_url}`)}
              />
            )}

            <button
              id={`like-button-${post.id}`}
              className={`like-btn ${post.user_liked ? "liked" : ""}`}
              data-id={post.id}
              type="button"
              onClick={() => toggleLike(post.id)}
            >
              <span className="heart"></span>
              <span className="count" id={`likes-${post.id}`}>{Number(post.like_count) || 0}</span>
            </button>
            <CommentSection postId={post.id} session={session} initialCommentCount={Number(post.comment_count || 0)} />
          </div>
        ))}
      </div>

      <ImageLightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
    </main>
  );
}
