import { useAtom } from 'jotai';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  commandPaletteSearchAtom,
  commandPaletteResultsAtom,
  CommandPaletteResult,
} from './command.atoms';
import { useGetSongs } from '@renderer/hooks/useSongs';
import { Song } from '@ipc/song/song.types';
import { BibleReferenceType , BibleTextType } from '@ipc/verse/verse.types';
import bibleText from '@assets/bibles/VDC.json';

// Minimum number of characters required before showing song search results
export const MIN_SONG_SEARCH_LENGTH = 7;

// Maximum number of search results to display
export const MAX_SEARCH_RESULTS = 10;

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
  
  // Calculate stable songs key based on IDs (only changes when songs actually change)
  const songsKey = useMemo(() => songs.map(s => s.id).join(','), [songs]);
  
  // Update ref when songs change
  useEffect(() => {
    songsRef.current = songs;
  }, [songsKey, songs]);

  const books = useMemo(() => {
    return Object.keys(bibleText);
  }, []);

  const searchVerses = useCallback(
    (query: string): BibleReferenceType[] => {
      const results: BibleReferenceType[] = [];
      
      if (query.trim().length === 0) return results;
      
      try {
        // Try to parse as verse reference (e.g., "John 3 16" or "John 3:16")
        const normalizedQuery = query.replace(/:/g, ' ');
        let chunks = normalizedQuery.trim().split(/\s+/);
        
        // Handle numbered books (e.g., "1 corinteni" -> "1corinteni")
        // Check if first chunk is a number and second chunk is text
        if (chunks.length >= 3 && /^\d+$/.test(chunks[0]) && /^[a-zA-Z]/.test(chunks[1])) {
          // Combine number and book name (remove space)
          chunks = [chunks[0] + chunks[1], ...chunks.slice(2)];
        } else if (chunks.length === 4) {
          // Handle 4-word book names (e.g., "1 Corinthians")
          chunks = [chunks[0] + chunks[1], chunks[2], chunks[3]];
        }
        
        // Try exact match first
        if (chunks.length >= 2) {
          // Normalize book name by removing spaces for comparison
          const bookName = chunks[0].replace(/\s+/g, '').toLowerCase();
          const book = books.find((b) => 
            b.toLowerCase().startsWith(bookName)
          );
          
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
          // Normalize book name by removing spaces for comparison
          const bookName = chunks[0].replace(/\s+/g, '').toLowerCase();
          const matchingBooks = books.filter((b) =>
            b.toLowerCase().startsWith(bookName)
          );
          
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
    [books]
  );

  // Available commands
  const availableCommands = useMemo(() => [
    { id: 'create-song' as const, label: 'Create new song', description: 'Add a new song to your library' },
    { id: 'clear-service-list' as const, label: 'Clear service list', description: 'Remove all songs from the service list' },
    { id: 'open-settings' as const, label: 'Open settings', description: 'Open application settings' },
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
    
    // Search verses - only if search contains a number
    if (/\d/.test(search)) {
      const verseResults = searchVerses(search);
      verseResults.forEach((verse) => {
        results.push({ type: 'verse', data: verse });
      });
    }
    
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
  }, [search, songsKey, searchVerses, searchCommands, setResults]);

  return { search, setSearch: setSearchAtom };
};

