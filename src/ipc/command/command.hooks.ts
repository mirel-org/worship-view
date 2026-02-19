import { useAtom } from 'jotai';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  commandPaletteSearchAtom,
  commandPaletteResultsAtom,
  CommandPaletteResult,
} from './command.atoms';
import { makeVerseKey, normalizeForSearch } from './command.search.utils';
import { useGetSongs } from '@renderer/hooks/useSongs';
import { Song } from '@ipc/song/song.types';
import { BibleReferenceType, BibleTextType } from '@ipc/verse/verse.types';
import bibleText from '@assets/bibles/VDC.json';

// Minimum number of characters required before showing song search results
export const MIN_SONG_SEARCH_LENGTH = 7;
export const MIN_VERSE_TEXT_SEARCH_LENGTH = 7;

// Maximum number of search results to display
export const MAX_SEARCH_RESULTS = 10;

type VerseSearchIndexEntry = {
  reference: BibleReferenceType;
  normalizedReferenceText: string;
  normalizedVerseText: string;
  normalizedCombinedText: string;
};

export const useCommandPaletteSearch = (searchValue?: string) => {
  const [searchAtom, setSearchAtom] = useAtom(commandPaletteSearchAtom);
  const [, setResultsAtom] = useAtom(commandPaletteResultsAtom);
  const { data: songs = [] } = useGetSongs();
  
  // Stabilize setResults to prevent infinite loops
  const setResultsRef = useRef(setResultsAtom);
  useEffect(() => {
    setResultsRef.current = setResultsAtom;
  }, [setResultsAtom]);
  const setResults = useCallback((results: CommandPaletteResult[] | ((prev: CommandPaletteResult[]) => CommandPaletteResult[])) => {
    setResultsRef.current(results);
  }, []);

  // Use provided searchValue or fall back to atom
  const search = searchValue ?? searchAtom;

  // Use refs to track songs for use in effects without causing re-renders
  const songsRef = useRef<Song[]>(songs);
  
  // Include searchable song fields so edits refresh results even when IDs stay the same.
  const songsKey = useMemo(
    () => songs.map((s) => `${s.id}:${s.name}:${s.fullText}`).join('|'),
    [songs],
  );
  
  // Update ref when songs change
  useEffect(() => {
    songsRef.current = songs;
  }, [songsKey, songs]);

  const books = useMemo(() => {
    return Object.keys(bibleText);
  }, []);

  const normalizedBookLookup = useMemo(
    () =>
      books.map((book) => ({
        book,
        normalizedBook: normalizeForSearch(book).replace(/\s+/g, ''),
      })),
    [books],
  );

  const verseSearchIndex = useMemo<VerseSearchIndexEntry[]>(() => {
    const index: VerseSearchIndexEntry[] = [];
    const bible = bibleText as BibleTextType;

    for (const book of books) {
      const chapters = bible[book] ?? [];
      chapters.forEach((chapter, chapterIndex) => {
        chapter.forEach((verseText, verseIndex) => {
          const reference: BibleReferenceType = {
            book,
            chapter: chapterIndex + 1,
            verse: verseIndex + 1,
          };
          const normalizedReferenceText = normalizeForSearch(
            `${book} ${reference.chapter} ${reference.verse}`,
          );
          const normalizedVerseText = normalizeForSearch(verseText);

          index.push({
            reference,
            normalizedReferenceText,
            normalizedVerseText,
            normalizedCombinedText: `${normalizedReferenceText} ${normalizedVerseText}`.trim(),
          });
        });
      });
    }

    return index;
  }, [books]);

  const searchVerses = useCallback(
    (query: string): BibleReferenceType[] => {
      const results: BibleReferenceType[] = [];

      if (query.trim().length === 0) return results;

      try {
        // Try to parse as verse reference (e.g., "Ioan 3 16" or "Ioan 3:16")
        const normalizedQuery = normalizeForSearch(query.replace(/:/g, ' '));
        let chunks = normalizedQuery.trim().split(/\s+/).filter(Boolean);

        // Handle numbered books (e.g., "1 corinteni" -> "1corinteni")
        if (
          chunks.length >= 3 &&
          /^\d+$/.test(chunks[0]) &&
          /^[a-zA-Z]/.test(chunks[1])
        ) {
          // Combine number and book name (remove space)
          chunks = [chunks[0] + chunks[1], ...chunks.slice(2)];
        } else if (chunks.length === 4) {
          // Keep compatibility with existing 4-token fallback behavior
          chunks = [chunks[0] + chunks[1], chunks[2], chunks[3]];
        }

        // Try exact match first
        if (chunks.length >= 2) {
          const bookName = chunks[0].replace(/\s+/g, '');
          const book = normalizedBookLookup.find((candidate) =>
            candidate.normalizedBook.startsWith(bookName),
          )?.book;

          if (book) {
            const chapterNum = parseInt(chunks[1], 10);
            if (!isNaN(chapterNum) && chapterNum > 0) {
              const chapter = (bibleText as BibleTextType)[book]?.[chapterNum - 1];

              if (chapter) {
                // If verse number is provided
                if (chunks.length >= 3) {
                  const verseNum = parseInt(chunks[2], 10);
                  if (!isNaN(verseNum) && verseNum > 0 && chapter[verseNum - 1]) {
                    results.push({
                      book,
                      chapter: chapterNum,
                      verse: verseNum,
                    });
                  }
                } else {
                  // Return first verse of chapter as preview
                  if (chapter.length > 0) {
                    results.push({
                      book,
                      chapter: chapterNum,
                      verse: 1,
                    });
                  }
                }
              }
            }
          }
        }

        // Also search for partial book name matches
        if (chunks.length >= 1 && results.length === 0) {
          const bookName = chunks[0].replace(/\s+/g, '');
          const matchingBooks = normalizedBookLookup
            .filter((candidate) => candidate.normalizedBook.startsWith(bookName))
            .map((candidate) => candidate.book);

          // Return first chapter, first verse of matching books
          for (const book of matchingBooks.slice(0, 5)) {
            const chapters = (bibleText as BibleTextType)[book];
            if (chapters && chapters.length > 0 && chapters[0].length > 0) {
              results.push({
                book,
                chapter: 1,
                verse: 1,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error searching verses:', error);
      }

      return results;
    },
    [normalizedBookLookup],
  );

  const searchVersesByText = useCallback(
    (query: string): BibleReferenceType[] => {
      const normalizedQuery = normalizeForSearch(query);
      if (normalizedQuery.length < MIN_VERSE_TEXT_SEARCH_LENGTH) return [];

      return verseSearchIndex
        .filter(
          (entry) =>
            entry.normalizedVerseText.includes(normalizedQuery) ||
            entry.normalizedCombinedText.includes(normalizedQuery),
        )
        .map((entry) => entry.reference);
    },
    [verseSearchIndex],
  );

  // Available commands
  const availableCommands = useMemo(() => [
    { id: 'create-song' as const, label: 'Creează cântec nou', description: 'Adaugă un cântec nou în bibliotecă' },
    { id: 'clear-service-list' as const, label: 'Golește lista de melodii', description: 'Șterge toate cântecele din lista de melodii' },
    { id: 'open-settings' as const, label: 'Deschide setările', description: 'Deschide setările aplicației' },
  ], []);

  // Search commands
  const searchCommands = useCallback(
    (query: string) => {
      if (query.trim().length === 0) {
        // Show all commands when search is empty
        return availableCommands;
      }
      
      const queryLower = query.toLowerCase();
      return availableCommands.filter((cmd) =>
        cmd.label.toLowerCase().includes(queryLower) ||
        cmd.description?.toLowerCase().includes(queryLower) ||
        cmd.id.toLowerCase().includes(queryLower)
      );
    },
    [availableCommands]
  );

  // Perform search whenever search term or songs change
  useEffect(() => {
    const results: CommandPaletteResult[] = [];
    
    // Search commands (always show if search matches or search is empty)
    const commandResults = searchCommands(search);
    commandResults.forEach((cmd) => {
      results.push({ type: 'command', data: cmd });
    });
    
    // Search songs - inline to avoid dependency issues
    // Use songsRef.current to get the latest songs without causing re-renders
    if (search.trim().length >= MIN_SONG_SEARCH_LENGTH) {
      const queryLower = search.toLocaleLowerCase();
      const currentSongs = songsRef.current;
      
      // Filter out any invalid songs and ensure they have required properties
      const validSongs = currentSongs.filter((song: Song) => 
        song && song.name && song.id && song.fullText
      );
      
      // First try exact name match (works with any length)
      const nameMatches = validSongs.filter((song: Song) =>
        song.name.toLocaleLowerCase().includes(queryLower)
      );
      
      // Process query for fullText search (tokenize like fullText is stored)
      const searchTerms = (
        queryLower.match(/(\w+-\w+)|\w+/g) ?? []
      ).join(' ');
      
      // Search for content matches (exclude songs already found by name)
      const nameMatchIds = new Set(nameMatches.map(song => song.id));
      const contentMatches = validSongs.filter((song: Song) =>
        !nameMatchIds.has(song.id) && song.fullText.includes(searchTerms)
      );
      
      // Return name matches first, then content matches
      const songResults = [...nameMatches, ...contentMatches];
      songResults.forEach((song) => {
        results.push({ type: 'song', data: song });
      });
    }
    
    const referenceVerseResults = /\d/.test(search) ? searchVerses(search) : [];
    const textVerseResults = searchVersesByText(search);
    const mergedVerseResults: BibleReferenceType[] = [];
    const seenVerseKeys = new Set<string>();

    for (const verse of referenceVerseResults) {
      const key = makeVerseKey(verse);
      if (seenVerseKeys.has(key)) continue;
      seenVerseKeys.add(key);
      mergedVerseResults.push(verse);
    }

    for (const verse of textVerseResults) {
      const key = makeVerseKey(verse);
      if (seenVerseKeys.has(key)) continue;
      seenVerseKeys.add(key);
      mergedVerseResults.push(verse);
    }

    mergedVerseResults.forEach((verse) => {
      results.push({ type: 'verse', data: verse });
    });
    
    // Limit results to MAX_SEARCH_RESULTS
    const limitedResults = results.slice(0, MAX_SEARCH_RESULTS);
    
    // Only update if results actually changed to prevent infinite loops
    setResults((prevResults) => {
      // Compare results by stringifying (simple comparison)
      const prevKey = JSON.stringify(prevResults);
      const newKey = JSON.stringify(limitedResults);
      if (prevKey === newKey) {
        return prevResults; // Return same reference if unchanged
      }
      return limitedResults;
    });
  }, [
    search,
    songsKey,
    searchVerses,
    searchVersesByText,
    searchCommands,
    setResults,
  ]);

  return { search, setSearch: setSearchAtom };
};
