import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';

export function useFavorites() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const token = useAuthStore.getState().token;
      if (!token) return [];
      
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const data = await res.json();
      return data.favorites as string[]; 
    },
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId }),
      });
      
      if (!res.ok) throw new Error('Failed to toggle favorite');
      const data = await res.json();
      return { propertyId, isFavorited: data.isFavorited };
    },
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previousFavorites = queryClient.getQueryData<string[]>(['favorites', user?.id]);
      
      queryClient.setQueryData<string[]>(['favorites', user?.id], (old = []) => {
        if (old.includes(propertyId)) {
          return old.filter(id => id !== propertyId);
        } else {
          return [...old, propertyId];
        }
      });
      
      return { previousFavorites };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user?.id], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const isFavorited = (propertyId: string) => favorites.includes(propertyId);

  const toggleFavorite = (propertyId: string) => {
    if (!user) {
      // Could show a toast or trigger login modal here
      alert("Please sign in to favorite properties.");
      return;
    }
    toggleMutation.mutate(propertyId);
  };

  return { favorites, isFavorited, toggleFavorite, isLoading: toggleMutation.isPending };
}
