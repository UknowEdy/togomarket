import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI, listingsAPI } from '@/services/api';
import { ListingCard } from '@/components/ListingCard';
import type { Category, Listing } from '@/types';
import { Loader } from 'lucide-react';

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, listingsRes] = await Promise.all([
        categoriesAPI.getCategories(),
        listingsAPI.getListings({ page: 1, limit: 12 })
      ]);

      setCategories(categoriesRes.categories || []);
      setListings(listingsRes.listings || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Achetez et vendez facilement au Togo 🇹🇬
          </h1>
          <p className="text-xl mb-8 text-white/90">
            La plateforme de petites annonces n°1 pour l'Afrique de l'Ouest
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/publish"
              className="px-8 py-3 bg-secondary text-gray-900 font-semibold rounded-lg hover:bg-secondary-dark transition-colors"
            >
              Publier une annonce
            </Link>
            <Link
              to="/browse"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Parcourir les annonces
            </Link>
          </div>
        </div>
      </section>

      {/* Catégories populaires */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Catégories populaires
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-900">
            Annonces récentes
          </h2>
          <Link
            to="/browse"
            className="text-primary font-semibold hover:underline"
          >
            Voir toutes →
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune annonce pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Pourquoi TogoMarket */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 text-center mb-12">
            Pourquoi choisir TogoMarket ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Sécurisé</h3>
              <p className="text-gray-600">
                Système de vérification d'identité et profils vérifiés
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Mobile Money</h3>
              <p className="text-gray-600">
                Paiement facile avec Togocel, Moov, MTN, Orange Money
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Rapide</h3>
              <p className="text-gray-600">
                Optimisé pour connexions 2G/3G et mobile first
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
