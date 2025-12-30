/**
 * SEO Composable: Gestisce meta tags dinamici per ogni pagina
 *
 * Aggiorna title, description, Open Graph tags, Twitter cards
 * Utilizzato in ogni view per ottimizzare la SEO
 */
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const SITE_NAME = 'Ræhm';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://raehm.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION = 'Contemporary artist portfolio featuring sculpture, visual art, performance, and music. Mature content (18+).';

export function useSeo(options = {}) {
  const route = useRoute();

  // Opzioni con valori di default
  const {
    title = SITE_NAME,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    type = 'website',
    url = null,
    keywords = [],
    noIndex = false,
  } = options;

  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const fullUrl = url || `${SITE_URL}${route.path}`;

  function updateMeta() {
    // Title
    document.title = fullTitle;

    // Description
    setMetaTag('name', 'description', description);

    // Keywords (se fornite)
    if (keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    }

    // Robots (no-index se richiesto)
    if (noIndex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Open Graph
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', fullUrl);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', SITE_NAME);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // Canonical URL
    setCanonicalLink(fullUrl);
  }

  function setMetaTag(attr, key, content) {
    let element = document.querySelector(`meta[${attr}="${key}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, key);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  function setCanonicalLink(url) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  onMounted(() => {
    updateMeta();
  });

  // Watch per aggiornamenti dinamici
  watch(() => options, () => {
    updateMeta();
  }, { deep: true });

  return {
    updateMeta,
  };
}

/**
 * Structured Data (JSON-LD)
 * Aggiunge dati strutturati per Google Rich Results
 */
export function useStructuredData(data) {
  onMounted(() => {
    const scriptId = 'structured-data';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  });
}

/**
 * Genera structured data per un artista
 */
export function getArtistStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ræhm',
    jobTitle: 'Contemporary Artist',
    url: SITE_URL,
    sameAs: [
      'https://open.spotify.com/artist/6Tqf2cvcNjPdTVjuxynWEB',
      'https://youtube.com/@ex.raehmm',
      'https://www.instagram.com/raehm____',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Independent Artist',
    },
    knowsAbout: ['Sculpture', 'Visual Art', 'Performance Art', 'Music'],
  };
}

/**
 * Genera structured data per un progetto artistico
 */
export function getCreativeWorkStructuredData(project, category) {
  const typeMap = {
    materical: 'VisualArtwork',
    visual: 'VisualArtwork',
    performance: 'PerformanceRole',
    music: 'MusicRecording',
  };

  return {
    '@context': 'https://schema.org',
    '@type': typeMap[category] || 'CreativeWork',
    name: project.title,
    description: project.description || project.subtitle || '',
    creator: {
      '@type': 'Person',
      name: 'Ræhm',
    },
    dateCreated: project.date,
    ...(project.videoId && {
      video: {
        '@type': 'VideoObject',
        name: project.title,
        embedUrl: `https://www.youtube.com/embed/${project.videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${project.videoId}/maxresdefault.jpg`,
      },
    }),
  };
}
