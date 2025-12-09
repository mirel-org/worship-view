import {
  selectedSongAtom,
  songInputFocusAtom,
  songInputValueAtom,
} from '@ipc/song/song.atoms';
import { Song } from '@ipc/song/song.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useInputFocus from '@renderer/hooks/useInputFocus';
import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, ListPlus } from 'lucide-react';
import {
  useGetSongs,
  useDeleteSong,
  useAddToServiceList,
} from '@renderer/hooks/useSongs';
import SongEditorDialog from './SongEditorDialog';
import SongDeleteDialog from './SongDeleteDialog';
import SongAddDialog from './SongAddDialog';

const SongsListPanel = () => {
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const { data: songs = [], isLoading } = useGetSongs();
  const deleteSongMutation = useDeleteSong();
  const addToServiceListMutation = useAddToServiceList();
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [search, setSearch] = useAtom(songInputValueAtom);
  const [focused, setFocused] = useAtom(songInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  // Update selected song when songs list updates (e.g., after edit)
  useEffect(() => {
    if (selectedSong && songs.length > 0) {
      const updatedSong = songs.find((song) => song.id === selectedSong.id);
      if (updatedSong) {
        // Only update if the song data has actually changed
        // Compare by checking if name or fullText changed
        if (
          updatedSong.name !== selectedSong.name ||
          updatedSong.fullText !== selectedSong.fullText
        ) {
          setSelectedSong(updatedSong);
        }
      }
    }
  }, [songs, selectedSong, setSelectedSong]);

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

  const handleSave = async (_newName?: string) => {
    // React Query will automatically refetch songs after mutation
    // The useEffect hook will handle updating the selected song if it was edited
    // If the song was renamed and it's currently selected, we don't need to clear it
    // because the useEffect will update it with the new name
  };

  const handleAddSave = async () => {
    // React Query will automatically refetch songs after mutation
  };

  const handleDelete = async () => {
    if (!deletingSong) return;
    
    try {
      await deleteSongMutation.mutateAsync(deletingSong.id);
      // If the deleted song was selected, clear the selection
      if (selectedSong?.id === deletingSong.id) {
        setSelectedSong(null);
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete song:', error);
    }
  };

  const handleAddToServiceList = async (
    e: React.MouseEvent,
    song: Song,
  ) => {
    e.stopPropagation();
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

  // Sort songs alphabetically by name
  const sortedSongs = [...songs].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  const filteredSongs =
    search.length > 2
      ? sortedSongs.filter((song: Song) =>
          song.fullText.includes(
            (search.toLocaleLowerCase().match(/(\w+-\w+)|\w+/g) ?? []).join(
              ' ',
            ),
          ),
        )
      : sortedSongs;


  if (isLoading) {
    return (
      <div className="w-auto overflow-y-auto h-full p-2 box-border flex items-center justify-center">
        <p className="text-muted-foreground">Loading songs...</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col p-2 box-border">
        <div className="space-y-2 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="search-song" className="flex-1">Search for song</Label>
            <Button
              onClick={() => setAddDialogOpen(true)}
              size="sm"
              className="h-8"
              aria-label="Add new song"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Song
            </Button>
          </div>
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
        <div className="flex-1 overflow-y-auto min-h-0">
          <ul className="space-y-1">
            {filteredSongs.map((song: Song) => (
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
              </li>
            ))}
          </ul>
        </div>
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
      <SongAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddSave}
      />
    </>
  );
};

export default SongsListPanel;
