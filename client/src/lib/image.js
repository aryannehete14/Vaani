// Shrink a chosen photo in the browser before upload, so shops stay fast on mobile data.
// WebP keeps logo transparency; browsers that cannot encode WebP fall back to JPEG or PNG.

const MAX_BYTES = 2 * 1024 * 1024;

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function resizeImage(file, { maxSide = 1000, keepAlpha = false } = {}) {
  if (!/^image\//.test(file?.type ?? '')) throw new Error('Please choose a photo (JPEG, PNG or WebP).');
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("We couldn't read that photo. Try a JPEG or PNG.");
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!keepAlpha) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  let blob = await toBlob(canvas, 'image/webp', 0.85);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, keepAlpha ? 'image/png' : 'image/jpeg', 0.85);
  if (!blob) throw new Error("We couldn't prepare that photo. Please try another one.");
  if (blob.size > MAX_BYTES) throw new Error('That photo is too large, even after shrinking. Please try a smaller one.');
  return blob;
}
