#!/usr/bin/env node

import { readdirSync, statSync, unlinkSync, renameSync } from 'fs';
import { join, dirname, basename } from 'path';

const IMAGE_DIRS = [
  'public/images/materical',
  'public/images/visual',
];

let count = 0;
let errors = 0;

console.log('🔄 Replacing original images with optimized versions...\n');

function processDirectory(dir) {
  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.includes('.optimized.')) {
        // Extract original filename: "cover.jpg.optimized.jpg" -> "cover.jpg"
        // Split by ".optimized." and take only the first part
        const originalName = entry.split('.optimized.')[0];
        const originalPath = join(dirname(fullPath), originalName);

        try {
          // Remove original file
          unlinkSync(originalPath);
          // Rename optimized to original name
          renameSync(fullPath, originalPath);
          console.log(`✓ ${originalName}`);
          count++;
        } catch (err) {
          console.error(`✗ ${entry} - Error: ${err.message}`);
          errors++;
        }
      }
    }
  } catch (err) {
    console.error(`Error processing ${dir}:`, err.message);
  }
}

for (const dir of IMAGE_DIRS) {
  console.log(`\n📂 Processing: ${dir}`);
  processDirectory(dir);
}

console.log('\n' + '='.repeat(60));
console.log(`✨ Replacement Complete!`);
console.log(`   Replaced: ${count} images`);
console.log(`   Errors: ${errors} images`);
console.log('='.repeat(60));
