import React, { useEffect } from "react";
import IconButton from "./components/IconButton";
import { CloseIcon } from "./components/Icons";

export default function ImageLightbox({ src, alt = "Full size image", onClose }) {
  useEffect(() => {
    if (!src) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image preview">
      <IconButton label="Close preview" variant="ghost" className="lightbox-close" onClick={onClose}>
        <CloseIcon />
      </IconButton>
      <img src={src} alt={alt} className="lightbox-image" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
