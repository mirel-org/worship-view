import { FC, useEffect, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { ListPlus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { mediaUploadPickerRequestAtom } from '@ipc/media/media.atoms';
import { selectedSongAtom } from '@ipc/song/song.atoms';
import { Song } from '@ipc/song/song.types';
import {
  useAddToServiceList,
  useClearServiceList,
  useDeleteSong,
  useGetSongs,
} from '@renderer/hooks/useSongs';
import MediaPanel from '../panels/media-panel/MediaPanel';
import SlidesListPanel from '../panels/slides-list-panel/SlidesListPanel';
import ServiceListSection from '../panels/songs-list-panel/ServiceListSection';
import SongDeleteDialog from '../panels/songs-list-panel/SongDeleteDialog';
import SongEditorDialog from '../panels/songs-list-panel/SongEditorDialog';

const TabsSongs: FC = () => {
  const [, setUploadRequest] = useAtom(mediaUploadPickerRequestAtom);
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const { data: songs = [] } = useGetSongs();
  const clearServiceListMutation = useClearServiceList();
  const addToServiceListMutation = useAddToServiceList();
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

  const handleUpload = () => {
    setUploadRequest((v) => v + 1);
  };

  const handleClearServiceList = async () => {
    if (!window.confirm('Sigur doriți să goliți întreaga listă de melodii?')) {
      return;
    }

    try {
      await clearServiceListMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to clear service list:', error);
    }
  };

  const handleHeaderAddToServiceList = async () => {
    if (!selectedSong) return;
    try {
      await addToServiceListMutation.mutateAsync(selectedSong.id);
    } catch (error: any) {
      if (error.message?.includes('already')) {
        alert(error.message);
      } else {
        console.error('Failed to add song to service list:', error);
      }
    }
  };

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
      <div className="w-[300px] flex-none flex flex-col bg-background">
        <PanelGroup direction="vertical" autoSaveId="songs-tabs-panels">
          <Panel defaultSize={55} minSize={20}>
            <div className="h-full flex flex-col border-b border-border">
              <div className="flex h-10 items-center justify-between bg-muted border-b border-border pl-3 pr-2 flex-shrink-0">
                <span className="text-sm font-semibold text-foreground">Listă Serviciu</span>
                <button
                  type="button"
                  onClick={handleClearServiceList}
                  disabled={clearServiceListMutation.isLoading}
                  className="h-7 rounded-md border border-border px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-accent/70 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  {clearServiceListMutation.isLoading ? 'Se golește...' : 'Golește'}
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ServiceListSection />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="h-1 bg-border transition-colors hover:bg-accent" />

          <Panel defaultSize={45} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="flex h-10 items-center justify-between bg-muted border-b border-border pl-3 pr-2 flex-shrink-0">
                <span className="text-sm font-semibold text-foreground">Media</span>
                <button
                  type="button"
                  onClick={handleUpload}
                  className="h-7 rounded-md bg-muted px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-accent/70"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Încarcă
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MediaPanel />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <div className="w-px h-full bg-border" />

      <div className="flex-1 flex flex-col">
        {selectedSong && (
          <div className="h-10 border-b border-border bg-muted flex items-center justify-between pl-4 pr-3">
            <span className="text-sm font-semibold text-foreground">
              {selectedSong.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleHeaderAddToServiceList}
                disabled={addToServiceListMutation.isLoading}
                className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-accent/70"
                aria-label="Add to service list"
              >
                <ListPlus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleHeaderEdit}
                className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-foreground hover:bg-accent/70"
                aria-label="Edit song"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleHeaderDelete}
                className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-destructive hover:bg-accent/70"
                aria-label="Delete song"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
