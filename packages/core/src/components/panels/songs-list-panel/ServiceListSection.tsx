import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, GripVertical, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { selectedSongAtom } from '../../../state/song.atoms';
import { closeSidebar } from '../../layout/Sidebar';
import {
  useGetServiceLists,
  useGetServiceListItems,
  useRemoveFromServiceList,
  useReorderServiceList,
  useClearServiceList,
  useCreateServiceList,
  useRenameServiceList,
  useDeleteServiceList,
} from '../../../hooks/useSongs';
import type { ServiceListSongResponse } from '../../../jazz/store';
import type { ServiceListResponse } from '../../../jazz/store';
import { Button } from '@worship-view/ui';

interface ServiceListAccordionItemProps {
  serviceList: ServiceListResponse;
  isExpanded: boolean;
  onToggle: () => void;
}

const ServiceListAccordionItem = ({
  serviceList,
  isExpanded,
  onToggle,
}: ServiceListAccordionItemProps) => {
  const { data: items = [], isLoading } = useGetServiceListItems(serviceList.id);
  const removeMutation = useRemoveFromServiceList();
  const reorderMutation = useReorderServiceList();
  const clearMutation = useClearServiceList();
  const renameMutation = useRenameServiceList();
  const deleteMutation = useDeleteServiceList();
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(serviceList.name);
  const [showActions, setShowActions] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);

  const openMenu = useCallback(() => {
    if (dotsRef.current) {
      const rect = dotsRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right });
    }
    setShowActions(true);
  }, []);

  const closeMenu = useCallback(() => {
    setShowActions(false);
    setMenuPos(null);
  }, []);

  useEffect(() => {
    if (!showActions) return;
    const onScroll = () => closeMenu();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [showActions, closeMenu]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
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

  const handleDragLeave = (_e: React.DragEvent) => {};

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newOrder = [...items];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    const songIds = newOrder.map((item) => item.songId);
    try {
      await reorderMutation.mutateAsync({ serviceListId: serviceList.id, songIds });
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
      await removeMutation.mutateAsync({ serviceListId: serviceList.id, songId });
    } catch (error) {
      console.error('Failed to remove song from service list:', error);
    }
  };

  const handleSongClick = (item: ServiceListSongResponse) => {
    setSelectedSong(item.song);
    closeSidebar();
  };

  const handleClear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Sigur doriți să goliți această listă?')) return;
    try {
      await clearMutation.mutateAsync(serviceList.id);
    } catch (error) {
      console.error('Failed to clear service list:', error);
    }
    setShowActions(false);
  };

  const handleRenameSubmit = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === serviceList.name) {
      setIsRenaming(false);
      setRenameValue(serviceList.name);
      return;
    }
    try {
      await renameMutation.mutateAsync({ serviceListId: serviceList.id, newName: trimmed });
    } catch (error) {
      console.error('Failed to rename service list:', error);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setRenameValue(serviceList.name);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Sigur doriți să ștergeți lista "${serviceList.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(serviceList.id);
    } catch (error) {
      console.error('Failed to delete service list:', error);
    }
    setShowActions(false);
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameValue(serviceList.name);
    setIsRenaming(true);
    setShowActions(false);
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div
        className="flex h-9 items-center justify-between bg-muted px-2 cursor-pointer select-none hover:bg-muted/80 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
          {isRenaming ? (
            <input
              className="text-xs font-medium bg-background border border-border rounded px-1.5 py-0.5 min-w-0 flex-1"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span className="text-xs font-medium text-foreground truncate">
              {serviceList.name}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            ({items.length})
          </span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            ref={dotsRef}
            onClick={(e) => {
              e.stopPropagation();
              if (showActions) closeMenu();
              else openMenu();
            }}
            className="p-1 hover:bg-accent rounded text-muted-foreground transition-colors"
            aria-label="Acțiuni listă"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {showActions && menuPos && createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={(e) => {
                  e.stopPropagation();
                  closeMenu();
                }}
              />
              <div
                className="fixed z-[9999] bg-popover border border-border rounded-md shadow-md py-1 min-w-[140px]"
                style={{ top: menuPos.top, left: menuPos.left, transform: 'translateX(-100%)' }}
              >
                <button
                  onClick={handleStartRename}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Redenumește
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                >
                  <X className="h-3 w-3" />
                  Golește
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-destructive hover:bg-accent transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Șterge
                </button>
              </div>
            </>,
            document.body,
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-card">
          {isLoading ? (
            <div className="p-2">
              <p className="text-xs text-muted-foreground">Se încarcă...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-2 text-xs text-muted-foreground text-center">
              Niciun cântec în această listă
            </div>
          ) : (
            <ul className="p-1 space-y-0.5">
              {items.map((item: ServiceListSongResponse, index: number) => (
                <li
                  key={item.id}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`group relative flex h-9 items-center gap-1.5 rounded-md px-1.5 transition-colors cursor-pointer ${
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
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                  <span
                    onClick={() => handleSongClick(item)}
                    className="flex-1 text-xs text-foreground cursor-pointer truncate"
                  >
                    {item.song.name}
                  </span>
                  <button
                    onClick={(e) => handleRemove(item.songId, e)}
                    className="absolute right-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent rounded text-destructive transition-opacity"
                    aria-label={`Elimină ${item.song.name} din listă`}
                    disabled={removeMutation.isLoading}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const ServiceListSection = () => {
  const { data: serviceLists = [], isLoading } = useGetServiceLists();
  const createMutation = useCreateServiceList();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Auto-expand new lists when they appear
  const [prevCount, setPrevCount] = useState(0);
  if (serviceLists.length > prevCount && prevCount > 0) {
    const newList = serviceLists[serviceLists.length - 1];
    if (newList && !expandedIds.has(newList.id)) {
      setExpandedIds((prev) => new Set([...prev, newList.id]));
    }
  }
  if (serviceLists.length !== prevCount) {
    setPrevCount(serviceLists.length);
  }

  // Auto-expand all lists on first load
  if (serviceLists.length > 0 && expandedIds.size === 0 && prevCount === serviceLists.length) {
    setExpandedIds(new Set(serviceLists.map((l) => l.id)));
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateSubmit = async () => {
    const trimmed = newListName.trim();
    if (!trimmed) {
      setIsCreating(false);
      setNewListName('');
      return;
    }
    try {
      await createMutation.mutateAsync(trimmed);
      setNewListName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create service list:', error);
    }
  };

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateSubmit();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewListName('');
    }
  };

  if (isLoading) {
    return (
      <div className="p-2">
        <p className="text-sm text-muted-foreground">Se încarcă listele...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 box-border flex flex-col gap-1.5">
      {serviceLists.map((serviceList) => (
        <ServiceListAccordionItem
          key={serviceList.id}
          serviceList={serviceList}
          isExpanded={expandedIds.has(serviceList.id)}
          onToggle={() => toggleExpanded(serviceList.id)}
        />
      ))}

      {serviceLists.length === 0 && !isCreating && (
        <div className="p-2 text-sm text-muted-foreground text-center">
          Nicio listă de serviciu
        </div>
      )}

      {isCreating ? (
        <div className="flex items-center gap-1.5 px-1">
          <input
            className="text-xs bg-background border border-border rounded px-2 py-1.5 min-w-0 flex-1"
            placeholder="Numele listei..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onBlur={handleCreateSubmit}
            onKeyDown={handleCreateKeyDown}
            autoFocus
          />
        </div>
      ) : (
        <Button
          onClick={() => setIsCreating(true)}
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs w-full"
        >
          <Plus className="h-3.5 w-3.5" />
          Listă nouă
        </Button>
      )}
    </div>
  );
};

export default ServiceListSection;
