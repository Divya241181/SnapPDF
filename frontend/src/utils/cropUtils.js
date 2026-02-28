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
 * Intelligent Document Boundary Detection (Auto-Crop)
 * Detects the document area based on contrast and edge consistency.
 */
export async function autoDetectBoundary(imageSrc) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Use a smaller canvas for analysis speed
  const maxDim = 800;
  const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
  canvas.width = image.width * scale;
  canvas.height = image.height * scale;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  
  // 1. Convert to grayscale and find background color (mode of corners)
  const getBrightness = (i) => (data[i] + data[i+1] + data[i+2]) / 3;
  
  // Sample corners to estimate background
  const samplePoints = [
    {x: 5, y: 5}, {x: width-5, y: 5}, {x: 5, y: height-5}, {x: width-5, y: height-5},
    {x: width/2, y: 5}, {x: width/2, y: height-5}
  ];
  let avgBg = 0;
  samplePoints.forEach(p => {
    avgBg += getBrightness((Math.floor(p.y) * width + Math.floor(p.x)) * 4);
  });
  avgBg /= samplePoints.length;

  // 2. Scan from edges to find the first significant change in contrast
  const threshold = 35;
  let minX = 0, maxX = width, minY = 0, maxY = height;

  // Top to bottom
  outer: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (Math.abs(getBrightness((y * width + x) * 4) - avgBg) > threshold) {
        minY = y; break outer;
      }
    }
  }
  // Bottom to top
  outer: for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (Math.abs(getBrightness((y * width + x) * 4) - avgBg) > threshold) {
        maxY = y; break outer;
      }
    }
  }
  // Left to right
  outer: for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (Math.abs(getBrightness((y * width + x) * 4) - avgBg) > threshold) {
        minX = x; break outer;
      }
    }
  }
  // Right to left
  outer: for (let x = width - 1; x >= 0; x--) {
    for (let y = 0; y < height; y++) {
      if (Math.abs(getBrightness((y * width + x) * 4) - avgBg) > threshold) {
        maxX = x; break outer;
      }
    }
  }

  // Safety check: if detected box is too small, return original
  if (maxX - minX < width * 0.1 || maxY - minY < height * 0.1) {
    return imageSrc;
  }

  // Add slight margin (3%)
  const padX = (maxX - minX) * 0.03;
  const padY = (maxY - minY) * 0.03;

  const cropCanvas = document.createElement('canvas');
  const finalX = Math.max(0, (minX - padX) / scale);
  const finalY = Math.max(0, (minY - padY) / scale);
  const finalW = Math.min(image.width - finalX, (maxX - minX + 2*padX) / scale);
  const finalH = Math.min(image.height - finalY, (maxY - minY + 2*padY) / scale);
  
  cropCanvas.width = finalW;
  cropCanvas.height = finalH;
  const cropCtx = cropCanvas.getContext('2d');
  cropCtx.drawImage(image, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);

  return new Promise((resolve) => {
    cropCanvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  });
}
