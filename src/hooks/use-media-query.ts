'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Update the state with the current match
    const updateMatches = () => {
      setMatches(media.matches);
    };

    // Set initial value
    updateMatches();

    // Add listener for changes
    media.addEventListener('change', updateMatches);

    // Clean up
    return () => {
      media.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}
