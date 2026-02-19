import React, { FC, useEffect, useRef, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { formatBibleReference } from '@ipc/verse/verse.utils';
import {
  Music,
  BookOpen,
  ListPlus,
  Pencil,
  Trash2,
  Plus,
  Settings,
  X,
  Search,
} from 'lucide-react';
import { useCommandPaletteSearch, MIN_SONG_SEARCH_LENGTH } from '@ipc/command/command.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { selectedSongAtom } from '@ipc/song/song.atoms';
import { selectedVerseReferenceAtom, versesHistoryAtom } from '@ipc/verse/verse.atoms';
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
  const [, setVersesHistory] = useAtom(versesHistoryAtom);
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
  const baseItemClass =
    'group rounded-md !px-2 !py-2 text-sm text-foreground data-[selected=true]:!bg-accent hover:!bg-accent/70';
  
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
      reference: formatBibleReference(verseRef),
      verse: verseRef.verse,
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
      const verseReference = result.data as BibleReferenceType;
      setSelectedTabType('bible');
      setSelectedVerseReference(verseReference);
      setVersesHistory((history) => {
        const exists = history.some(
          (item) =>
            item.book === verseReference.book &&
            item.chapter === verseReference.chapter &&
            item.verse === verseReference.verse,
        );
        if (exists) return history;
        return [...history, verseReference];
      });
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
        if (window.confirm('Sigur doriți să goliți întreaga listă de melodii?')) {
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
      <DialogContent className="h-[560px] max-h-[560px] w-[896px] max-w-[896px] flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-background p-0 text-foreground shadow-[0_16px_24px_-4px_rgba(0,0,0,0.25),0_8px_12px_-4px_rgba(0,0,0,0.12)] [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Paleta de comenzi</DialogTitle>
          <DialogDescription>
            Căutați cântece, versete și comenzi. Folosiți tastele săgeți pentru
            navigare, Enter pentru selectare.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 flex flex-col border-r border-border overflow-hidden">
            <Command 
              ref={commandRef}
              className="h-full bg-transparent text-foreground"
              shouldFilter={false}
              value={selectedValue}
              onValueChange={(value) => {
                setSelectedValue(value);
              }}
              filter={() => 1}
            >
              <div className="h-12 border-b border-border px-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <CommandInput
                  placeholder="Caută cântece, versete sau comenzi..."
                  className="h-full border-0 bg-transparent p-0 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
                  value={searchValue}
                  onValueChange={setSearchValue}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && selectedValue) {
                      e.preventDefault();
                      handleSelect(selectedValue);
                    }
                  }}
                />
              </div>
              <CommandList className="flex-1 overflow-y-auto px-1 py-1">
                <CommandEmpty>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchValue.length === 0
                      ? 'Începeți să tastați pentru a căuta cântece, versete sau comenzi...'
                      : searchValue.length < MIN_SONG_SEARCH_LENGTH
                      ? `Tastați cel puțin ${MIN_SONG_SEARCH_LENGTH} caractere pentru a căuta cântece...`
                      : 'Niciun rezultat găsit.'}
                  </div>
                </CommandEmpty>
                {commandResults.length > 0 && (
                  <div className="px-1 pb-1">
                    <div className="px-1 pb-1 text-xs font-medium text-muted-foreground">
                      Comenzi
                    </div>
                    <CommandGroup className="p-0">
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
                            className={`${baseItemClass} items-start`}
                          >
                            {command.id === 'create-song' && <Plus className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />}
                            {command.id === 'clear-service-list' && <X className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />}
                            {command.id === 'open-settings' && <Settings className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />}
                            <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                              <span className="text-sm text-foreground truncate">
                                {command.label}
                              </span>
                              {command.description && (
                                <span className="text-xs text-muted-foreground leading-4 truncate">
                                  {command.description}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </div>
                )}
                {songResults.length > 0 && (
                  <>
                    <div className="h-px bg-border mx-1 my-1" />
                    <div className="px-1 pb-1">
                      <div className="px-1 pb-1 text-xs font-medium text-muted-foreground">
                        Cântece
                      </div>
                      <CommandGroup className="p-0">
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
                              className={`${baseItemClass} items-center`}
                            >
                              <div className="flex items-center justify-between w-full min-w-0">
                                <div className="flex items-center flex-1 min-w-0 gap-2">
                                  <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="truncate text-sm text-foreground">
                                    {song.name}
                                  </span>
                                </div>
                                <div
                                  className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => handleAddToServiceList(e, song)}
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label={`Adaugă ${song.name} la lista de melodii`}
                                    disabled={addToServiceListMutation.isLoading}
                                  >
                                    <ListPlus className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleEditClick(e, song)}
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label={`Editează ${song.name}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteClick(e, song)}
                                    className="text-destructive hover:text-destructive"
                                    aria-label={`Șterge ${song.name}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </div>
                  </>
                )}
                {verseResults.length > 0 && (
                  <>
                    <div className="h-px bg-border mx-1 my-1" />
                    <div className="px-1 pb-1">
                      <div className="px-1 pb-1 text-xs font-medium text-muted-foreground">
                        Versete Biblice
                      </div>
                      <CommandGroup className="p-0">
                        {verseResults.map((result) => {
                          const verse = result.data as BibleReferenceType;
                          const value = `verse-${verse.book}-${verse.chapter}-${verse.verse}`;
                          const reference = formatBibleReference(verse);
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
                              className={`${baseItemClass} items-center`}
                            >
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{reference}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </div>
                  </>
                )}
              </CommandList>
            </Command>
          </div>

          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="h-12 px-4 border-b border-border flex items-center">
              <h3 className="text-sm font-semibold text-foreground">Previzualizare</h3>
            </div>
            <div className="relative flex-1 overflow-y-auto dot-grid-bg p-4">
              <div className="pointer-events-none absolute inset-x-[10px] inset-y-3 dot-grid-overlay" />
              <div className="relative">
                {selectedResult?.type === 'song' && songPreview ? (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-foreground">
                      {(selectedResult.data as Song).name}
                    </h4>
                    {songPreview.map((part, partIndex) => (
                      <div key={partIndex} className="space-y-2">
                        <span className="inline-flex h-4 items-center rounded-sm border border-border bg-secondary px-1.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground">
                          {part.key.replace(/[-_]/g, ' ').toUpperCase()}
                        </span>
                        {part.slides.map((slide, slideIndex) => (
                          <div
                            key={slideIndex}
                            data-testid="command-preview-slide"
                            className="min-h-[68px] w-full rounded-lg border border-border bg-card px-3 py-1.5 text-center shadow-[0_2px_6px_rgba(0,0,0,0.25)] flex flex-col justify-center gap-1"
                          >
                            {slide.lines.map((line, lineIndex) => (
                              <div
                                key={lineIndex}
                                className="font-montserrat text-xs font-bold italic uppercase text-foreground"
                                style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
                              >
                                {line}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : selectedResult?.type === 'verse' && versePreview ? (
                  <div className="space-y-2">
                    <div className="w-full rounded-lg border border-border bg-card px-5 py-3 text-foreground">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-[11px] font-semibold tracking-[0.5px] text-muted-foreground">
                          {versePreview.verse}
                        </p>
                      </div>
                      <p className="font-montserrat text-[15px] font-bold italic leading-[1.6] text-center text-foreground">
                        {versePreview.text}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
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
