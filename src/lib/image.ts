/** About 500 KB of JPEG once decoded. Keeps the database small. */
const TARGET_CHARS = 700_000;

/** Shrinks a photo and returns it as base64 JPEG (no "data:" prefix). */
export async function shrinkPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  let result = '';
  // Smaller and a little more compressed until it fits. The text must stay readable.
  for (const [maxSide, quality] of [[1600, 0.82], [1600, 0.7], [1400, 0.65], [1200, 0.6]]) {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    result = canvas.toDataURL('image/jpeg', quality).split(',')[1];
    if (result.length <= TARGET_CHARS) break;
  }
  bitmap.close();
  return result;
}
