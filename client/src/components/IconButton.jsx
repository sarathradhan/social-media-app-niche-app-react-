import React from "react";

export default function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className = "",
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`icon-btn icon-btn--${variant} icon-btn--${size}${className ? ` ${className}` : ""}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
