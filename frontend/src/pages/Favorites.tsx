import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { favoritesAPI } from '@/services/api';
import { ListingCard } from '@/components/ListingCard';
import type { Listing } from '@/types';

export const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await favoritesAPI.getFavorites();
      setFavorites(response.favorites || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-danger fill-current" />
            Mes favoris
          </h1>
          <p className="text-gray-600">
            {favorites.length} annonce{favorites.length > 1 && 's'} sauvegardée{favorites.length > 1 && 's'}
          </p>
        </div>

        {/* Liste */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun favori
            </h2>
            <p className="text-gray-600 mb-6">
              Ajoutez des annonces à vos favoris pour les retrouver facilement
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <ListingCard key={favorite._id} listing={favorite.listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
