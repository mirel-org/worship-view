import { FC, useEffect, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { ListPlus, Pencil, Trash2 } from 'lucide-react';
import { useAtom } from 'jotai';
import { selectedSongAtom } from '../../state/song.atoms';
import { Song } from '../../types/song.types';
import {
  useAddToServiceList,
  useDeleteSong,
  useGetSongs,
  useGetServiceLists,
} from '../../hooks/useSongs';
import MediaPanel from '../panels/media-panel/MediaPanel';
import SlidesListPanel from '../panels/slides-list-panel/SlidesListPanel';
import ServiceListSection from '../panels/songs-list-panel/ServiceListSection';
import SongDeleteDialog from '../panels/songs-list-panel/SongDeleteDialog';
import SongEditorDialog from '../panels/songs-list-panel/SongEditorDialog';
import Sidebar from '../layout/Sidebar';
import { Button } from '@worship-view/ui';
import { useAppDialogs } from '../dialogs/AppDialogsProvider';

const AddToServiceListButton: FC<{ songId: string }> = ({ songId }) => {
  const dialogs = useAppDialogs();
  const { data: serviceLists = [] } = useGetServiceLists();
  const addToServiceListMutation = useAddToServiceList();
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = async (serviceListId: string) => {
    try {
      await addToServiceListMutation.mutateAsync({ serviceListId, songId });
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
    setShowPicker(false);
  };

  if (serviceLists.length === 0) return null;

  if (serviceLists.length === 1) {
    return (
      <Button
        onClick={() => handleAdd(serviceLists[0].id)}
        disabled={addToServiceListMutation.isLoading}
        variant="outline"
        size="icon"
        className="h-8 w-8"
        aria-label="Add to service list"
      >
        <ListPlus className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowPicker(!showPicker)}
        disabled={addToServiceListMutation.isLoading}
        variant="outline"
        size="icon"
        className="h-8 w-8"
        aria-label="Add to service list"
      >
        <ListPlus className="h-4 w-4" />
      </Button>
      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[160px]">
            {serviceLists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleAdd(list.id)}
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
  );
};

const TabsSongs: FC = () => {
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const { data: songs = [] } = useGetSongs();
  const deleteSongMutation = useDeleteSong();
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedSong || songs.length === 0) return;
    const updatedSong = songs.find((song) => song.id === selectedSong.id);
    if (!updatedSong) return;
    if (
      updatedSong.name !== selectedSong.name ||
      updatedSong.fullText !== selectedSong.fullText
    ) {
      setSelectedSong(updatedSong);
    }
  }, [songs, selectedSong, setSelectedSong]);

  const handleHeaderEdit = () => {
    if (!selectedSong) return;
    setEditingSong(selectedSong);
    setEditDialogOpen(true);
  };

  const handleHeaderDelete = () => {
    if (!selectedSong) return;
    setDeletingSong(selectedSong);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSong) return;
    try {
      await deleteSongMutation.mutateAsync(deletingSong.id);
      if (selectedSong?.id === deletingSong.id) {
        setSelectedSong(null);
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete song:', error);
    }
  };

  const handleSave = async (updatedSong: Song) => {
    if (selectedSong?.id === updatedSong.id) {
      setSelectedSong(updatedSong);
    }
  };

  return (
    <div className="flex h-full bg-card">
      <Sidebar>
        <PanelGroup direction="vertical" autoSaveId="songs-tabs-panels">
          <Panel defaultSize={55} minSize={20}>
            <div className="h-full flex flex-col border-b border-border">
              <div className="flex h-10 items-center bg-muted border-b border-border pl-3 pr-2 flex-shrink-0">
                <span className="text-sm font-semibold text-foreground">Liste Serviciu</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ServiceListSection />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="h-1 bg-border transition-colors hover:bg-accent" />

          <Panel defaultSize={45} minSize={20}>
            <div className="h-full overflow-hidden">
              <MediaPanel />
            </div>
          </Panel>
        </PanelGroup>
      </Sidebar>

      <div className="hidden lg:block w-px h-full bg-border" />

      <div className="flex-1 min-w-0 flex flex-col">
        {selectedSong && (
          <div className="h-10 border-b border-border bg-muted flex items-center justify-between pl-4 pr-3">
            <span className="text-sm font-semibold text-foreground">
              {selectedSong.name}
            </span>
            <div className="flex items-center gap-2">
              <AddToServiceListButton songId={selectedSong.id} />
              <Button
                onClick={handleHeaderEdit}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Edit song"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleHeaderDelete}
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                aria-label="Delete song"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden dot-grid-bg">
          <SlidesListPanel />
        </div>
      </div>
      <SongEditorDialog
        song={editingSong}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSave}
      />
      <SongDeleteDialog
        song={deletingSong}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TabsSongs;
