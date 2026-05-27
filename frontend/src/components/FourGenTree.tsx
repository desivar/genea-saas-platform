// src/components/FourGenTree.jsx
import React from 'react';
import FamilyCard from './FamilyCard';

export default function FourGenTree({ familyData }) {
  // Filter your raw database array into generational columns
  const gen1 = familyData.filter(m => m.generation === 1); // Great-Grandparents
  const gen2 = familyData.filter(m => m.generation === 2); // Grandparents
  const gen3 = familyData.filter(m => m.generation === 3); // Parents
  const gen4 = familyData.filter(m => m.generation === 4); // Children

  return (
    <div className="w-full min-h-125 bg-stone-50 p-8 rounded-3xl border border-stone-200/60 overflow-x-auto">
      {/* 4-Column Grid Layout */}
      <div className="grid grid-cols-4 gap-x-12 min-w-[1100px] h-full items-center">
        
        {/* Generation 1: Roots */}
        <div className="flex flex-col gap-8 justify-center h-full">
          <div className="text-xs uppercase tracking-wider font-bold text-stone-400 mb-2 px-2">1st Gen (Roots)</div>
          {gen1.map(person => <FamilyCard key={person.id} member={person} />)}
        </div>

        {/* Generation 2: Grandparents */}
        <div className="flex flex-col gap-8 justify-center h-full border-l border-stone-200/60 pl-6">
          <div className="text-xs uppercase tracking-wider font-bold text-stone-400 mb-2 px-2">2nd Gen</div>
          {gen2.map(person => <FamilyCard key={person.id} member={person} />)}
        </div>

        {/* Generation 3: Parents */}
        <div className="flex flex-col gap-8 justify-center h-full border-l border-stone-200/60 pl-6">
          <div className="text-xs uppercase tracking-wider font-bold text-stone-400 mb-2 px-2">3rd Gen</div>
          {gen3.map(person => <FamilyCard key={person.id} member={person} />)}
        </div>

        {/* Generation 4: Present */}
        <div className="flex flex-col gap-8 justify-center h-full border-l border-stone-200/60 pl-6">
          <div className="text-xs uppercase tracking-wider font-bold text-stone-400 mb-2 px-2">4th Gen (Present)</div>
          {gen4.map(person => <FamilyCard key={person.id} member={person} />)}
        </div>

      </div>
    </div>
  );
}