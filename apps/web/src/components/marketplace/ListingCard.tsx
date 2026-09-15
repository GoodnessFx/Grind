import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ListingCardProps {
  id: string;
  title: string;
  price: string;
  sellerName: string;
  sellerBadge: 'gold' | 'silver' | 'bronze' | 'platinum';
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  sellerName,
  sellerBadge,
  rating,
  reviewCount,
  imageUrl
}) => {
  return (
    <Link to={`/listing/${id}`} className="block">
      <Card className="h-full flex flex-col group">
        <div className="relative overflow-hidden">
          <Card.Image src={imageUrl} alt={title} className="group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant={sellerBadge} size="sm">{sellerBadge.charAt(0).toUpperCase() + sellerBadge.slice(1)} Seller</Badge>
          </div>
        </div>
        
        <Card.Body className="flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-[var(--color-text-primary)] line-clamp-2 mb-1">{title}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">by {sellerName}</p>
          <div className="mt-auto">
            <p className="font-bold text-lg">{price}</p>
          </div>
        </Card.Body>
        
        <Card.Footer className="bg-white border-t border-[var(--color-border)] py-3">
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-gray-500">({reviewCount})</span>
          </div>
        </Card.Footer>
      </Card>
    </Link>
  );
};
