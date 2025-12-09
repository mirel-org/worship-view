import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import { parseSong } from '../lib/songParser';
import type { Song } from '@ipc/song/song.types';
import type { ServiceListSongResponse } from '../lib/api';

export function useGetSongs() {
  return useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const songs = await api.getSongs();
      // Parse each song to convert fullText to Song structure
      return songs.map((song) => parseSong(song.id, song.name, song.fullText));
    },
  });
}

export function useGetSongContent(id: number) {
  return useQuery({
    queryKey: ['songs', id],
    queryFn: () => api.getSongContent(id),
    enabled: !!id,
  });
}

export function useSaveSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      api.saveSong(name, content),
    onMutate: async ({ name, content }) => {
      await queryClient.cancelQueries({ queryKey: ['songs'] });
      
      const previousSongs = queryClient.getQueryData<Song[]>(['songs']);
      
      // Optimistically add the new song
      if (previousSongs) {
        const newSong = parseSong(Date.now(), name, content); // Temporary ID
        queryClient.setQueryData<Song[]>(['songs'], (old = []) => [...old, newSong]);
      }
      
      return { previousSongs };
    },
    onError: (err, variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(['songs'], context.previousSongs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useRenameSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: number; newName: string }) =>
      api.renameSong(id, newName),
    onMutate: async ({ id, newName }) => {
      await queryClient.cancelQueries({ queryKey: ['songs'] });
      
      const previousSongs = queryClient.getQueryData<Song[]>(['songs']);
      
      // Optimistically update the song name
      if (previousSongs) {
        queryClient.setQueryData<Song[]>(['songs'], (old = []) =>
          old.map((song) =>
            song.id === id ? { ...song, name: newName } : song
          )
        );
      }
      
      return { previousSongs };
    },
    onError: (err, variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(['songs'], context.previousSongs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { name?: string; fullText?: string } }) =>
      api.updateSong(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['songs'] });
      await queryClient.cancelQueries({ queryKey: ['songs', id] });
      
      const previousSongs = queryClient.getQueryData<Song[]>(['songs']);
      const previousSongContent = queryClient.getQueryData<string>(['songs', id]);
      
      // Optimistically update the song
      if (previousSongs) {
        queryClient.setQueryData<Song[]>(['songs'], (old = []) =>
          old.map((song) => {
            if (song.id === id) {
              const updatedSong = updates.fullText
                ? parseSong(id, updates.name || song.name, updates.fullText)
                : { ...song, ...(updates.name && { name: updates.name }) };
              return updatedSong;
            }
            return song;
          })
        );
      }
      
      // Update song content cache if fullText changed
      if (updates.fullText && previousSongContent !== undefined) {
        queryClient.setQueryData(['songs', id], updates.fullText);
      }
      
      return { previousSongs, previousSongContent };
    },
    onError: (err, variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(['songs'], context.previousSongs);
      }
      if (context?.previousSongContent !== undefined) {
        queryClient.setQueryData(['songs', variables.id], context.previousSongContent);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['songs', variables.id] });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteSong(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['songs'] });
      
      const previousSongs = queryClient.getQueryData<Song[]>(['songs']);
      
      // Optimistically remove the song
      if (previousSongs) {
        queryClient.setQueryData<Song[]>(['songs'], (old = []) =>
          old.filter((song) => song.id !== id)
        );
      }
      
      return { previousSongs };
    },
    onError: (err, variables, context) => {
      if (context?.previousSongs) {
        queryClient.setQueryData(['songs'], context.previousSongs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

// Service List Hooks
export function useGetServiceList() {
  return useQuery({
    queryKey: ['service-list'],
    queryFn: () => api.getServiceList(),
  });
}

export function useAddToServiceList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (songId: number) => api.addToServiceList(songId),
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: ['service-list'] });
      await queryClient.cancelQueries({ queryKey: ['songs'] });
      
      const previousList = queryClient.getQueryData<ServiceListSongResponse[]>(['service-list']);
      const songs = queryClient.getQueryData<Song[]>(['songs']);
      
      // Find the song data
      const song = songs?.find((s) => s.id === songId);
      
      if (previousList && song) {
        // Check if song is already in the list
        const exists = previousList.some((item) => item.songId === songId);
        if (exists) {
          throw new Error('Song is already in the service list');
        }
        
        // Optimistically add the song
        const newItem: ServiceListSongResponse = {
          id: Date.now(), // Temporary ID
          songId: songId,
          position: previousList.length + 1,
          song: {
            id: song.id,
            name: song.name,
            fullText: song.fullText,
          },
        };
        
        queryClient.setQueryData<ServiceListSongResponse[]>(
          ['service-list'],
          (old = []) => [...old, newItem]
        );
      }
      
      return { previousList };
    },
    onError: (err, songId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['service-list'], context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['service-list'] });
    },
  });
}

export function useRemoveFromServiceList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (songId: number) => api.removeFromServiceList(songId),
    onMutate: async (songId) => {
      await queryClient.cancelQueries({ queryKey: ['service-list'] });
      
      const previousList = queryClient.getQueryData<ServiceListSongResponse[]>(['service-list']);
      
      // Optimistically remove the song and reorder positions
      if (previousList) {
        const filtered = previousList.filter((item) => item.songId !== songId);
        const reordered = filtered.map((item, index) => ({
          ...item,
          position: index + 1,
        }));
        
        queryClient.setQueryData<ServiceListSongResponse[]>(
          ['service-list'],
          reordered
        );
      }
      
      return { previousList };
    },
    onError: (err, songId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['service-list'], context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['service-list'] });
    },
  });
}

export function useReorderServiceList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (songIds: number[]) => api.reorderServiceList(songIds),
    onMutate: async (songIds) => {
      await queryClient.cancelQueries({ queryKey: ['service-list'] });
      
      const previousList = queryClient.getQueryData<ServiceListSongResponse[]>(['service-list']);
      
      // Optimistically reorder the list
      if (previousList) {
        const reordered = songIds
          .map((songId, index) => {
            const item = previousList.find((i) => i.songId === songId);
            return item ? { ...item, position: index + 1 } : null;
          })
          .filter((item): item is ServiceListSongResponse => item !== null);
        
        queryClient.setQueryData<ServiceListSongResponse[]>(
          ['service-list'],
          reordered
        );
      }
      
      return { previousList };
    },
    onError: (err, songIds, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['service-list'], context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['service-list'] });
    },
  });
}

export function useClearServiceList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => api.clearServiceList(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['service-list'] });
      
      const previousList = queryClient.getQueryData<ServiceListSongResponse[]>(['service-list']);
      
      // Optimistically clear the list
      queryClient.setQueryData<ServiceListSongResponse[]>(['service-list'], []);
      
      return { previousList };
    },
    onError: (err, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['service-list'], context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['service-list'] });
    },
  });
}

