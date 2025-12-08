// client/src/NewExact.js
import React, { useState } from "react";
import { apiFetch } from "./api";
import { useNavigate } from "react-router-dom";

export default function New({ session }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("caption", caption);
    if (image) fd.append("image", image);
    const res = await apiFetch("/api/posts", { method: "POST", body: fd });
    if (res.ok) nav("/");
    else {
      const j = await res.json().catch(()=>({}));
      alert(j.error || "Upload failed");
    }
  }

  return (
    <main className="main-rail">
      <div className="post-form">
        <h2>Create a New Post</h2>
        <form onSubmit={submit} encType="multipart/form-data">
          <label>Caption</label>
          <textarea name="caption" id="caption" value={caption} onChange={e=>setCaption(e.target.value)} required />
          <label>Upload Image</label>
          <input type="file" name="image" id="image" accept="image/*" required onChange={e=>setImage(e.target.files[0])} />
          <button type="submit">Upload Post</button>
        </form>
      </div>
    </main>
  );
}
