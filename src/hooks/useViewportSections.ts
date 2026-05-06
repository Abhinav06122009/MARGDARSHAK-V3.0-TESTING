import { RefObject, useEffect, useState } from 'react';

export interface ObservedSection {
  id: string;
  ref: RefObject<HTMLElement>;
}

export const useViewportSections = (sections: ObservedSection[]) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target) {
          const matchingSection = sections.find(section => section.ref.current === visible.target);
          if (matchingSection) {
            setActiveSection(matchingSection.id);
          }
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.15, 0.3, 0.5, 0.75],
      },
    );

    sections.forEach(section => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  return activeSection;
};
