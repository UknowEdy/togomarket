import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Share2,
  Flag,
  MapPin,
  Eye,
  MessageSquare,
  Phone,
  Star,
  CheckCircle,
  Calendar,
  Package
} from 'lucide-react';
import { listingsAPI, favoritesAPI, messagesAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { Listing } from '@/types';
import { formatPrice, formatRelativeTime, getConditionLabel, getConditionColor, formatPhoneNumber } from '@/utils/helpers';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';

export const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (id) {
      loadListing();
      if (isAuthenticated) {
        checkFavorite();
      }
    }
  }, [id]);

  const loadListing = async () => {
    try {
      setIsLoading(true);
      const response = await listingsAPI.getListing(id!);
      setListing(response.listing!);
    } catch (error: any) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoritesAPI.checkFavorite(id!);
      setIsFavorite(response.isFavorite!);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.removeFavorite(id!);
        setIsFavorite(false);
      } else {
        await favoritesAPI.addFavorite(id!);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await messagesAPI.getOrCreateConversation(id!);
      navigate(`/messages/${response.conversation?._id}`);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Annonce introuvable</h1>
        <Link to="/" className="text-primary hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === listing.seller._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <span className="mx-2">/</span>
          <Link to={`/category/${listing.category}`} className="hover:text-primary">{listing.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            {/* Galerie d'images */}
            <Card padding={false} className="overflow-hidden mb-6">
              {/* Image principale */}
              <div className="relative aspect-[4/3] bg-gray-200">
                {listing.images[selectedImage] ? (
                  <img
                    src={listing.images[selectedImage].url}
                    alt={listing.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Pas d'image
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {listing.isUrgent && (
                    <Badge variant="danger">URGENT</Badge>
                  )}
                  {listing.isFeatured && (
                    <Badge variant="warning">⭐ VEDETTE</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-full transition-colors ${
                      isFavorite
                        ? 'bg-danger text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite && 'fill-current'}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Miniatures */}
              {listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Titre et prix */}
            <Card className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.location.city}</span>
                      {listing.location.district && (
                        <span className="text-gray-400">• {listing.location.district}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{listing.views} vues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatRelativeTime(listing.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Flag className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Prix */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                {listing.isFree ? (
                  <span className="text-4xl font-bold text-primary">Gratuit</span>
                ) : (
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      {formatPrice(listing.price)}
                    </span>
                    {listing.isNegotiable && (
                      <Badge variant="info" size="sm">Négociable</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">État</div>
                  <Badge className={getConditionColor(listing.condition)}>
                    {getConditionLabel(listing.condition)}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Statut</div>
                  <Badge variant={listing.status === 'active' ? 'success' : 'default'}>
                    {listing.status === 'active' ? 'Disponible' : 'Non disponible'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </Card>
          </div>

          {/* Sidebar vendeur */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <div className="text-center mb-6">
                <Link to={`/user/${listing.seller._id}`}>
                  {listing.seller.avatar?.url ? (
                    <img
                      src={listing.seller.avatar.url}
                      alt={listing.seller.fullName}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                      {listing.seller.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {listing.seller.fullName}
                </h3>

                {listing.seller.isFullyVerified && (
                  <div className="flex items-center justify-center gap-1 text-success mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Profil vérifié</span>
                  </div>
                )}

                {listing.seller.rating.count > 0 && (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{listing.seller.rating.average.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">
                      ({listing.seller.rating.count} avis)
                    </span>
                  </div>
                )}

                <div className="text-sm text-gray-600 mb-4">
                  <Package className="w-4 h-4 inline mr-1" />
                  {listing.seller.activeListings} annonce{listing.seller.activeListings > 1 && 's'} active{listing.seller.activeListings > 1 && 's'}
                </div>

                <div className="text-xs text-gray-500">
                  Membre depuis {formatRelativeTime(listing.seller.memberSince)}
                </div>
              </div>

              {!isOwner ? (
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleContact}
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Contacter
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => setShowPhone(!showPhone)}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {showPhone ? formatPhoneNumber(listing.seller.phone) : 'Voir le numéro'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to={`/listings/edit/${listing._id}`} className="block">
                    <Button variant="primary" size="lg" fullWidth>
                      Modifier l'annonce
                    </Button>
                  </Link>

                  <Button variant="outline" size="lg" fullWidth>
                    Voir les statistiques
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
