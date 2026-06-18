import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export default function SEO({ title, description, image, url, canonicalUrl, robots, ogTitle, ogDescription, ogImage }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Love Bydgoszcz`;

    const updateMetaTag = (name: string, content: string, attribute = 'name') => {
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const removeMetaTag = (name: string, attribute = 'name') => {
      const tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (tag) tag.remove();
    };

    const updateLinkTag = (rel: string, href: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!tag) {
        tag = document.createElement('link');
        tag.rel = rel;
        document.head.appendChild(tag);
      }
      tag.href = href;
    };

    const removeLinkTag = (rel: string) => {
      const tag = document.querySelector(`link[rel="${rel}"]`);
      if (tag) tag.remove();
    };

    // Standard description
    const effectiveDescription = description;
    if (effectiveDescription) {
      updateMetaTag('description', effectiveDescription);
    } else {
      removeMetaTag('description');
    }

    // Robots
    if (robots) {
      updateMetaTag('robots', robots);
    } else {
      removeMetaTag('robots');
    }

    // Canonical URL
    if (canonicalUrl) {
      updateLinkTag('canonical', canonicalUrl);
    } else if (url) {
      updateLinkTag('canonical', url);
    } else {
      removeLinkTag('canonical');
    }

    // OG title — fallback to title
    updateMetaTag('og:title', ogTitle || title, 'property');

    // OG description — fallback to description
    const effectiveOgDescription = ogDescription || effectiveDescription;
    if (effectiveOgDescription) {
      updateMetaTag('og:description', effectiveOgDescription, 'property');
    } else {
      removeMetaTag('og:description', 'property');
    }

    // OG image — ogImage takes priority, then image
    const effectiveOgImage = ogImage || image;
    if (effectiveOgImage) {
      updateMetaTag('og:image', effectiveOgImage, 'property');
    } else {
      removeMetaTag('og:image', 'property');
    }

    // OG URL
    if (url) {
      updateMetaTag('og:url', url, 'property');
    }
  }, [title, description, image, url, canonicalUrl, robots, ogTitle, ogDescription, ogImage]);

  return null;
}