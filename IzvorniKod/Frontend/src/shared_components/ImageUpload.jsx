import { useState } from "react";

export default function ImageUpload({ label, currentUrl, onUpload, onDelete, accept = "image/*" }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    // Reset input value so same file can be selected again
    e.target.value = "";
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      await onUpload(file);
    } catch (e) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remove this image?")) return;

    setDeleting(true);
    setError("");

    try {
      await onDelete();
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="image-upload-field">
      <label className="form-field-label">{label}</label>
      
      {currentUrl && (
        <div className="image-preview">
          <img src={currentUrl} alt="Preview" />
          <button
            type="button"
            className="btn-danger-small"
            onClick={handleDelete}
            disabled={deleting || uploading}
          >
            {deleting ? "Removing..." : "Remove"}
          </button>
        </div>
      )}

      <div className="file-input-wrapper">
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading || deleting}
          className="file-input"
        />
        <span className="file-input-label">
          {uploading ? "Uploading..." : currentUrl ? "Change image" : "Choose image"}
        </span>
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
