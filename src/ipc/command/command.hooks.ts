import { useAtom } from 'jotai';
import { useMemo, useCallback, useEffect } from 'react';
import {
  commandPaletteSearchAtom,
  commandPaletteResultsAtom,
  CommandPaletteResult,
} from './command.atoms';
import { useGetSongs } from '@renderer/hooks/useSongs';
import { Song } from '@ipc/song/song.types';
import { BibleReferenceType , BibleTextType } from '@ipc/verse/verse.types';
import bibleText from '@assets/bibles/VDC.json';

export const useCommandPaletteSearch = (searchValue?: string) => {
  const [searchAtom, setSearchAtom] = useAtom(commandPaletteSearchAtom);
  const [, setResults] = useAtom(commandPaletteResultsAtom);
  const { data: songs = [] } = useGetSongs();

  // Use provided searchValue or fall back to atom
  const search = searchValue ?? searchAtom;

  const books = useMemo(() => {
    return Object.keys(bibleText);
  }, []);

  const searchSongs = useCallback(
    (query: string): Song[] => {
      // Allow searching with any length, but require at least 1 character
      if (query.trim().length === 0) return [];
      
      const queryLower = query.toLocaleLowerCase();
      
      // First try exact name match (works with any length)
      const nameMatches = songs.filter((song: Song) =>
        song.name.toLocaleLowerCase().includes(queryLower)
      );
      
      if (nameMatches.length > 0) {
        return nameMatches;
      }
      
      // If no name matches and query is long enough, search in fullText
      if (query.length > 6) {
        const searchTerms = (
          queryLower.match(/(\w+-\w+)|\w+/g) ?? []
        ).join(' ');
        
        return songs.filter((song: Song) =>
          song.fullText.includes(searchTerms)
        );
      }
      
      return [];
    },
    [songs]
  );

  const searchVerses = useCallback(
    (query: string): BibleReferenceType[] => {
      const results: BibleReferenceType[] = [];
      
      if (query.trim().length === 0) return results;
      
      try {
        // Try to parse as verse reference (e.g., "John 3 16" or "John 3:16")
        const normalizedQuery = query.replace(/:/g, ' ');
        let chunks = normalizedQuery.trim().split(/\s+/);
        
        // Handle 4-word book names (e.g., "1 Corinthians")
        if (chunks.length === 4) {
          chunks = [chunks[0] + ' ' + chunks[1], chunks[2], chunks[3]];
        }
        
        // Try exact match first
        if (chunks.length >= 2) {
          const bookName = chunks[0];
          const book = books.find((b) => 
            b.toLowerCase().startsWith(bookName.toLowerCase())
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
          const bookName = chunks[0].toLowerCase();
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

  // Perform search whenever search term changes
  useEffect(() => {
    const results: CommandPaletteResult[] = [];
    
    // Search commands (always show if search matches or search is empty)
    const commandResults = searchCommands(search);
    commandResults.forEach((cmd) => {
      results.push({ type: 'command', data: cmd });
    });
    
    // Search songs
    const songResults = searchSongs(search);
    songResults.forEach((song) => {
      results.push({ type: 'song', data: song });
    });
    
    // Search verses
    const verseResults = searchVerses(search);
    verseResults.forEach((verse) => {
      results.push({ type: 'verse', data: verse });
    });
    
    setResults(results);
  }, [search, searchSongs, searchVerses, searchCommands, setResults]);

  return { search, setSearch: setSearchAtom };
};

