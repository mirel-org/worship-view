import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input } from '@worship-view/ui';
import { Music, ListPlus, Pencil, Trash2, Search } from 'lucide-react';
import { useGetSongs, useDeleteSong, useAddToServiceList } from '../../hooks/useSongs';
import { settingsSongSlideSizeAtom } from '../../state/settings.song.atoms';
import { selectedTabTypeAtom } from '../../state/tab.atoms';
import { selectedSongAtom } from '../../state/song.atoms';
import { areSettingsOpenAtom } from '../../state/settings.atoms';
import { getSongSlidesBySize } from '../../utils/song.utils';
import SongEditorDialog from '../panels/songs-list-panel/SongEditorDialog';
import SongDeleteDialog from '../panels/songs-list-panel/SongDeleteDialog';
import type { Song } from '../../types/song.types';

const ROW_HEIGHT = 36;

function sortSongs(songs: Song[]): Song[] {
  return [...songs]
    .filter((s) => s && s.name && s.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' }));
}

export function SettingsSongs() {
  const { data: rawSongs = [], isLoading } = useGetSongs();
  const [songSlideSize] = useAtom(settingsSongSlideSizeAtom);
  const [, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setSelectedSong] = useAtom(selectedSongAtom);
  const [, setSettingsOpen] = useAtom(areSettingsOpenAtom);
  const deleteSongMutation = useDeleteSong();
  const addToServiceListMutation = useAddToServiceList();

  const [searchValue, setSearchValue] = useState('');
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Stable snapshot: only grows, never reorders existing items.
  // New songs arriving from Jazz are appended at the end in sorted order.
  const [stableSongs, setStableSongs] = useState<Song[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (rawSongs.length === 0) return;

    setStableSongs((prev) => {
      if (prev.length === 0) {
        // First load — full sort
        const sorted = sortSongs(rawSongs);
        knownIdsRef.current = new Set(sorted.map((s) => s.id));
        return sorted;
      }

      // Find genuinely new songs
      const newSongs = rawSongs.filter(
        (s) => s && s.id && !knownIdsRef.current.has(s.id),
      );
      if (newSongs.length === 0) return prev;

      // Append new songs (sorted among themselves) at the end
      const sortedNew = sortSongs(newSongs);
      for (const s of sortedNew) knownIdsRef.current.add(s.id);
      return [...prev, ...sortedNew];
    });
  }, [rawSongs]);

  const listRef = useRef<HTMLDivElement>(null);

  const filteredSongs = useMemo(() => {
    if (!searchValue.trim()) return stableSongs;
    const query = searchValue.toLocaleLowerCase();
    return stableSongs.filter((song) =>
      song.name.toLocaleLowerCase().includes(query),
    );
  }, [stableSongs, searchValue]);

  const virtualizer = useVirtualizer({
    count: filteredSongs.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const hoveredSong = useMemo(() => {
    if (!hoveredSongId) return null;
    return stableSongs.find((s) => s.id === hoveredSongId) ?? null;
  }, [stableSongs, hoveredSongId]);

  const songPreview = useMemo(() => {
    if (!hoveredSong?.arrangement?.length || !hoveredSong?.parts?.length) return null;
    return hoveredSong.arrangement.map((key) => {
      const partSlides = hoveredSong.parts.find((p) => p.key === key)?.slides;
      if (!partSlides) return { key, slides: [] };
      return {
        key,
        slides: getSongSlidesBySize(partSlides, songSlideSize),
      };
    });
  }, [hoveredSong, songSlideSize]);

  const handleSongClick = useCallback(
    (song: Song) => {
      setSelectedTabType('songs');
      setSelectedSong(song);
      setSettingsOpen(false);
    },
    [setSelectedTabType, setSelectedSong, setSettingsOpen],
  );

  const handleAddToServiceList = useCallback(
    async (e: { stopPropagation: () => void }, song: Song) => {
      e.stopPropagation();
      try {
        await addToServiceListMutation.mutateAsync(song.id);
      } catch (error: any) {
        if (error.message?.includes('already')) {
          alert(error.message);
        } else {
          console.error('Failed to add song to service list:', error);
        }
      }
    },
    [addToServiceListMutation],
  );

  const handleEditClick = useCallback(
    (e: { stopPropagation: () => void }, song: Song) => {
      e.stopPropagation();
      setEditingSong(song);
      setEditDialogOpen(true);
    },
    [],
  );

  const handleDeleteClick = useCallback(
    (e: { stopPropagation: () => void }, song: Song) => {
      e.stopPropagation();
      setDeletingSong(song);
      setDeleteDialogOpen(true);
    },
    [],
  );

  const handleDelete = useCallback(async () => {
    if (!deletingSong) return;
    try {
      await deleteSongMutation.mutateAsync(deletingSong.id);
      // Remove deleted song from stable list
      setStableSongs((prev) => prev.filter((s) => s.id !== deletingSong.id));
      knownIdsRef.current.delete(deletingSong.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete song:', error);
    }
  }, [deletingSong, deleteSongMutation]);

  const handleSave = useCallback(async () => {
    // Song will be automatically updated via reactive store
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Se încarcă cântecele...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Caută cântece..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-1 min-h-0 gap-3">
        {/* Virtualized song list */}
        <div
          ref={listRef}
          className="flex-1 min-w-0 overflow-y-auto border rounded-lg"
        >
          {filteredSongs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                {stableSongs.length === 0
                  ? 'Nu există cântece în bibliotecă.'
                  : 'Niciun cântec găsit.'}
              </p>
            </div>
          ) : (
            <div
              className="relative w-full"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const song = filteredSongs[virtualRow.index];
                return (
                  <div
                    key={song.id}
                    className="group absolute left-0 w-full flex items-center justify-between px-3 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border"
                    style={{
                      height: ROW_HEIGHT,
                      top: virtualRow.start,
                    }}
                    onClick={() => handleSongClick(song)}
                    onMouseEnter={() => setHoveredSongId(song.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{song.name}</span>
                    </div>
                    <div
                      className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleAddToServiceList(e, song)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent"
                        aria-label={`Adaugă ${song.name} la lista de melodii`}
                        disabled={addToServiceListMutation.isLoading}
                      >
                        <ListPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleEditClick(e, song)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded-sm hover:bg-accent"
                        aria-label={`Editează ${song.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, song)}
                        className="p-1 text-destructive hover:text-destructive rounded-sm hover:bg-destructive/10"
                        aria-label={`Șterge ${song.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="hidden md:flex w-[40%] shrink-0 flex-col border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/30">
            <h3 className="text-xs font-semibold text-muted-foreground">
              Previzualizare
            </h3>
          </div>
          <div className="relative flex-1 overflow-y-auto p-3">
            {hoveredSong && songPreview ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {hoveredSong.name}
                </h4>
                {songPreview.map((part, partIndex) => (
                  <div key={partIndex} className="space-y-1.5">
                    <span className="inline-flex h-4 items-center rounded-sm border border-border bg-secondary px-1.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-secondary-foreground">
                      {part.key.replace(/[-_]/g, ' ').toUpperCase()}
                    </span>
                    {part.slides.map((slide, slideIndex) => (
                      <div
                        key={slideIndex}
                        className="min-h-[48px] w-full rounded-md border border-border bg-card px-2 py-1 text-center shadow-sm flex flex-col justify-center gap-0.5"
                      >
                        {slide.lines.map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className="font-montserrat text-[14px] font-bold italic uppercase text-foreground"
                            style={{
                              textShadow: '0.06em 0.06em 1px #00000094',
                            }}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">
                  Treceți cursorul peste un cântec pentru previzualizare
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Song count */}
      <div className="mt-2 text-xs text-muted-foreground">
        {filteredSongs.length === stableSongs.length
          ? `${stableSongs.length} cântece`
          : `${filteredSongs.length} din ${stableSongs.length} cântece`}
      </div>

      {editDialogOpen && (
        <SongEditorDialog
          song={editingSong}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSave}
        />
      )}
      {deleteDialogOpen && (
        <SongDeleteDialog
          song={deletingSong}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
