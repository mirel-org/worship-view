import { FC, useEffect, useRef, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from 'cmdk';
import {
  commandPaletteOpenAtom,
  commandPaletteResultsAtom,
} from '@ipc/command/command.atoms';
import { Song } from '@ipc/song/song.types';
import { BibleReferenceType, BibleTextType } from '@ipc/verse/verse.types';
import bibleText from '@assets/bibles/VDC.json';
import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { getSongSlidesBySize } from '@ipc/song/song.utils';
import { Music, BookOpen, ListPlus, Pencil, Trash2, Plus, Settings, X } from 'lucide-react';
import { useCommandPaletteSearch } from '@ipc/command/command.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { selectedSongAtom } from '@ipc/song/song.atoms';
import { selectedVerseReferenceAtom } from '@ipc/verse/verse.atoms';
import {
  useDeleteSong,
  useAddToServiceList,
  useClearServiceList,
} from '@renderer/hooks/useSongs';
import { areSettingsOpenAtom } from '@ipc/settings/settings.atoms';
import SongEditorDialog from '../panels/songs-list-panel/SongEditorDialog';
import SongDeleteDialog from '../panels/songs-list-panel/SongDeleteDialog';
import SongAddDialog from '../panels/songs-list-panel/SongAddDialog';
import type { CommandAction } from '@ipc/command/command.atoms';

const CommandPalette: FC = () => {
  const [open, setOpen] = useAtom(commandPaletteOpenAtom);
  const [results] = useAtom(commandPaletteResultsAtom);
  const [songSlideSize] = useAtom(settingsSongSlideSizeAtom);
  const [, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setSelectedSong] = useAtom(selectedSongAtom);
  const [, setSelectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [, setSettingsOpen] = useAtom(areSettingsOpenAtom);
  const deleteSongMutation = useDeleteSong();
  const addToServiceListMutation = useAddToServiceList();
  const clearServiceListMutation = useClearServiceList();
  const commandRef = useRef<HTMLDivElement>(null);
  
  // Trigger search when search term changes
  useCommandPaletteSearch(searchValue);

  // Reset selected value when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedValue('');
      setSearchValue('');
    }
  }, [open]);

  // Get selected result based on selectedValue
  const selectedResult = useMemo(() => {
    if (!selectedValue) return null;
    return results.find((result) => {
      let key: string;
      if (result.type === 'song') {
        key = `song-${(result.data as Song).id}`;
      } else if (result.type === 'verse') {
        const verse = result.data as BibleReferenceType;
        key = `verse-${verse.book}-${verse.chapter}-${verse.verse}`;
      } else {
        key = `command-${(result.data as { id: CommandAction }).id}`;
      }
      return key === selectedValue;
    }) || null;
  }, [selectedValue, results]);

  const songPreview = useMemo(() => {
    if (!selectedResult || selectedResult.type !== 'song') return null;
    
    const song = selectedResult.data as Song;
    const parts = song.arrangement.map((key) => {
      const partSlides = song.parts.find((p) => p.key === key)?.slides;
      if (!partSlides) return { key, slides: [] };
      return {
        key,
        slides: getSongSlidesBySize(partSlides, songSlideSize),
      };
    });

    return parts;
  }, [selectedResult, songSlideSize]);

  const versePreview = useMemo(() => {
    if (!selectedResult || selectedResult.type !== 'verse') return null;
    
    const verseRef = selectedResult.data as BibleReferenceType;
    const verseText = (bibleText as BibleTextType)[verseRef.book]?.[
      verseRef.chapter - 1
    ]?.[verseRef.verse - 1];

    return {
      reference: `${verseRef.book} ${verseRef.chapter}:${verseRef.verse}`,
      text: verseText || '',
    };
  }, [selectedResult]);

  const handleSelect = async (value: string) => {
    const result = results.find((r) => {
      let key: string;
      if (r.type === 'song') {
        key = `song-${(r.data as Song).id}`;
      } else if (r.type === 'verse') {
        const verse = r.data as BibleReferenceType;
        key = `verse-${verse.book}-${verse.chapter}-${verse.verse}`;
      } else {
        key = `command-${(r.data as { id: CommandAction }).id}`;
      }
      return key === value;
    });

    if (!result) return;

    if (result.type === 'song') {
      setSelectedTabType('songs');
      setSelectedSong(result.data);
      setOpen(false);
    } else if (result.type === 'verse') {
      setSelectedTabType('bible');
      setSelectedVerseReference(result.data);
      setOpen(false);
    } else if (result.type === 'command') {
      const command = result.data as { id: CommandAction };
      await handleCommand(command.id);
    }
  };

  const handleCommand = async (commandId: CommandAction) => {
    switch (commandId) {
      case 'create-song':
        setAddDialogOpen(true);
        setOpen(false);
        break;
      case 'clear-service-list':
        if (window.confirm('Are you sure you want to clear the entire service list?')) {
          try {
            await clearServiceListMutation.mutateAsync();
            setOpen(false);
          } catch (error) {
            console.error('Failed to clear service list:', error);
          }
        }
        break;
      case 'open-settings':
        setSettingsOpen(true);
        setOpen(false);
        break;
    }
  };

  const handleEditClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingSong(song);
    setDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    e.preventDefault();
    setDeletingSong(song);
    setDeleteDialogOpen(true);
  };

  const handleAddToServiceList = async (
    e: React.MouseEvent,
    song: Song,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await addToServiceListMutation.mutateAsync(song.id);
    } catch (error: any) {
      // Show error message if song already exists
      if (error.message?.includes('already')) {
        alert(error.message);
      } else {
        console.error('Failed to add song to service list:', error);
      }
    }
  };

  const handleSave = async () => {
    // Song will be automatically added via Automerge subscription
  };

  const handleDelete = async () => {
    if (!deletingSong) return;
    
    try {
      await deleteSongMutation.mutateAsync(deletingSong.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete song:', error);
    }
  };

  const formatVerseReference = (ref: BibleReferenceType): string => {
    return `${ref.book} ${ref.chapter}:${ref.verse}`;
  };

  // Separate results into songs, verses, and commands
  const songResults = useMemo(() => 
    results.filter(r => r.type === 'song'),
    [results]
  );
  const verseResults = useMemo(() => 
    results.filter(r => r.type === 'verse'),
    [results]
  );
  const commandResults = useMemo(() => 
    results.filter(r => r.type === 'command'),
    [results]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Left side: Search and Results */}
          <div className="w-1/2 flex flex-col border-r overflow-hidden">
            <Command 
              ref={commandRef}
              className="h-full"
              shouldFilter={false}
              value={selectedValue}
              onValueChange={(value) => {
                setSelectedValue(value);
              }}
              filter={() => 1}
            >
              <CommandInput 
                placeholder="Search songs, verses, or commands..." 
                className="h-12"
                value={searchValue}
                onValueChange={setSearchValue}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedValue) {
                    e.preventDefault();
                    handleSelect(selectedValue);
                  }
                }}
              />
              <CommandList className="flex-1 overflow-y-auto">
                <CommandEmpty>
                  <div className="p-4 text-center text-muted-foreground">
                    {searchValue.length === 0 
                      ? 'Start typing to search songs, verses, or commands...'
                      : 'No results found. Type at least 7 characters to search songs.'}
                  </div>
                </CommandEmpty>
                {commandResults.length > 0 && (
                  <CommandGroup heading="Commands">
                    {commandResults.map((result) => {
                      const command = result.data as { id: CommandAction; label: string; description?: string };
                      const value = `command-${command.id}`;
                      return (
                        <CommandItem
                          key={value}
                          value={value}
                          keywords={[command.label, command.description || '', command.id]}
                          onSelect={(currentValue) => {
                            if (currentValue === value) {
                              handleSelect(value);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {command.id === 'create-song' && <Plus className="h-4 w-4 text-muted-foreground" />}
                            {command.id === 'clear-service-list' && <X className="h-4 w-4 text-muted-foreground" />}
                            {command.id === 'open-settings' && <Settings className="h-4 w-4 text-muted-foreground" />}
                            <div className="flex flex-col">
                              <span>{command.label}</span>
                              {command.description && (
                                <span className="text-xs text-muted-foreground">{command.description}</span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
                {songResults.length > 0 && (
                  <CommandGroup heading="Songs">
                    {songResults.map((result) => {
                      const song = result.data as Song;
                      const value = `song-${song.id}`;
                      return (
                        <CommandItem
                          key={value}
                          value={value}
                          keywords={[song.name, song.fullText]}
                          onSelect={(currentValue) => {
                            if (currentValue === value) {
                              handleSelect(value);
                            }
                          }}
                          className="group"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center flex-1 min-w-0">
                              <Music className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                              <span className="truncate">{song.name}</span>
                            </div>
                            <div 
                              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleAddToServiceList(e, song)}
                                className="p-1 hover:bg-accent-foreground/10 rounded"
                                aria-label={`Add ${song.name} to service list`}
                                disabled={addToServiceListMutation.isLoading}
                              >
                                <ListPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleEditClick(e, song)}
                                className="p-1 hover:bg-accent-foreground/10 rounded"
                                aria-label={`Edit ${song.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, song)}
                                className="p-1 hover:bg-destructive/10 rounded text-destructive"
                                aria-label={`Delete ${song.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
                {verseResults.length > 0 && (
                  <CommandGroup heading="Bible Verses">
                    {verseResults.map((result) => {
                      const verse = result.data as BibleReferenceType;
                      const value = `verse-${verse.book}-${verse.chapter}-${verse.verse}`;
                      const reference = formatVerseReference(verse);
                      return (
                        <CommandItem
                          key={value}
                          value={value}
                          keywords={[verse.book, reference, `${verse.chapter}`, `${verse.verse}`]}
                          onSelect={(currentValue) => {
                            if (currentValue === value) {
                              handleSelect(value);
                            }
                          }}
                        >
                          <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{reference}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>

          {/* Right side: Preview */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Preview</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedResult ? (
                <div className="text-center text-muted-foreground">
                  Select an item to preview
                </div>
              ) : selectedResult.type === 'song' && songPreview ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      {(selectedResult.data as Song).name}
                    </h4>
                  </div>
                  {songPreview.map((part, partIndex) => (
                    <div key={partIndex} className="space-y-2">
                      <div className="font-semibold text-sm text-muted-foreground uppercase">
                        {part.key}
                      </div>
                      {part.slides.map((slide, slideIndex) => (
                        <div
                          key={slideIndex}
                          className="bg-black text-white p-4 rounded-md text-center"
                        >
                          {slide.lines.map((line, lineIndex) => (
                            <div
                              key={lineIndex}
                              className="font-montserrat text-sm font-bold italic uppercase"
                              style={{ textShadow: '0.1em 0.1em 0 hsl(200 50% 30%)' }}
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : selectedResult.type === 'verse' && versePreview ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      {versePreview.reference}
                    </h4>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <p className="text-base leading-relaxed">{versePreview.text}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
      <SongEditorDialog
        song={editingSong}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
      <SongDeleteDialog
        song={deletingSong}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
      />
      <SongAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSave}
      />
    </Dialog>
  );
};

export default CommandPalette;

