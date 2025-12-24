#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Resizes images larger than 2000px to max 2000px (maintaining aspect ratio)
 * and optimizes them for web performance.
 *
 * Usage:
 *   node tools/optimize-images.mjs
 *
 * Requirements:
 *   npm install sharp --save-dev
 */

import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';

const MAX_DIMENSION = 2000;
const IMAGE_DIRS = [
  'public/images/materical',
  'public/images/visual',
  'public/images/performance',
  'public/images/music',
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

let processedCount = 0;
let resizedCount = 0;
let errorCount = 0;

async function getAllImageFiles(dir) {
  const files = [];

  function scan(directory) {
    try {
      const entries = readdirSync(directory);

      for (const entry of entries) {
        const fullPath = join(directory, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (IMAGE_EXTENSIONS.includes(extname(entry).toLowerCase())) {
          files.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error scanning ${directory}:`, err.message);
    }
  }

  scan(dir);
  return files;
}

async function optimizeImage(filePath) {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    const { width, height, format } = metadata;
    const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;

    if (!needsResize) {
      console.log(`✓ ${filePath} (${width}x${height}) - already optimized`);
      processedCount++;
      return;
    }

    // Calculate new dimensions maintaining aspect ratio
    let newWidth = width;
    let newHeight = height;

    if (width > height) {
      if (width > MAX_DIMENSION) {
        newWidth = MAX_DIMENSION;
        newHeight = Math.round((height * MAX_DIMENSION) / width);
      }
    } else {
      if (height > MAX_DIMENSION) {
        newHeight = MAX_DIMENSION;
        newWidth = Math.round((width * MAX_DIMENSION) / height);
      }
    }

    // Resize and optimize
    await image
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .png({ quality: 85, compressionLevel: 9 })
      .webp({ quality: 85 })
      .toFile(filePath + '.tmp');

    // Replace original with optimized version
    const fs = await import('fs/promises');
    await fs.unlink(filePath);
    await fs.rename(filePath + '.tmp', filePath);

    console.log(`✓ ${filePath} (${width}x${height} → ${newWidth}x${newHeight}) - resized & optimized`);
    processedCount++;
    resizedCount++;

  } catch (err) {
    console.error(`✗ ${filePath} - Error: ${err.message}`);
    errorCount++;
  }
}

async function main() {
  console.log('🖼️  Image Optimization Starting...\n');
  console.log(`Max dimension: ${MAX_DIMENSION}px\n`);

  for (const dir of IMAGE_DIRS) {
    console.log(`\n📂 Processing: ${dir}`);
    const files = await getAllImageFiles(dir);

    if (files.length === 0) {
      console.log(`  No images found`);
      continue;
    }

    for (const file of files) {
      await optimizeImage(file);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✨ Optimization Complete!`);
  console.log(`   Processed: ${processedCount} images`);
  console.log(`   Resized: ${resizedCount} images`);
  console.log(`   Errors: ${errorCount} images`);
  console.log('='.repeat(60));
}

main().catch(console.error);
