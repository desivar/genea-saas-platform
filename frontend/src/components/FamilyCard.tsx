// src/components/FamilyCard.tsx
import React from 'react';
import { HERITAGE_STICKERS } from '../constants/stickers';

// 1. Move the interface to the top level for proper TypeScript scoping
export interface FamilyCardProps {
  member: {
    name: string;
    birthYear?: string | number;
    deathYear?: string | number;
    photoUrl?: string;
    heritage?: string;
    quickFact?: string;
    gender?: 'Male' | 'Female' | 'Unknown';
    isPrivate?: boolean;
    generation?: number;
  };
  onClick?: () => void;
}

export default function FamilyCard({ member, onClick }: FamilyCardProps) {
  // 2. Look up the sticker configuration based on the person's heritage key safely
  const sticker = member.heritage ? HERITAGE_STICKERS[member.heritage] : null;

  // 3. Resolve the conditional background colors based on gender
  const cardBg = {
    Male: 'bg-blue-50/30 hover:bg-blue-50/50 border-blue-100',
    Female: 'bg-rose-50/30 hover:bg-rose-50/50 border-rose-100',
    Unknown: 'bg-white hover:bg-stone-50 border-stone-200'
  }[member.gender ?? 'Unknown'];

  // 4. Evaluate lifecycle and privacy conditions
  const isLiving = !member.deathYear;
  const displayName = isLiving && member.isPrivate ? 'Living Person 🔒' : member.name;

  return (
    <div 
      onClick={onClick} 
      className={`relative w-64 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer ${cardBg}`}
    >
      {/* 🏷️ Generation Pill Badge */}
      {member.generation !== undefined && (
        <div className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-medium bg-stone-100 border border-stone-200 rounded-full text-stone-500 z-10 shadow-sm">
          Gen {member.generation}
        </div>
      )}
      
      {/* 🎨 Dynamic Heritage Sticker (Wax-seal style) */}
      {sticker && (
        <div className={`absolute -top-3 -right-2 px-2.5 py-1 text-xs font-medium rounded-full border shadow-sm flex items-center gap-1.5 transform group-hover:scale-105 transition-transform ${sticker.style || 'bg-stone-100 text-stone-700'}`}>
          <span>{sticker.icon}</span>
          <span>{sticker.label}</span>
        </div>
      )}

      {/* Profile Details */}
      <div className="flex items-center gap-4 mt-1">
        {/* Photo Placeholder / Image Renderer */}
        <div className="w-14 h-14 bg-stone-100 rounded-full flex-shrink-0 border border-stone-200 flex items-center justify-center text-xl overflow-hidden shadow-inner">
          {member.photoUrl && !(isLiving && member.isPrivate) ? (
            <img 
              src={member.photoUrl} 
              alt={displayName} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <span className="opacity-60">{member.gender === 'Female' ? '👩‍🦳' : '👨‍🦳'}</span>
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-stone-800 font-semibold text-sm truncate group-hover:text-stone-900">
            {displayName}
          </h4>
          <p className="text-stone-500 text-xs mt-0.5 font-mono tracking-tight">
            {member.birthYear || '????'} — {member.deathYear || (isLiving && member.isPrivate ? 'Private' : 'Present')}
          </p>
        </div>
      </div>
      
      {/* Optional: Tiny highlight snippet for facts/stories */}
      {member.quickFact && !(isLiving && member.isPrivate) && (
        <div className="mt-3 pt-2.5 border-t border-stone-100 text-stone-600 text-xs italic line-clamp-2 leading-relaxed">
          "{member.quickFact}"
        </div>
      )}
    </div>
  );
}