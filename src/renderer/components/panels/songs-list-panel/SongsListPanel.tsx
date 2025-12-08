import {
  selectedSongAtom,
  songInputFocusAtom,
  songInputValueAtom,
} from '@ipc/song/song.atoms';
import { Song } from '@ipc/song/song.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useInputFocus from '@renderer/hooks/useInputFocus';
import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getApiClient } from '@ipc/index';
import SongEditorDialog from './SongEditorDialog';
import SongDeleteDialog from './SongDeleteDialog';

const SongsListPanel = () => {
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [search, setSearch] = useAtom(songInputValueAtom);
  const [focused, setFocused] = useAtom(songInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  // Load songs
  const loadSongs = async (): Promise<Song[]> => {
    const loadedSongs = await getApiClient().getSongs();
    setSongs(loadedSongs);
    return loadedSongs;
  };

  // Initial load
  useEffect(() => {
    loadSongs();
  }, []);

  const handleEditClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setEditingSong(song);
    setDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setDeletingSong(song);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (newName?: string) => {
    const updatedSongs = await loadSongs();
    // If the edited song was selected, update it with the new data
    if (editingSong) {
      // If renamed, find by new name; otherwise find by old name
      const searchName = newName || editingSong.name;
      const updatedSong = updatedSongs.find((s) => s.name === searchName);
      if (updatedSong) {
        setSelectedSong(updatedSong);
      } else if (newName && selectedSong?.name === editingSong.name) {
        // Song was renamed but not found, clear selection
        setSelectedSong(null);
      }
    }
  };

  const handleDelete = async () => {
    // If the deleted song was selected, clear the selection
    if (deletingSong && selectedSong?.name === deletingSong.name) {
      setSelectedSong(null);
    }
    await loadSongs();
  };

  const filteredSongs =
    search.length > 2
      ? songs.filter((song) =>
          song.fullText.includes(
            (search.toLocaleLowerCase().match(/(\w+-\w+)|\w+/g) ?? []).join(
              ' ',
            ),
          ),
        )
      : songs;

  console.log(filteredSongs);

  return (
    <>
      <div className="w-auto overflow-y-auto h-full p-2 box-border">
        <div className="space-y-2 mb-4">
          <Label htmlFor="search-song">Search for song</Label>
          <Input
            id="search-song"
            onBlur={focusProps.onBlur}
            onFocus={focusProps.onFocus}
            ref={focusProps.ref}
            className="w-full"
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
          />
        </div>
        <ul className="space-y-1">
          {filteredSongs.map((song) => (
            <li
              key={song.id}
              className="group flex items-center justify-between cursor-pointer hover:bg-accent rounded-md p-2 transition-colors"
            >
              <span
                onClick={() => setSelectedSong(song)}
                className="flex-1"
              >
                {song.name}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </li>
          ))}
        </ul>
      </div>
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
    </>
  );
};

export default SongsListPanel;
