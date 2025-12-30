# SEO Implementation Guide

Questo portfolio ha una configurazione SEO completa per migliorare la visibilità sui motori di ricerca.

## 🎯 Cosa abbiamo implementato

### 1. Meta Tags Dinamici
Ogni pagina ha meta tags ottimizzati che cambiano in base al contenuto:

- **Title**: Titolo ottimizzato per ogni pagina
- **Description**: Descrizione unica e coinvolgente
- **Keywords**: Parole chiave rilevanti
- **Open Graph**: Per condivisioni su Facebook/LinkedIn
- **Twitter Card**: Per condivisioni su Twitter/X
- **Canonical URL**: Evita contenuti duplicati

### 2. Structured Data (JSON-LD)
Dati strutturati per Google Rich Results:
- Schema Artist per la homepage
- Schema CreativeWork per ogni progetto
- Informazioni su video, date, descrizioni

### 3. Sitemap Dinamica
Sitemap XML generata automaticamente con tutti i tuoi progetti:
- 38+ URL totali
- Priorità e frequenze di aggiornamento
- Date di ultima modifica

### 4. Files Statici
- `robots.txt`: Istruzioni per crawler
- `sitemap.xml`: Mappa del sito
- `favicon.ico`: Icona del sito

## 📝 Come usare la SEO

### In ogni View Component

Aggiungi il composable `useSeo` per gestire i meta tags:

```vue
<script setup>
import { useSeo, useStructuredData, getArtistStructuredData } from "@/composables/useSeo";

// Meta tags statici per una pagina
useSeo({
  title: "Il Tuo Titolo",
  description: "La tua descrizione ottimizzata",
  keywords: ["parola1", "parola2"],
});

// Oppure meta tags dinamici (reactive)
const seoOptions = computed(() => ({
  title: `${currentProject.value.title} | Music`,
  description: `Descrizione dinamica per ${currentProject.value.title}`,
}));

useSeo(seoOptions);

// Structured data
useStructuredData(getArtistStructuredData());
</script>
```

### Genera Sitemap

Prima di ogni deploy:

```bash
npm run build:sitemap
```

La sitemap viene generata automaticamente anche durante `npm run build`.

## 🚀 Deployment Checklist

### ✅ Completato

- [x] **Dominio configurato**: raehm.com nel file `.env`
- [x] **`index.html` aggiornato**: Tutti i link puntano a raehm.com
- [x] **`robots.txt` aggiornato**: Sitemap URL configurata
- [x] **Sitemap generata**: 38 URL totali per raehm.com
- [x] **SEO implementata**: Tutte le views hanno meta tags dinamici

### 🎯 Da Completare Prima del Deploy

### 1. Crea immagine Open Graph

Crea `public/og-image.jpg` (1200x630px) con:
- Nome artista
- Esempio di opera
- Contenuto accattivante

### 6. Verifica build

```bash
npm run build
npm run preview
```

Controlla che tutti i meta tags siano corretti visitando diverse pagine.

## 📊 Dopo il Deploy

### Google Search Console

1. Vai su [Google Search Console](https://search.google.com/search-console)
2. Aggiungi il tuo sito
3. Verifica la proprietà
4. Invia la sitemap: `https://tuodominio.com/sitemap.xml`

### Test SEO

- **Meta Tags**: [https://metatags.io/](https://metatags.io/)
- **Open Graph**: [https://www.opengraph.xyz/](https://www.opengraph.xyz/)
- **Structured Data**: [Google Rich Results Test](https://search.google.com/test/rich-results)
- **Mobile Friendly**: [Google Mobile Test](https://search.google.com/test/mobile-friendly)

## 🎨 Personalizzazione SEO

### Per Materical/Visual Views

Segui lo stesso pattern di MusicView:

```vue
const currentProject = computed(() => {
  if (!route.params.slug) return null;
  return projectsStore.getMaterical(route.params.slug);
});

const seoOptions = computed(() => {
  if (currentProject.value) {
    return {
      title: `${currentProject.value.title} | Materical`,
      description: currentProject.value.description,
      keywords: ["sculpture", currentProject.value.title],
    };
  }
  return {
    title: "Materical | Ræhm",
    description: "Explore material art and sculptures...",
  };
});

useSeo(seoOptions);

watch(currentProject, (project) => {
  if (project) {
    useStructuredData(getCreativeWorkStructuredData(project, "materical"));
  }
}, { immediate: true });
```

## 📈 Best Practices

### Title
- Max 60 caratteri
- Include nome artista
- Descrittivo e unico per ogni pagina

### Description
- Max 160 caratteri
- Include CTA (Call To Action)
- Menziona "Mature content (18+)" dove appropriato

### Keywords
- 5-10 parole chiave rilevanti
- Mix di generiche e specifiche
- Lowercase, separate da virgola

### Immagini
- Usa `alt` text descrittivi
- Ottimizza dimensioni (< 200KB)
- Format WebP quando possibile

## 🔍 Monitoraggio

Controlla regolarmente:
- Posizionamento su Google Search Console
- Click-through rate (CTR)
- Errori di indicizzazione
- Broken links
- Performance mobile

## ❓ FAQ

**Q: Quando verrò indicizzato su Google?**
A: Può richiedere da pochi giorni a qualche settimana dopo il submit della sitemap.

**Q: Devo aggiornare la sitemap ogni volta che aggiungo un progetto?**
A: Sì, esegui `npm run build:sitemap` e rideploya. È automatico durante il build.

**Q: Come testo i meta tags in locale?**
A: Usa il browser inspector (F12) → Elements → `<head>`, oppure installa un'estensione come "Meta SEO Inspector".

**Q: Il contenuto 18+ influenza la SEO?**
A: Sì, alcuni motori potrebbero applicare filtri. I meta tags `rating="adult"` aiutano a categorizzare correttamente.

## 📚 Risorse Utili

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
