import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, MessageSquare, User, Settings, Edit2, Trash2, Eye } from 'lucide-react';
import { listingsAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { Listing } from '@/types';
import { formatPrice, formatRelativeTime } from '@/utils/helpers';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'sold' | 'expired'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, [activeTab]);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await listingsAPI.getMyListings(status);
      setListings(response.listings || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

    try {
      await listingsAPI.deleteListing(id);
      loadListings();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const tabs = [
    { id: 'all', label: 'Toutes', icon: Package },
    { id: 'active', label: 'Actives', icon: Package },
    { id: 'sold', label: 'Vendues', icon: Package },
    { id: 'expired', label: 'Expirées', icon: Package }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Mon tableau de bord
          </h1>
          <p className="text-gray-600">
            Gérez vos annonces et votre profil
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              {/* Profil */}
              <div className="text-center pb-6 border-b border-gray-200">
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.fullName}
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="font-bold text-lg text-gray-900">{user?.fullName}</h2>
                <p className="text-sm text-gray-600">{user?.city}</p>
              </div>

              {/* Menu */}
              <nav className="pt-6 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors bg-primary/5 text-primary">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Mes annonces</span>
                </button>

                <Link
                  to="/favorites"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Favoris</span>
                </Link>

                <Link
                  to="/messages"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Messages</span>
                </Link>

                <Link
                  to="/profile"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Mon profil</span>
                </Link>

                <Link
                  to="/settings"
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Paramètres</span>
                </Link>
              </nav>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Card>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Liste des annonces */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aucune annonce</p>
                  <Link to="/publish">
                    <Button>Publier une annonce</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Image */}
                      <Link
                        to={`/listing/${listing._id}`}
                        className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-gray-200"
                      >
                        {listing.images[0] ? (
                          <img
                            src={listing.images[0].url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Pas d'image
                          </div>
                        )}
                      </Link>

                      {/* Infos */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Link to={`/listing/${listing._id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-primary line-clamp-1">
                              {listing.title}
                            </h3>
                          </Link>
                          <div className="flex gap-2">
                            <Link to={`/listings/edit/${listing._id}`}>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(listing._id)}
                              className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-danger" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              listing.status === 'active'
                                ? 'success'
                                : listing.status === 'sold'
                                ? 'warning'
                                : 'default'
                            }
                            size="sm"
                          >
                            {listing.status === 'active' && 'Active'}
                            {listing.status === 'sold' && 'Vendue'}
                            {listing.status === 'expired' && 'Expirée'}
                            {listing.status === 'pending' && 'En attente'}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatRelativeTime(listing.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(listing.price)}
                          </span>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{listing.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{listing.favorites}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
