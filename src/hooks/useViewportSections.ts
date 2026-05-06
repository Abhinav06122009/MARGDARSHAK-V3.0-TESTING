import { useEffect, useState, type RefObject } from 'react';

export interface ObservedSection {
  id: string;
  ref: RefObject<HTMLElement>;
}

interface UseViewportSectionsOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

export const useViewportSections = (
  sections: ObservedSection[],
  options: UseViewportSectionsOptions = {}
) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { rootMargin = '-18% 0px -58% 0px', threshold = [0.15, 0.35, 0.6] } = options;

  useEffect(() => {
    if (!sections.length || typeof window === 'undefined') return;

    const visibleSections = new Map<string, number>();

    const observer = new IntersectionObserver((entries) => {
      let bestSection: string | null = null;
      let bestRatio = 0;

      entries.forEach((entry) => {
        const sectionId = (entry.target as HTMLElement).dataset.sectionId ?? (entry.target as HTMLElement).id;
        if (!sectionId) return;

        if (entry.isIntersecting) {
          visibleSections.set(sectionId, entry.intersectionRatio);
        } else {
          visibleSections.delete(sectionId);
        }
      });

      visibleSections.forEach((ratio, sectionId) => {
        if (ratio >= bestRatio) {
          bestRatio = ratio;
          bestSection = sectionId;
        }
      });

      if (bestSection) {
        setActiveSection((current) => (current === bestSection ? current : bestSection));
      }
    }, { root: null, rootMargin, threshold });

    sections.forEach(({ id, ref }) => {
      if (!ref.current) return;
      ref.current.dataset.sectionId = id;
      observer.observe(ref.current);
    });

    const firstSection = sections.find(({ ref }) => ref.current)?.id ?? null;
    if (!activeSection && firstSection) {
      setActiveSection(firstSection);
    }

    return () => observer.disconnect();
  }, [activeSection, rootMargin, sections, threshold]);

  return activeSection;
};