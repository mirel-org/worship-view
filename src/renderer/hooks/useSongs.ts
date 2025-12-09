import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import { parseSong } from '../lib/songParser';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useRenameSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: number; newName: string }) =>
      api.renameSong(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { name?: string; fullText?: string } }) =>
      api.updateSong(id, updates),
    onSuccess: (data, variables) => {
      // Invalidate the songs list
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      // Invalidate the specific song content query
      queryClient.invalidateQueries({ queryKey: ['songs', variables.id] });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteSong(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });
}

