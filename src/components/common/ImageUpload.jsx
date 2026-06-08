import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'aurafit_unsigned';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function uploadToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME) {
    // Fallback: convert to base64 data URL (works without Cloudinary)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'aurafit');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) throw new Error('Upload failed. Please try again.');
  const data = await res.json();
  return data.secure_url;
}

export default function ImageUpload({
  currentImage,
  onUpload,
  size = 80,
  label = 'Change Photo',
  shape = 'circle',
  initials = '?',
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }

    setUploading(true);
    try {
      // Show local preview immediately (optimistic)
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      const url = await uploadToCloudinary(file);
      setPreview(url);
      onUpload(url);
      toast.success('Photo updated! 📷');
    } catch (err) {
      setPreview(currentImage);
      toast.error('Upload failed. Please try again.');
    }
    setUploading(false);
  }, [currentImage, onUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const borderRadius = shape === 'circle' ? '50%' : 12;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      {/* Avatar */}
      <div style={{
        width: size, height: size, borderRadius,
        background: preview ? 'transparent' : 'var(--accent)',
        border: dragOver ? '2px dashed var(--accent)' : '1px solid var(--border-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', transition: 'all 0.2s',
        opacity: uploading ? 0.7 : 1,
      }}>
        {preview
          ? <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: '#fff', fontSize: size * 0.35, fontWeight: 700 }}>{initials}</span>
        }
      </div>

      {/* Upload overlay */}
      <AnimatePresence>
        {uploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, borderRadius,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 20, height: 20, border: '2px solid #fff3', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              position: 'absolute', inset: 0, borderRadius,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2,
            }}
          >
            <span style={{ fontSize: size * 0.28, lineHeight: 1 }}>📷</span>
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1 }}>
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        aria-hidden="true"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
