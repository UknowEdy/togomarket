import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI, listingsAPI } from '@/services/api';
import { ListingCard } from '@/components/ListingCard';
import type { Category, Listing } from '@/types';
import { Loader, Grid3x3, X, ChevronRight } from 'lucide-react';

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    loadData();
  }, [sortBy]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, listingsRes] = await Promise.all([
        categoriesAPI.getCategories(),
        listingsAPI.getListings({ page: 1, limit: 24, sortBy })
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
      {/* Hero Section - Compact */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
            TogoMarket - Petites annonces au Togo 🇹🇬
          </h1>
          <p className="text-sm md:text-base mb-4 text-white/90">
            Achetez et vendez facilement
          </p>
          <Link
            to="/publish"
            className="inline-block px-6 py-2 bg-secondary text-gray-900 font-semibold rounded-lg hover:bg-secondary-dark transition-colors"
          >
            + Publier gratuitement
          </Link>
        </div>
      </section>

      {/* Main Layout - Sidebar + Annonces */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* SIDEBAR GAUCHE - Catégories (Desktop uniquement) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Catégories
              </h2>
              <nav className="space-y-1">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 rounded bg-primary/10 text-primary font-medium text-sm"
                >
                  <span className="text-xl">🏠</span>
                  <span>Toutes les annonces</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-sm transition-colors group"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="flex-1">{cat.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* ZONE PRINCIPALE - Annonces */}
          <main className="flex-1 min-w-0">
            {/* Header avec tri */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Toutes les annonces
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({listings.length} annonces)
                </span>
              </h2>

              {/* Filtres de tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="-createdAt">Plus récentes</option>
                <option value="price">Prix croissant</option>
                <option value="-price">Prix décroissant</option>
                <option value="-views">Plus populaires</option>
              </select>
            </div>

            {/* Grid annonces - 3 colonnes sur desktop */}
            {listings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">Aucune annonce pour le moment</p>
                <Link
                  to="/publish"
                  className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Publier la première annonce
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}

            {/* Bouton Voir Plus */}
            {listings.length >= 24 && (
              <div className="text-center mt-8">
                <Link
                  to="/browse"
                  className="inline-block px-8 py-3 bg-white border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Voir toutes les annonces →
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Pourquoi TogoMarket */}
      <section className="bg-white py-16 mt-8">
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

      {/* Bouton Catégories Flottant (Mobile uniquement) */}
      <button
        onClick={() => setShowCategories(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-40 hover:bg-primary-dark transition-transform hover:scale-110"
        aria-label="Afficher les catégories"
      >
        <Grid3x3 className="w-6 h-6" />
      </button>

      {/* Modal Catégories Mobile */}
      {showCategories && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => setShowCategories(false)}
          />

          {/* Bottom Sheet */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up">
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  Catégories
                </h2>
                <button
                  onClick={() => setShowCategories(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Liste des catégories */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setShowCategories(false)}
                  className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 text-primary font-medium"
                >
                  <span className="text-2xl">🏠</span>
                  <span>Toutes les annonces</span>
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setShowCategories(false)}
                    className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="flex-1">{cat.name}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
