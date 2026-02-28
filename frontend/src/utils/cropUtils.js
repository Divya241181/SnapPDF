/**
 * Enhanced Image Processing Utilities for SnapPDF
 */

export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Perform a crop with rotation and flipping
 */
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box for rotation
  const { width: bBoxWidth, height: bBoxHeight } = getRadianChatSize(
    image.width,
    image.height,
    rotRad
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Returns the size of a rectangle that would enclose a rotated one
 */
function getRadianChatSize(width, height, rotation) {
  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));

  return {
    width: width * cos + height * sin,
    height: width * sin + height * cos,
  };
}

/**
 * Intelligent Document Boundary Detection (Auto-Clean)
 * Uses high-contrast gradient detection to find sharp document edges.
 */
export async function autoDetectBoundary(imageSrc) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Downscale for performance
  const maxDim = 600; 
  const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
  canvas.width = image.width * scale;
  canvas.height = image.height * scale;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  
  const getBrightness = (x, y) => {
    const i = (y * width + x) * 4;
    return (data[i] + data[i+1] + data[i+2]) / 3;
  };

  // Find bounding box of high-gradient areas (edges)
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let foundEdges = 0;

  // Edge detection sensitivity
  const edgeThreshold = 25; 

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // Simple Sobel-like gradient check
      const gx = Math.abs(getBrightness(x + 1, y) - getBrightness(x - 1, y));
      const gy = Math.abs(getBrightness(x, y + 1) - getBrightness(x, y - 1));
      
      if (gx + gy > edgeThreshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        foundEdges++;
      }
    }
  }

  // Fallback: If no edges found or area is too small, return original
  const area = (maxX - minX) * (maxY - minY);
  if (foundEdges < 100 || area < (width * height * 0.1)) {
    return imageSrc; 
  }

  // Add 4% padding for a professional "scan" look
  const padX = (maxX - minX) * 0.04;
  const padY = (maxY - minY) * 0.04;

  const finalX = Math.max(0, (minX - padX) / scale);
  const finalY = Math.max(0, (minY - padY) / scale);
  const finalW = Math.min(image.width - finalX, (maxX - minX + 2*padX) / scale);
  const finalH = Math.min(image.height - finalY, (maxY - minY + 2*padY) / scale);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = finalW;
  cropCanvas.height = finalH;
  const cropCtx = cropCanvas.getContext('2d');
  
  // Use high-quality scaling
  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = 'high';
  cropCtx.drawImage(image, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);

  return new Promise((resolve) => {
    cropCanvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  });
}
