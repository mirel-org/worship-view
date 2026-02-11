import { useState, useEffect, useRef } from 'react';
import {
  validateSongContent,
  type ValidationResult,
} from '@renderer/lib/songParser';

export function useSongValidation(
  content: string,
  debounceMs = 500,
): ValidationResult | null {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!content.trim()) {
      setResult(null);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setResult(validateSongContent(content));
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [content, debounceMs]);

  return result;
}
