import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid, List } from 'lucide-react';
import { listingsAPI, categoriesAPI } from '@/services/api';
import type { Listing, Category } from '@/types';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

const CITIES = ['Toutes', 'Lomé', 'Kara', 'Sokodé', 'Kpalimé', 'Atakpamé', 'Bassar', 'Tsévié', 'Aného', 'Dapaong', 'Tchamba'];
const CONDITIONS = ['Tous', 'new', 'excellent', 'good', 'acceptable'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Plus récentes' },
  { value: 'price', label: 'Prix croissant' },
  { value: '-price', label: 'Prix décroissant' },
  { value: '-views', label: 'Plus vues' }
];

export const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState<Category | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtres
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'Toutes');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || 'Tous');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  useEffect(() => {
    loadListings();
  }, [categoryId, selectedCity, selectedCondition, minPrice, maxPrice, sortBy, page]);

  const loadCategory = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      const cat = response.categories?.find(c => c.id === categoryId);
      setCategory(cat || null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadListings = async () => {
    try {
      setIsLoading(true);

      const filters: any = {
        category: categoryId,
        page,
        limit: 20,
        sort: sortBy
      };

      if (selectedCity !== 'Toutes') filters.city = selectedCity;
      if (selectedCondition !== 'Tous') filters.condition = selectedCondition;
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;

      const response = await listingsAPI.getListings(filters);
      setListings(response.listings || []);
      setTotalPages(response.pages || 1);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    const params: any = {};
    if (selectedCity !== 'Toutes') params.city = selectedCity;
    if (selectedCondition !== 'Tous') params.condition = selectedCondition;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sortBy !== '-createdAt') params.sort = sortBy;

    setSearchParams(params);
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedCity('Toutes');
    setSelectedCondition('Tous');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('-createdAt');
    setSearchParams({});
  };

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Catégorie introuvable</h1>
          <a href="/" className="text-primary hover:underline">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-600">
                {listings.length} annonce{listings.length > 1 && 's'}
              </p>
            </div>
          </div>

          {/* Sous-catégories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {category.subcategories.map((sub) => (
                <button
                  key={sub}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Barre d'actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtres
            </Button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* État */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Tous">Tous</option>
                  <option value="new">Neuf</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Bon</option>
                  <option value="acceptable">Acceptable</option>
                </select>
              </div>

              {/* Prix min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix min (FCFA)
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Prix max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix max (FCFA)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <Button onClick={handleFilterChange} fullWidth>
                Appliquer les filtres
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </Card>
        )}

        {/* Annonces */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune annonce dans cette catégorie
            </h2>
            <p className="text-gray-600">
              Soyez le premier à publier !
            </p>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Précédent
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
