import React, { useEffect, useState } from "react";
import { apiFetch, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import IconButton from "./components/IconButton";
import { SendIcon, TrashIcon } from "./components/Icons";

export default function CommentSection({ postId, session, initialCommentCount = 0 }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const { addToast } = useToast();

  const currentUserId = session?.id ?? session?.user?.id ?? null;

  async function loadComments() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Unable to load comments");
      const data = await res.json();
      setComments(data.comments || []);
      setCommentCount(Number(data.commentCount || data.comments?.length || 0));
    } catch (err) {
      const message = getApiErrorMessage({ message: err.message }, "Unable to load comments");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function submitComment(e) {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) {
      setCommentError("Comment cannot be empty.");
      return;
    }
    if (trimmed.length > 280) {
      setCommentError("Comment must be 280 characters or less.");
      return;
    }

    setCommentError("");
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: trimmed })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || "Unable to add comment");
      }
      setComments((prev) => [data.comment, ...prev]);
      setCommentCount((prev) => prev + 1);
      setCommentText("");
      addToast("Comment added", "success");
    } catch (err) {
      const message = getApiErrorMessage({ message: err.message }, "Unable to add comment");
      addToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeComment(commentId) {
    try {
      const res = await apiFetch(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || "Unable to delete comment");
      }
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setCommentCount((prev) => Math.max(prev - 1, 0));
      addToast("Comment removed", "success");
    } catch (err) {
      const message = getApiErrorMessage({ message: err.message }, "Unable to delete comment");
      addToast(message, "error");
    }
  }

  return (
    <div className="comment-section">
      <div className="comment-header">
        <strong>Comments ({commentCount})</strong>
        {loading ? <span className="text-muted" style={{ fontSize: 12 }}>Loading…</span> : null}
      </div>

      <form onSubmit={submitComment} className="comment-form">
        <textarea
          rows="2"
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
            if (commentError) setCommentError("");
          }}
          placeholder="Write a comment..."
          disabled={submitting}
        />
        <div className="comment-form-footer">
          <span className="field-error">{commentError}</span>
          <IconButton type="submit" label={submitting ? "Posting comment" : "Post comment"} variant="primary" size="sm" disabled={submitting}>
            <SendIcon />
          </IconButton>
        </div>
      </form>

      {error ? <div className="field-error" style={{ marginTop: 8 }}>{error}</div> : null}

      {!loading && comments.length === 0 ? (
        <div className="comment-empty">No comments yet. Start the conversation.</div>
      ) : null}

      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-item-header">
              <strong>{comment.username}</strong>
              {currentUserId && Number(comment.user_id) === Number(currentUserId) ? (
                <IconButton label="Delete comment" variant="danger" size="sm" onClick={() => removeComment(comment.id)}>
                  <TrashIcon />
                </IconButton>
              ) : null}
            </div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-time">{new Date(comment.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
