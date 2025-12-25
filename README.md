# Ræhm Portfolio

A sophisticated artistic portfolio showcasing multi-disciplinary creative works across materical art, visual projects, performance, and music.

[![Live Site](https://img.shields.io/badge/Live-raehm.com-chocolate)](https://www.raehm.com/)

## 🎨 Features

- **Multi-Category Portfolio**: Organized sections for materical, visual, performance, and music projects
- **Advanced Navigation**: Horizontal page transitions with vertical scroll-snap sections
- **Responsive Galleries**:
  - Masonry layouts for visual projects
  - Grid-based layouts for materical works
  - Touch/mouse drag support across all galleries
- **Full-Screen Lightbox**: Keyboard, click zones, and swipe navigation
- **Content Warning System**: Age-gate with localStorage persistence
- **Image Optimization Pipeline**: Automatic manifest generation with dimension extraction
- **Mobile-First Design**: Optimized for all devices with dynamic viewport units

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router with custom vertical navigation
- **Styling**: SCSS with modular architecture
- **Icons**: FontAwesome

## 📁 Project Structure

```
├── public/
│   ├── images/              # Project images organized by category
│   └── projects/            # Project data JSON files
├── src/
│   ├── assets/              # Static assets (logos, fonts)
│   ├── components/          # Reusable components
│   ├── composables/         # Vue composables (navigation logic)
│   ├── directives/          # Custom directives (image loader, fit-to-viewport)
│   ├── lib/                 # Utility libraries (gallery, layout chooser)
│   ├── router/              # Vue Router configuration
│   ├── stores/              # Pinia stores
│   ├── style/               # SCSS modules
│   └── views/               # Page components
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot-reload
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🖼️ Adding New Projects

1. Create a directory in `public/images/{category}/{project-id}/`
2. Add images following the naming convention:
   - `cover.*` - Project cover image
   - `profilo.*` - Profile/portrait images
   - `full.*` - Full-size images
   - `dettaglio-{N}.*` - Detail images (numbered)
3. Add project metadata to `public/projects/{category}.json`
4. Rebuild the project to update the images manifest

## 🎯 Key Concepts

### Navigation Architecture

- **Horizontal**: Transitions between main pages (rahem, materical, visual, performance, music)
- **Vertical**: Scroll-snap navigation within page sections
- **Touch/Mouse Drag**: Swipe support across all galleries

### State Management

- `stores/projects.js` - Project data and gallery hydration
- `stores/ui.js` - Page order, transition directions, scroll state
- `stores/gallery.js` - Full-screen gallery state
- `stores/environment.js` - Device/viewport detection

### Custom Directives

- `v-image-loader` - Displays Ouroboros loader during image load
- `v-fit-to-viewport` - Responsive image scaling

## 📝 Configuration

### Adding New Categories

1. Create JSON file in `public/projects/{category}.json`
2. Add route in `src/router/index.js`
3. Create view component in `src/views/`
4. Add to page order in `stores/ui.js`

### Customizing Styles

SCSS variables and mixins are centralized in `src/style/partials/`:
- `_colors.scss` - Color palette
- `_typography.scss` - Font definitions
- `_variables.scss` - Breakpoints, spacing
- `_mixins.scss` - Reusable SCSS mixins

## 🌐 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- CSS features: Grid, Flexbox, scroll-snap, backdrop-filter

## 📄 License

All content is protected by intellectual property rights.
© 2025 Marco Campobasso

## 🔗 Links

- **Live Site**: [raehm.com](https://www.raehm.com/)
- **Privacy Policy**: [raehm.com/privacy-policy](https://www.raehm.com/privacy-policy)

---

**Developed by** [Sara Campobasso](https://www.linkedin.com/in/sara-campobasso/)
