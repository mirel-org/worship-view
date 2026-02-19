import React, { useState } from 'react';
import { GripVertical, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { selectedSongAtom } from '@ipc/song/song.atoms';
import {
  useGetServiceList,
  useRemoveFromServiceList,
  useReorderServiceList,
} from '@renderer/hooks/useSongs';
import type { ServiceListSongResponse } from '@renderer/lib/jazz/store';

const ServiceListSection = () => {
  const { data: serviceList = [], isLoading } = useGetServiceList();
  const removeMutation = useRemoveFromServiceList();
  const reorderMutation = useReorderServiceList();
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
    // Set drag data to prevent text selection
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add a visual indicator
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    } else if (draggedIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDragLeave = (_e: React.DragEvent) => {
    // Don't clear dragOverIndex here - let dragOver handle it
    // This prevents flickering when moving between child elements
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newOrder = [...serviceList];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    const songIds = newOrder.map((item) => item.songId);
    try {
      await reorderMutation.mutateAsync(songIds);
    } catch (error) {
      console.error('Failed to reorder service list:', error);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemove = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeMutation.mutateAsync(songId);
    } catch (error) {
      console.error('Failed to remove song from service list:', error);
    }
  };

  const handleSongClick = (item: ServiceListSongResponse) => {
    // Song is already parsed in the response, use it directly
    setSelectedSong(item.song);
  };

  if (isLoading) {
    return (
      <div className="p-2">
        <p className="text-sm text-muted-foreground">Se încarcă lista de melodii...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 box-border">
      {serviceList.length === 0 ? (
        <div className="p-2 text-sm text-muted-foreground text-center">
          Niciun cântec în lista de melodii
        </div>
      ) : (
        <ul className="space-y-1">
          {serviceList.map((item: ServiceListSongResponse, index: number) => (
            <li
              key={item.id}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`group relative flex h-10 items-center gap-2 rounded-md px-2 transition-colors cursor-pointer ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${
                dragOverIndex === index
                  ? 'border border-ring bg-accent'
                  : selectedSong?.id === item.song.id
                    ? 'bg-accent'
                    : 'hover:bg-accent/70'
              }`}
            >
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                className="cursor-move flex-shrink-0 touch-none"
                aria-label="Trageți pentru a reordona"
                style={{ userSelect: 'none' }}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <span
                onClick={() => handleSongClick(item)}
                className="flex-1 text-sm text-foreground cursor-pointer truncate"
              >
                {item.song.name}
              </span>
              <button
                onClick={(e) => handleRemove(item.songId, e)}
                className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded text-destructive transition-opacity"
                aria-label={`Elimină ${item.song.name} din lista de melodii`}
                disabled={removeMutation.isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceListSection;
