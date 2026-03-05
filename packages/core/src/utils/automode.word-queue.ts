import { normalizeForAutoMode } from './automode.slide-matcher';

export interface QueuedWord {
  normalized: string;
  raw: string;
}

/**
 * Simple word queue for word-by-word speech processing.
 * Finalized words are normalized, filtered (skip <= 2 chars), and queued.
 * Words are consumed one at a time by the matcher.
 */
export class WordQueue {
  private queue: QueuedWord[] = [];
  private displayParts: string[] = [];
  private recentWords: Map<string, number> = new Map();
  private enqueueCount = 0;

  private static readonly DEDUP_WINDOW_MS = 10_000;
  private static readonly PRUNE_INTERVAL = 50;

  /** Check if a normalized word was already enqueued within the dedup window. If not, record it. */
  private isDuplicate(normalized: string): boolean {
    const now = Date.now();
    const lastSeen = this.recentWords.get(normalized);
    if (lastSeen !== undefined && now - lastSeen < WordQueue.DEDUP_WINDOW_MS) {
      return true;
    }
    this.recentWords.set(normalized, now);
    return false;
  }

  /** Lazily prune expired entries from the recent-words map */
  private maybeRunPrune(): void {
    this.enqueueCount++;
    if (this.enqueueCount >= WordQueue.PRUNE_INTERVAL) {
      this.enqueueCount = 0;
      const now = Date.now();
      for (const [word, timestamp] of this.recentWords) {
        if (now - timestamp >= WordQueue.DEDUP_WINDOW_MS) {
          this.recentWords.delete(word);
        }
      }
    }
  }

  /** Add finalized text — split into words, normalize, filter, dedup, enqueue */
  addFinal(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.displayParts.push(trimmed);
    this.maybeRunPrune();

    const rawWords = trimmed.split(/\s+/).filter(Boolean);
    for (const raw of rawWords) {
      const normalized = normalizeForAutoMode(raw);
      if (normalized.length <= 2) continue; // skip insignificant
      if (this.isDuplicate(normalized)) continue;
      this.queue.push({ normalized, raw });
    }
  }

  /** Add individual raw words — normalize, filter, dedup, enqueue (no display update) */
  addRawWords(words: string[]): void {
    this.maybeRunPrune();
    for (const raw of words) {
      const normalized = normalizeForAutoMode(raw);
      if (normalized.length <= 2) continue;
      if (this.isDuplicate(normalized)) continue;
      this.queue.push({ normalized, raw });
    }
  }

  /** Pop next word from queue (returns null if empty) */
  dequeue(): QueuedWord | null {
    return this.queue.shift() ?? null;
  }

  /** Record finalized segment text for display only (no queueing) */
  addDisplayText(text: string): void {
    const trimmed = text.trim();
    if (trimmed) this.displayParts.push(trimmed);
  }

  /** All raw text for transcription display */
  getRawText(): string {
    return this.displayParts.join(' ');
  }

  clear(): void {
    this.queue = [];
    this.displayParts = [];
    this.recentWords.clear();
    this.enqueueCount = 0;
  }
}
