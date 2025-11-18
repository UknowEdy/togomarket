import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock, Eye } from 'lucide-react';
import type { Listing } from '@/types';
import { formatPrice, formatRelativeTime } from '@/utils/helpers';
import { Badge } from './Badge';
import { Card } from './Card';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const primaryImage = listing.images.find(img => img.isPrimary) || listing.images[0];

  return (
    <Link to={`/listing/${listing._id}`}>
      <Card padding={false} hover className="overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-200">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Pas d'image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {listing.isUrgent && (
              <Badge variant="danger" size="sm">URGENT</Badge>
            )}
            {listing.isFeatured && (
              <Badge variant="warning" size="sm">⭐ VEDETTE</Badge>
            )}
          </div>

          {/* Favori */}
          <button className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-3">
          {/* Titre */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {listing.title}
          </h3>

          {/* Prix */}
          <div className="mb-2">
            {listing.isFree ? (
              <span className="text-lg font-bold text-primary">Gratuit</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(listing.price)}
                </span>
                {listing.isNegotiable && (
                  <span className="text-xs text-gray-500">(Négociable)</span>
                )}
              </div>
            )}
          </div>

          {/* Localisation */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{listing.location.city}</span>
            {listing.location.district && (
              <span className="text-gray-400">• {listing.location.district}</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(listing.createdAt)}</span>
            </div>

            {listing.seller?.isFullyVerified && (
              <Badge variant="success" size="sm">✓ Vérifié</Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
