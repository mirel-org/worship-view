import {
  selectedSongAtom,
  songInputFocusAtom,
  songInputValueAtom,
} from '../../../state/song.atoms';
import { Song } from '../../../types/song.types';
import { Input } from '@worship-view/ui';
import { Label } from '@worship-view/ui';
import { Button } from '@worship-view/ui';
import useInputFocus from '../../../hooks/useInputFocus';
import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, ListPlus } from 'lucide-react';
import {
  useGetSongs,
  useDeleteSong,
  useAddToServiceList,
  useGetServiceLists,
} from '../../../hooks/useSongs';
import SongEditorDialog from './SongEditorDialog';
import SongDeleteDialog from './SongDeleteDialog';
import SongAddDialog from './SongAddDialog';
import { useAppDialogs } from '../../dialogs/AppDialogsProvider';

const SongsListPanel = () => {
  const dialogs = useAppDialogs();
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const { data: songs = [], isLoading } = useGetSongs();
  const deleteSongMutation = useDeleteSong();
  const addToServiceListMutation = useAddToServiceList();
  const { data: serviceLists = [] } = useGetServiceLists();
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [serviceListPickerSongId, setServiceListPickerSongId] = useState<string | null>(null);
  const [search, setSearch] = useAtom(songInputValueAtom);
  const [focused, setFocused] = useAtom(songInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  // Update selected song when songs list updates (e.g., after edit)
  useEffect(() => {
    if (selectedSong && songs.length > 0) {
      const updatedSong = songs.find((song: Song) => song.id === selectedSong.id);
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

  const handleSave = async (updatedSong: Song) => {
    if (selectedSong?.id === updatedSong.id) {
      setSelectedSong(updatedSong);
    }
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
    if (serviceLists.length === 0) return;

    if (serviceLists.length === 1) {
      try {
        await addToServiceListMutation.mutateAsync({ serviceListId: serviceLists[0].id, songId: song.id });
      } catch (error: any) {
        if (error.message?.includes('already')) {
          await dialogs.alert({
            title: 'Cântec deja adăugat',
            description: error.message,
          });
        } else {
          console.error('Failed to add song to service list:', error);
        }
      }
    } else {
      setServiceListPickerSongId(song.id);
    }
  };

  const handlePickServiceList = async (serviceListId: string) => {
    if (!serviceListPickerSongId) return;
    try {
      await addToServiceListMutation.mutateAsync({ serviceListId, songId: serviceListPickerSongId });
    } catch (error: any) {
      if (error.message?.includes('already')) {
        await dialogs.alert({
          title: 'Cântec deja adăugat',
          description: error.message,
        });
      } else {
        console.error('Failed to add song to service list:', error);
      }
    }
    setServiceListPickerSongId(null);
  };

  // Sort songs alphabetically by name
  const sortedSongs = [...songs].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  const filteredSongs =
    search.length > 6
      ? sortedSongs.filter((song: Song) =>
          song.fullText.includes(
            (search.toLocaleLowerCase().match(/(\w+-\w+)|\w+/g) ?? []).join(
              ' ',
            ),
          ),
        )
      : [];


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
                  <div className="relative">
                    <button
                      onClick={(e) => handleAddToServiceList(e, song)}
                      className="p-1 hover:bg-accent-foreground/10 rounded"
                      aria-label={`Add ${song.name} to service list`}
                      disabled={addToServiceListMutation.isLoading}
                    >
                      <ListPlus className="h-4 w-4" />
                    </button>
                    {serviceListPickerSongId === song.id && serviceLists.length > 1 && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setServiceListPickerSongId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[160px]">
                          {serviceLists.map((list) => (
                            <button
                              key={list.id}
                              onClick={(e) => { e.stopPropagation(); handlePickServiceList(list.id); }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                            >
                              <ListPlus className="h-3 w-3" />
                              {list.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
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
