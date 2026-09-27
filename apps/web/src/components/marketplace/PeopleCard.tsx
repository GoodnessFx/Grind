import React from 'react';
import { Star, MapPin, MessageCircle } from 'lucide-react';
import { Person } from '../../data/listings';
import { Link } from 'react-router-dom';

const socialLabel: Record<string, string> = {
  x: 'X',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
};

export const PeopleCard: React.FC<{ person: Person }> = ({ person }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg transition-shadow flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <img
          src={person.avatar}
          alt={person.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-[var(--grind-nigeria)]/20"
        />
        <div className="min-w-0">
          <h4 className="font-bold text-[var(--grind-primary)] truncate">{person.name}</h4>
          <p className="text-xs text-gray-500 truncate">{person.role}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-yellow-500 shrink-0">
          <Star size={13} fill="currentColor" />
          <span className="text-xs font-semibold text-gray-600">{person.rating}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <MapPin size={12} className="text-[var(--grind-nigeria)] shrink-0" />
        <span className="truncate">{person.university}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(person.socials).map(([key, url]) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 hover:bg-[var(--grind-nigeria)] hover:text-white text-gray-700 transition-colors"
            title={`Connect on ${socialLabel[key] ?? key}`}
          >
            {socialLabel[key] ?? key}
          </a>
        ))}
      </div>

      <Link
        to="/campus"
        className="mt-auto flex items-center justify-center gap-2 bg-black hover:bg-[var(--grind-nigeria)] text-white text-sm font-bold py-2.5 rounded-full transition-colors"
      >
        <MessageCircle size={15} /> Connect with {person.name.split(' ')[0]}
      </Link>
    </div>
  );
};
