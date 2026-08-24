import { useEffect } from 'react';
import aescionSymbol from '../assets/branding/aescion-symbol.png';

/**
 * Custom hook to dynamically apply Super Admin specific branding:
 * - Browser tab title: "AESCION — Admin Portal"
 * - Browser favicon: AESCION official inverted triangle brand mark (aescion-symbol.png)
 * 
 * Restores original document title and favicon upon unmounting to ensure 100% role isolation.
 */
export function useAdminBranding() {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'AESCION — Admin Portal';

    // Query existing favicon links
    const existingLinks = Array.from(
      document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']")
    );
    const originalHrefs = existingLinks.map((link) => link.href);

    if (existingLinks.length === 0) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = aescionSymbol;
      document.head.appendChild(link);
    } else {
      existingLinks.forEach((link) => {
        link.href = aescionSymbol;
      });
    }

    return () => {
      document.title = originalTitle;
      if (existingLinks.length === 0) {
        const addedLink = document.querySelector<HTMLLinkElement>(
          `link[href="${aescionSymbol}"]`
        );
        if (addedLink) addedLink.remove();
      } else {
        existingLinks.forEach((link, idx) => {
          if (originalHrefs[idx]) link.href = originalHrefs[idx];
        });
      }
    };
  }, []);
}
