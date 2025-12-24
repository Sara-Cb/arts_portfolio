# Image Optimization Guide

## Quick Start

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Run the optimization script**:
   ```bash
   npm run optimize:images
   ```

## What it does

The script will:
- Scan all images in `public/images/` directories (materical, visual, performance, music)
- Find images larger than 2000px in width or height
- Resize them to max 2000px while maintaining aspect ratio
- Optimize quality (JPEG: 85%, PNG: 85%, WebP: 85%)
- Use progressive encoding for faster loading
- Replace original files with optimized versions

## Example Output

```
🖼️  Image Optimization Starting...
Max dimension: 2000px

📂 Processing: public/images/materical
✓ public/images/materical/connessione/cover.jpg (1500x1200) - already optimized
✓ public/images/materical/palude/full.jpg (3200x2400 → 2000x1500) - resized & optimized
✓ public/images/materical/time-machine/dettaglio-1.jpg (2500x1800 → 2000x1440) - resized & optimized

=============================================================
✨ Optimization Complete!
   Processed: 145 images
   Resized: 48 images
   Errors: 0 images
=============================================================
```

## Manual Usage (Alternative)

If you prefer using Sharp directly in Node.js console:

```javascript
import sharp from 'sharp';

// Resize single image
await sharp('path/to/image.jpg')
  .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85, progressive: true })
  .toFile('path/to/image-optimized.jpg');
```

## After Optimization

Don't forget to regenerate the manifest:
```bash
npm run build:manifest
```

## Performance Benefits

- **Faster page loads**: Smaller file sizes
- **Better UX**: Progressive JPEG loading
- **Lower bandwidth**: Reduced data transfer
- **SEO improvement**: Better Core Web Vitals scores
