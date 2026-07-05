import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, API_BASE } from "./api";
import { useToast } from "./Toast";
import CommentSection from "./CommentSection";
import IconButton from "./components/IconButton";
import { CloseIcon } from "./components/Icons";

export default function PostPreviewModal({ post, session, authorUsername, onClose, onPostUpdate }) {
  const [localPost, setLocalPost] = useState(post);
  const { addToast } = useToast();
  const displayUsername = localPost.username || authorUsername || "user";

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function toggleLike() {
    try {
      const res = await apiFetch(`/api/posts/${localPost.id}/like`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || err.error || "Failed to update like", "error");
        return;
      }
      setLocalPost((prev) => {
        const currentCount = Number(prev.like_count) || 0;
        const next = {
          ...prev,
          user_liked: !prev.user_liked,
          like_count: prev.user_liked ? Math.max(currentCount - 1, 0) : currentCount + 1
        };
        onPostUpdate?.(next);
        return next;
      });
    } catch {
      addToast("Network error updating like", "error");
    }
  }

  return (
    <div className="modal-overlay post-preview-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Post preview">
      <div className="modal-content post-preview-modal" onClick={(e) => e.stopPropagation()}>
        <IconButton label="Close post preview" variant="ghost" className="modal-close" onClick={onClose}>
          <CloseIcon />
        </IconButton>

        <div className="post-preview-header">
          <div className="post-avatar">
            <img
              src={localPost.profile_pic_url ? `${API_BASE}${localPost.profile_pic_url}` : "/default.png"}
              alt=""
              loading="lazy"
            />
          </div>
          <Link to={`/profile/${displayUsername}`} className="username-link" onClick={onClose}>
            {displayUsername}
          </Link>
        </div>

        {localPost.image_url ? (
          <img src={`${API_BASE}${localPost.image_url}`} alt="Post" className="modal-image" />
        ) : null}

        {localPost.caption ? (
          <p className="modal-caption">{localPost.caption}</p>
        ) : (
          <p className="modal-caption modal-caption--empty">No caption</p>
        )}

        <div className="post-preview-actions">
          <button
            type="button"
            className={`like-btn ${localPost.user_liked ? "liked" : ""}`}
            onClick={toggleLike}
            aria-pressed={!!localPost.user_liked}
          >
            <span className="heart" aria-hidden="true" />
            <span className="count">{Number(localPost.like_count) || 0}</span>
          </button>
        </div>

        <CommentSection
          postId={localPost.id}
          session={session}
          initialCommentCount={Number(localPost.comment_count || 0)}
        />
      </div>
    </div>
  );
}
