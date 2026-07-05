// Post composer for creating new content. Recent changes add caption validation, image upload checks,
// progress feedback, submission protection, and consistent toast/error handling.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import { useSession } from "./App";
import { validateImageFile } from "./utils/imageValidation";

export default function New({ session }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const nav = useNavigate();
  const { addToast } = useToast();
  const { setSession } = useSession();

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;

    const trimmedCaption = caption.trim();
    const nextErrors = {};

    if (!trimmedCaption && !image) {
      nextErrors.caption = "Add a caption or choose an image.";
    }

    if (trimmedCaption.length > 220) {
      nextErrors.caption = "Caption must be 220 characters or less.";
    }

    if (image) {
      const validation = validateImageFile(image);
      if (!validation.valid) {
        nextErrors.image = validation.message;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setUploadProgress(20);

    try {
      const fd = new FormData();
      fd.append("caption", trimmedCaption);
      if (image) fd.append("image", image);

      const { data } = await apiRequest("/api/posts", { method: "POST", body: fd });
      setUploadProgress(100);
      addToast("Post created", "success");
      nav("/");
    } catch (error) {
      const message = getApiErrorMessage(error, "Upload failed");
      addToast(message, "error");
      if (error.status === 401) {
        setSession(null);
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <main className="main-rail">
      <div className="post-form">
        <h2>Create a New Post</h2>
        <form onSubmit={submit} encType="multipart/form-data" noValidate>
          <label>Caption</label>
          <textarea
            name="caption"
            id="caption"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              if (errors.caption) setErrors((prev) => ({ ...prev, caption: "" }));
            }}
            disabled={submitting}
            rows="4"
            placeholder="What would you like to share?"
          />
          <div className="char-count">{caption.trim().length}/220</div>
          {errors.caption ? <div className="field-error">{errors.caption}</div> : null}

          <label>Upload Image</label>
          <div className="file-drop">
            <input
              type="file"
              name="image"
              id="image"
              accept="image/png,image/jpeg,image/webp,image/gif"
              disabled={submitting}
              onChange={(e) => {
                const nextFile = e.target.files?.[0] || null;
                setImage(nextFile);
                if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
              }}
            />
            <span className="file-drop-label">{image ? image.name : "Choose an image"}</span>
            <span className="file-drop-hint">PNG, JPG, WEBP or GIF</span>
          </div>
          {errors.image ? <div className="field-error">{errors.image}</div> : null}
          {submitting ? (
            <div className="upload-progress" aria-live="polite">
              <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
              <span className="upload-progress-label">Uploading… {uploadProgress}%</span>
            </div>
          ) : null}
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Uploading..." : "Upload Post"}</button>
        </form>
      </div>
    </main>
  );
}
