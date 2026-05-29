import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HERITAGE_STICKERS } from '../constants/stickers';
import { ChicagoFormatter } from '../utils/citationFormatter';
// Add import at top:
import { FullPedigreeTree, FourGenTree } from '../components/slides/TreeSlides';
import CitationModal from '../components/CitationModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type SlideType =
  | 'cover' | 'person' | 'timeline' | 'heritage'
  | 'facts' | 'photo' | 'citations' | 'closing'
  | 'pedigree' | 'founding' | 'familyunit' | 'fourgen';

type PaletteKey = 'cream' | 'sage' | 'rose' | 'slate' | 'lavender';
type FontKey = 'playfair' | 'cormorant' | 'lora' | 'merriweather' | 'cinzel' | 'crimson' | 'libre' | 'spectral';
type PanelKey = 'slides' | 'style' | 'add';

interface ISlideCitation {
  id: string;
  type: string;
  params: any;
  footnoteText: string;
  shortCite: string;
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface PersonData {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
  heritage: string;
  bio: string;
  photoUrl: string;
  generation: string;
}

interface SlideData {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  body?: string;
  person?: PersonData;
  timelineEvents?: TimelineEvent[];
  facts?: { label: string; value: string }[];
  citations?: ISlideCitation[];
  imageUrl?: string;
  heritageKey?: string;
}

interface IFamilyMember {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: string;
  heritage?: string;
  generation?: number;
  photoUrl?: string;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
  childrenIds?: string[];
  notes?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTES: Record<PaletteKey, {
  name: string; bg: string; card: string; accent: string;
  text: string; muted: string; border: string;
}> = {
  cream: { name: '📜 Cream', bg: '#faf6ef', card: '#ffffff', accent: '#8b5e3c', text: '#2c1810', muted: '#9c8573', border: '#e8ddd0' },
  sage:  { name: '🌿 Sage',  bg: '#f4f6f2', card: '#ffffff', accent: '#4a6741', text: '#1e2b1c', muted: '#7a9175', border: '#d4ddd0' },
  rose:  { name: '🌸 Rose',  bg: '#fdf4f5', card: '#ffffff', accent: '#9b4f6a', text: '#2c1018', muted: '#b87a90', border: '#edd5dd' },
  slate: { name: '🌑 Slate', bg: '#1e2330', card: '#252d3d', accent: '#c9a84c', text: '#f0ece4', muted: '#8a9bb5', border: '#2e3a50' },
  lavender: { name: '💜 Lavender', bg: '#f4f2fb', card: '#ffffff', accent: '#6b5b9e', text: '#1e1a2e', muted: '#9b8fc0', border: '#ddd8f0' },
};

const FONTS: Record<FontKey, { name: string; family: string; url: string }> = {
  playfair:    { name: 'Playfair Display',    family: "'Playfair Display', serif",    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
  cormorant:   { name: 'Cormorant Garamond',  family: "'Cormorant Garamond', serif",  url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap' },
  lora:        { name: 'Lora',                family: "'Lora', serif",                url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap' },
  merriweather:{ name: 'Merriweather',        family: "'Merriweather', serif",        url: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,700;1,300&display=swap' },
  cinzel:      { name: 'Cinzel',              family: "'Cinzel', serif",              url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap' },
  crimson:     { name: 'Crimson Text',        family: "'Crimson Text', serif",        url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap' },
  libre:       { name: 'Libre Baskerville',   family: "'Libre Baskerville', serif",   url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap' },
  spectral:    { name: 'Spectral',            family: "'Spectral', serif",            url: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,600;1,300&display=swap' },
};

const SLIDE_TEMPLATES = [
  // Presentation slides
  { type: 'cover' as SlideType,    icon: '📖', label: 'Cover',          group: 'Presentation', desc: 'Title slide with family name and dates' },
  { type: 'person' as SlideType,   icon: '👤', label: 'Person Profile', group: 'Presentation', desc: 'Full profile with bio, dates and photo' },
  { type: 'timeline' as SlideType, icon: '📅', label: 'Timeline',       group: 'Presentation', desc: 'Historical events and milestones' },
  { type: 'heritage' as SlideType, icon: '🌍', label: 'Heritage',       group: 'Presentation', desc: 'Country of origin with sticker' },
  { type: 'facts' as SlideType,    icon: '📊', label: 'Facts & Stats',  group: 'Presentation', desc: 'Key numbers and data points' },
  { type: 'photo' as SlideType,    icon: '📸', label: 'Photo & Story',  group: 'Presentation', desc: 'Image with narrative text' },
  { type: 'citations' as SlideType,icon: '📚', label: 'Citations',      group: 'Presentation', desc: 'Chicago-style bibliography' },
  { type: 'closing' as SlideType,  icon: '🎬', label: 'Closing',        group: 'Presentation', desc: 'Final slide with contact info' },
  // Tree slides
  { type: 'pedigree' as SlideType,   icon: '🌳', label: 'Full Pedigree',    group: 'Family Trees', desc: 'All ancestors top to bottom — names and dates' },
  { type: 'founding' as SlideType,   icon: '👫', label: 'Founding Couple',  group: 'Family Trees', desc: 'First couple → all descendants to present' },
  { type: 'familyunit' as SlideType, icon: '👨‍👩‍👧‍👦', label: 'Family Unit',     group: 'Family Trees', desc: 'Person + spouse + children + siblings' },
  { type: 'fourgen' as SlideType,    icon: '📸', label: '4 Generations',    group: 'Family Trees', desc: '4 generations with names, dates and photos' },
];

const createSlide = (type: SlideType): SlideData => {
  const id = `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  switch (type) {
    case 'cover':    return { id, type, title: 'Family Chronicles', subtitle: 'A Journey Through Generations', body: 'Established 1780 — Present Day', citations: [] };
    case 'person':   return { id, type, title: 'Person Profile', person: { firstName: '', lastName: '', birthDate: '', birthPlace: '', deathDate: '', deathPlace: '', heritage: '', bio: '', photoUrl: '', generation: '' }, citations: [] };
    case 'timeline': return { id, type, title: 'Family Timeline', timelineEvents: [{ year: '1780', title: 'Event', description: '' }, { year: '1850', title: 'Event', description: '' }], citations: [] };
    case 'heritage': return { id, type, title: 'Heritage & Origins', subtitle: 'Where we come from', heritageKey: 'honduras', body: '', citations: [] };
    case 'facts':    return { id, type, title: 'Legacy by the Numbers', facts: [{ label: 'Generations', value: '7' }, { label: 'Countries', value: '4' }, { label: 'Years of History', value: '240+' }, { label: 'Family Members', value: '120+' }], citations: [] };
    case 'photo':    return { id, type, title: 'Our Story', body: '', imageUrl: '', citations: [] };
    case 'citations':return { id, type, title: 'Sources & Citations', citations: [] };
    case 'closing':  return { id, type, title: 'Preserving the Future', subtitle: 'Join us in mapping the next chapter', body: '' };
    case 'pedigree': return { id, type, title: 'Full Family Pedigree', subtitle: 'From earliest ancestor to present day', citations: [] };
    case 'founding': return { id, type, title: 'The Founding Family', subtitle: 'From one couple, a legacy was born', citations: [] };
    case 'familyunit':return { id, type, title: 'Family Unit', citations: [] };
    case 'fourgen':  return { id, type, title: 'Four Generations', citations: [] };
    default:         return { id, type, title: 'New Slide', citations: [] };
  }
};

// ─── Editable Field ───────────────────────────────────────────────────────────

function EditField({ value, onChange, style, placeholder, multiline, isEditing, f }: {
  value: string; onChange: (v: string) => void;
  style: React.CSSProperties; placeholder: string;
  multiline?: boolean; isEditing: boolean; f: string;
}) {
  if (!isEditing) return <span style={style}>{value || <span style={{ opacity: 0.35 }}>{placeholder}</span>}</span>;
  const base: React.CSSProperties = { ...style, background: 'transparent', border: '1px dashed rgba(128,128,128,0.3)', borderRadius: '4px', outline: 'none', fontFamily: f, padding: '2px 6px', width: '100%', boxSizing: 'border-box' as const };
  if (multiline) return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, resize: 'vertical', minHeight: '80px' }} />;
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />;
}

// ─── Footnotes ────────────────────────────────────────────────────────────────

function Footnotes({ citations, p, f }: { citations?: ISlideCitation[]; p: typeof PALETTES[PaletteKey]; f: string }) {
  if (!citations || citations.length === 0) return null;
  return (
    <div style={{
      borderTop: `1px solid ${p.border}`,
      padding: '8px 32px',
      backgroundColor: p.card,
      flexShrink: 0,
    }}>
      {citations.map((c, i) => (
        <div key={c.id} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}>
          <sup style={{ color: p.accent, fontWeight: '700', fontSize: '9px', lineHeight: '16px', flexShrink: 0 }}>{i + 1}</sup>
          <p style={{ fontSize: '9px', color: p.muted, margin: 0, fontStyle: 'italic', lineHeight: '1.5', fontFamily: f }}>
            {c.footnoteText}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Tree Slides ──────────────────────────────────────────────────────────────

function PedigreeSlide({ slide, members, p, f, isEditing, onUpdate }: {
  slide: SlideData; members: IFamilyMember[];
  p: typeof PALETTES[PaletteKey]; f: string;
  isEditing: boolean; onUpdate: (s: SlideData) => void;
}) {
  const sorted = [...members].sort((a, b) => (a.generation || 1) - (b.generation || 1));
  const maxGen = Math.max(...members.map(m => m.generation || 1), 1);
  const generations = Array.from({ length: maxGen }, (_, i) =>
    sorted.filter(m => (m.generation || 1) === i + 1)
  );

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: p.bg, fontFamily: f, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 32px 12px', borderBottom: `2px solid ${p.accent}` }}>
        <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '28px', fontWeight: '700', color: p.text }} placeholder="Full Family Pedigree" isEditing={isEditing} f={f} />
        <EditField value={slide.subtitle || ''} onChange={v => onUpdate({ ...slide, subtitle: v })} style={{ fontSize: '14px', color: p.muted, fontStyle: 'italic', marginTop: '4px', display: 'block' }} placeholder="From earliest ancestor to present day" isEditing={isEditing} f={f} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px' }}>
        {members.length === 0 ? (
          <div style={{ textAlign: 'center', color: p.muted, fontSize: '14px', marginTop: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌳</div>
            Add family members in the People section to display the pedigree tree
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {generations.map((gen, gi) => (
              <div key={gi}>
                <div style={{ fontSize: '9px', color: p.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px', fontWeight: '700' }}>
                  Generation {gi + 1} {gi === 0 ? '— Earliest Known' : gi === maxGen - 1 ? '— Present' : ''}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {gen.map(member => (
                    <div key={member._id} style={{
                      padding: '6px 12px', borderRadius: '6px',
                      border: `1px solid ${p.border}`,
                      backgroundColor: p.card,
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {member.heritage && HERITAGE_STICKERS[member.heritage] && (
                        <span style={{ fontSize: '14px' }}>{HERITAGE_STICKERS[member.heritage].icon}</span>
                      )}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: p.text }}>
                          {member.firstName} {member.lastName}
                        </div>
                        <div style={{ fontSize: '10px', color: p.muted }}>
                          {member.birthDate || '?'} — {member.deathDate || 'Present'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footnotes citations={slide.citations} p={p} f={f} />
    </div>
  );
}

function FoundingCoupleSlide({ slide, members, p, f, isEditing, onUpdate }: {
  slide: SlideData; members: IFamilyMember[];
  p: typeof PALETTES[PaletteKey]; f: string;
  isEditing: boolean; onUpdate: (s: SlideData) => void;
}) {
  const gen1 = members.filter(m => (m.generation || 1) === 1);
  const maxGen = Math.max(...members.map(m => m.generation || 1), 1);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: p.bg, fontFamily: f, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', position: 'relative' }}>
        <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '32px', fontWeight: '700', color: p.text, display: 'block', marginBottom: '8px' }} placeholder="The Founding Family" isEditing={isEditing} f={f} />
        <EditField value={slide.subtitle || ''} onChange={v => onUpdate({ ...slide, subtitle: v })} style={{ fontSize: '16px', color: p.muted, fontStyle: 'italic', display: 'block', marginBottom: '32px' }} placeholder="From one couple, a legacy was born" isEditing={isEditing} f={f} />

        {members.length === 0 ? (
          <div style={{ color: p.muted, fontSize: '13px' }}>Add family members to display the founding couple</div>
        ) : (
          <>
            {/* Founding couple */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              {gen1.map((m, i) => (
                <React.Fragment key={m._id}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: p.border, border: `2px solid ${p.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', overflow: 'hidden' }}>
                      {m.photoUrl ? <img src={m.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: '24px' }}>👤</span>}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: p.text }}>{m.firstName} {m.lastName}</div>
                    <div style={{ fontSize: '10px', color: p.muted }}>{m.birthDate || '?'} — {m.deathDate || 'Present'}</div>
                  </div>
                  {i === 0 && gen1.length > 1 && <div style={{ fontSize: '20px', color: p.accent }}>♥</div>}
                </React.Fragment>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px' }}>
              {[
                { value: String(maxGen), label: 'Generations' },
                { value: String(members.length), label: 'Descendants' },
                { value: gen1[0]?.birthDate?.slice(0, 4) || '?', label: 'Since' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '12px 20px', backgroundColor: p.card, borderRadius: '10px', border: `1px solid ${p.border}` }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: p.accent }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: p.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footnotes citations={slide.citations} p={p} f={f} />
    </div>
  );
}

function FamilyUnitSlide({ slide, members, p, f, isEditing, onUpdate }: {
  slide: SlideData; members: IFamilyMember[];
  p: typeof PALETTES[PaletteKey]; f: string;
  isEditing: boolean; onUpdate: (s: SlideData) => void;
}) {
  // Find a "featured" generation — middle generation
  const maxGen = Math.max(...members.map(m => m.generation || 1), 1);
  const midGen = Math.ceil(maxGen / 2);
  const parents = members.filter(m => (m.generation || 1) === midGen);
  const children = members.filter(m => (m.generation || 1) === midGen + 1);
  const grandparents = members.filter(m => (m.generation || 1) === midGen - 1);

  const MemberCard = ({ m, size = 'md' }: { m: IFamilyMember; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = { sm: { photo: 40, name: 11, date: 9 }, md: { photo: 56, name: 13, date: 10 }, lg: { photo: 72, name: 15, date: 11 } };
    const s = sizes[size];
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: s.photo, height: s.photo, borderRadius: '50%', backgroundColor: p.border, border: `2px solid ${p.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', overflow: 'hidden' }}>
          {m.photoUrl ? <img src={m.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span>{m.gender === 'Female' ? '👩' : '👨'}</span>}
        </div>
        <div style={{ fontSize: s.name, fontWeight: '600', color: p.text }}>{m.firstName} {m.lastName}</div>
        <div style={{ fontSize: s.date, color: p.muted }}>{m.birthDate || '?'} — {m.deathDate || 'Present'}</div>
        {m.heritage && HERITAGE_STICKERS[m.heritage] && <div style={{ fontSize: '12px', marginTop: '2px' }}>{HERITAGE_STICKERS[m.heritage].icon}</div>}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: p.bg, fontFamily: f, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 32px 10px', borderBottom: `2px solid ${p.accent}` }}>
        <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '26px', fontWeight: '700', color: p.text }} placeholder="Family Unit" isEditing={isEditing} f={f} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {members.length === 0 ? (
          <div style={{ textAlign: 'center', color: p.muted, fontSize: '13px', marginTop: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍👩‍👧‍👦</div>
            Add family members to display the family unit
          </div>
        ) : (
          <>
            {grandparents.length > 0 && (
              <div>
                <div style={{ fontSize: '9px', color: p.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Grandparents</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {grandparents.map(m => <MemberCard key={m._id} m={m} size="sm" />)}
                </div>
              </div>
            )}
            {parents.length > 0 && (
              <div>
                <div style={{ fontSize: '9px', color: p.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Parents</div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {parents.map(m => <MemberCard key={m._id} m={m} size="lg" />)}
                </div>
              </div>
            )}
            {children.length > 0 && (
              <div>
                <div style={{ fontSize: '9px', color: p.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Children</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {children.map(m => <MemberCard key={m._id} m={m} size="md" />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footnotes citations={slide.citations} p={p} f={f} />
    </div>
  );
}

function FourGenSlide({ slide, members, p, f, isEditing, onUpdate }: {
  slide: SlideData; members: IFamilyMember[];
  p: typeof PALETTES[PaletteKey]; f: string;
  isEditing: boolean; onUpdate: (s: SlideData) => void;
}) {
  const gens = [1, 2, 3, 4].map(g => members.filter(m => (m.generation || 1) === g));
  const genLabels = ['Great-Grandparents', 'Grandparents', 'Parents', 'Children'];

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: p.bg, fontFamily: f, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 32px 10px', borderBottom: `2px solid ${p.accent}` }}>
        <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '24px', fontWeight: '700', color: p.text }} placeholder="Four Generations" isEditing={isEditing} f={f} />
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {gens.map((gen, gi) => (
          <div key={gi} style={{
            flex: 1, borderRight: gi < 3 ? `1px solid ${p.border}` : 'none',
            padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto'
          }}>
            <div style={{ fontSize: '8px', color: p.accent, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', marginBottom: '4px' }}>
              {genLabels[gi]}
            </div>
            {gen.length === 0 ? (
              <div style={{ fontSize: '10px', color: p.muted, fontStyle: 'italic' }}>No members</div>
            ) : gen.map(m => (
              <div key={m._id} style={{ backgroundColor: p.card, borderRadius: '8px', padding: '8px', border: `1px solid ${p.border}` }}>
                {m.photoUrl && (
                  <img src={m.photoUrl} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }} alt="" />
                )}
                {!m.photoUrl && (
                  <div style={{ width: '100%', height: '48px', backgroundColor: p.border, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', fontSize: '20px' }}>
                    {m.gender === 'Female' ? '👩' : '👨'}
                  </div>
                )}
                {m.heritage && HERITAGE_STICKERS[m.heritage] && (
                  <div style={{ fontSize: '12px', marginBottom: '2px' }}>{HERITAGE_STICKERS[m.heritage].icon}</div>
                )}
                <div style={{ fontSize: '11px', fontWeight: '600', color: p.text }}>{m.firstName} {m.lastName}</div>
                <div style={{ fontSize: '9px', color: p.muted }}>{m.birthDate || '?'} — {m.deathDate || 'Present'}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Footnotes citations={slide.citations} p={p} f={f} />
    </div>
  );
}

// ─── Slide Canvas ─────────────────────────────────────────────────────────────

function SlideCanvas({ slide, members, p, f, isEditing, onUpdate, onCite }: {
  slide: SlideData; members: IFamilyMember[];
  p: typeof PALETTES[PaletteKey]; f: typeof FONTS[FontKey];
  isEditing: boolean; onUpdate: (s: SlideData) => void; onCite: (s: SlideData) => void;
}) {
  const ff = f.family;
  const hasCitations = (slide.citations?.length || 0) > 0;
  const needsCite = !['citations', 'closing'].includes(slide.type);

  const base: React.CSSProperties = {
    width: '100%', height: '100%', backgroundColor: p.bg,
    fontFamily: ff, color: p.text, position: 'relative',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  };

  const CiteButton = () => !needsCite ? null : (
    <button
      onClick={() => onCite(slide)}
      style={{
        position: 'absolute', bottom: hasCitations ? `${(slide.citations!.length * 18) + 20}px` : '12px',
        right: '12px', padding: '3px 10px',
        background: 'transparent', border: `1px dashed ${p.accent}60`,
        color: p.accent, borderRadius: '4px', cursor: 'pointer',
        fontSize: '10px', fontFamily: ff, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '4px'
      }}
    >
      📚 {hasCitations ? `${slide.citations!.length} source${slide.citations!.length > 1 ? 's' : ''}` : '+ Cite'}
    </button>
  );

  
  // Replace the tree slides section:
if (slide.type === 'pedigree') {
  return (
    <div style={{ ...base, flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px 10px', borderBottom: `2px solid ${p.accent}`, flexShrink: 0, backgroundColor: p.bg }}>
        <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '22px', fontWeight: '700', color: p.text }} placeholder="Full Family Pedigree" isEditing={isEditing} f={ff} />
        <EditField value={slide.subtitle || ''} onChange={v => onUpdate({ ...slide, subtitle: v })} style={{ fontSize: '12px', color: p.muted, fontStyle: 'italic', marginTop: '2px', display: 'block' }} placeholder="From earliest ancestor to present day" isEditing={isEditing} f={ff} />
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <FullPedigreeTree members={members} palette={p} font={ff} />
      </div>
      {isEditing && <CiteButton />}
      <Footnotes citations={slide.citations} p={p} f={ff} />
    </div>
  );
}

if (slide.type === 'fourgen') {
  return (
    <div style={{ ...base, flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px 10px', borderBottom: `2px solid ${p.accent}`, flexShrink: 0, backgroundColor: p.bg }}>
        <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '22px', fontWeight: '700', color: p.text }} placeholder="Four Generations" isEditing={isEditing} f={ff} />
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <FourGenTreeFlow members={members} palette={p} font={ff} />
      </div>
      {isEditing && <CiteButton />}
      <Footnotes citations={slide.citations} p={p} f={ff} />
    </div>
  );
}

if (slide.type === 'founding')   return <FoundingCoupleSlide slide={slide} members={members} p={p} f={ff} isEditing={isEditing} onUpdate={onUpdate} />;
if (slide.type === 'familyunit') return <FamilyUnitSlide     slide={slide} members={members} p={p} f={ff} isEditing={isEditing} onUpdate={onUpdate} />;

  // ── Cover ──
  if (slide.type === 'cover') {
    return (
      <div style={base}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px', padding: '48px' }}>
          <div style={{ width: '48px', height: '2px', backgroundColor: p.accent }} />
          <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '52px', fontWeight: '700', color: p.text, letterSpacing: '-1px', lineHeight: '1.1' }} placeholder="Family Chronicles" isEditing={isEditing} f={ff} />
          <EditField value={slide.subtitle || ''} onChange={v => onUpdate({ ...slide, subtitle: v })} style={{ fontSize: '20px', color: p.muted, fontStyle: 'italic' }} placeholder="A Journey Through Generations" isEditing={isEditing} f={ff} />
          <div style={{ width: '32px', height: '1px', backgroundColor: p.border }} />
          <EditField value={slide.body || ''} onChange={v => onUpdate({ ...slide, body: v })} style={{ fontSize: '12px', color: p.muted, letterSpacing: '3px', textTransform: 'uppercase' as const }} placeholder="Established 1780 — Present Day" isEditing={isEditing} f={ff} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        {isEditing && <CiteButton />}
      </div>
    );
  }

  // ── Person Profile ──
  if (slide.type === 'person') {
    const person = slide.person!;
    return (
      <div style={base}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: p.accent }} />
        <div style={{ flex: 1, display: 'flex', gap: '32px', padding: '32px 32px 0 40px', overflow: 'hidden' }}>
          <div style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '140px', height: '170px', backgroundColor: p.border, borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${p.border}` }}>
              {person.photoUrl ? <img src={person.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>📷</div>
                  {isEditing && <input type="text" placeholder="Photo URL" value={person.photoUrl} onChange={e => onUpdate({ ...slide, person: { ...person, photoUrl: e.target.value } })} style={{ fontSize: '9px', background: 'transparent', border: `1px dashed ${p.accent}40`, borderRadius: '4px', padding: '2px 4px', color: p.muted, width: '120px', fontFamily: ff }} />}
                </div>
              )}
            </div>
            {person.heritage && HERITAGE_STICKERS[person.heritage] && (
              <div style={{ padding: '4px 10px', borderRadius: '16px', backgroundColor: p.border, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: p.accent }}>
                <span>{HERITAGE_STICKERS[person.heritage].icon}</span>
                <span>{HERITAGE_STICKERS[person.heritage].label}</span>
              </div>
            )}
            {isEditing && (
              <select value={person.heritage} onChange={e => onUpdate({ ...slide, person: { ...person, heritage: e.target.value } })} style={{ fontSize: '10px', padding: '3px', border: `1px solid ${p.border}`, borderRadius: '4px', background: p.card, color: p.text, fontFamily: ff }}>
                <option value="">Heritage...</option>
                {Object.entries(HERITAGE_STICKERS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
              <EditField value={person.firstName} onChange={v => onUpdate({ ...slide, person: { ...person, firstName: v } })} style={{ fontSize: '32px', fontWeight: '700', color: p.text }} placeholder="First Name" isEditing={isEditing} f={ff} />
              <EditField value={person.lastName} onChange={v => onUpdate({ ...slide, person: { ...person, lastName: v } })} style={{ fontSize: '32px', fontWeight: '300', color: p.accent }} placeholder="Last Name" isEditing={isEditing} f={ff} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Born', value: person.birthDate, key: 'birthDate' },
                { label: 'Birthplace', value: person.birthPlace, key: 'birthPlace' },
                { label: 'Died', value: person.deathDate, key: 'deathDate' },
                { label: 'Death Place', value: person.deathPlace, key: 'deathPlace' },
                { label: 'Generation', value: person.generation, key: 'generation' },
              ].map(({ label, value, key }) => (
                <div key={key} style={{ padding: '6px 8px', backgroundColor: `${p.border}50`, borderRadius: '5px' }}>
                  <div style={{ fontSize: '8px', color: p.muted, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
                  <EditField value={value} onChange={v => onUpdate({ ...slide, person: { ...person, [key]: v } })} style={{ fontSize: '12px', color: p.text, fontWeight: '500' }} placeholder={label} isEditing={isEditing} f={ff} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '8px', color: p.muted, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '4px' }}>Biography</div>
              <EditField value={person.bio} onChange={v => onUpdate({ ...slide, person: { ...person, bio: v } })} style={{ fontSize: '12px', color: p.text, lineHeight: '1.6' }} placeholder="Write a biography..." multiline isEditing={isEditing} f={ff} />
            </div>
          </div>
        </div>
        <Footnotes citations={slide.citations} p={p} f={ff} />
        {isEditing && <CiteButton />}
      </div>
    );
  }

  // ── Timeline ──
  if (slide.type === 'timeline') {
    const events = slide.timelineEvents || [];
    return (
      <div style={base}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        <div style={{ padding: '24px 32px 12px' }}>
          <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '28px', fontWeight: '700', color: p.text }} placeholder="Family Timeline" isEditing={isEditing} f={ff} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 12px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '52px', top: 0, bottom: 0, width: '2px', backgroundColor: p.border }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '52px', textAlign: 'right', flexShrink: 0, paddingTop: '4px' }}>
                  <EditField value={ev.year} onChange={v => { const e = [...events]; e[i] = { ...e[i], year: v }; onUpdate({ ...slide, timelineEvents: e }); }} style={{ fontSize: '13px', fontWeight: '700', color: p.accent }} placeholder="Year" isEditing={isEditing} f={ff} />
                </div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.accent, flexShrink: 0, marginTop: '5px' }} />
                <div style={{ flex: 1, padding: '6px 10px', backgroundColor: `${p.border}50`, borderRadius: '6px' }}>
                  <EditField value={ev.title} onChange={v => { const e = [...events]; e[i] = { ...e[i], title: v }; onUpdate({ ...slide, timelineEvents: e }); }} style={{ fontSize: '13px', fontWeight: '600', color: p.text, display: 'block', marginBottom: '2px' }} placeholder="Event title" isEditing={isEditing} f={ff} />
                  <EditField value={ev.description} onChange={v => { const e = [...events]; e[i] = { ...e[i], description: v }; onUpdate({ ...slide, timelineEvents: e }); }} style={{ fontSize: '11px', color: p.muted, lineHeight: '1.4' }} placeholder="Describe this event..." multiline isEditing={isEditing} f={ff} />
                </div>
                {isEditing && <button onClick={() => onUpdate({ ...slide, timelineEvents: events.filter((_, j) => j !== i) })} style={{ color: p.muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', paddingTop: '4px' }}>✕</button>}
              </div>
            ))}
          </div>
          {isEditing && (
            <button onClick={() => onUpdate({ ...slide, timelineEvents: [...events, { year: '', title: '', description: '' }] })} style={{ marginTop: '10px', padding: '4px 14px', backgroundColor: 'transparent', border: `1px dashed ${p.accent}`, borderRadius: '5px', color: p.accent, cursor: 'pointer', fontSize: '11px', fontFamily: ff }}>
              + Add Event
            </button>
          )}
        </div>
        <Footnotes citations={slide.citations} p={p} f={ff} />
        {isEditing && <CiteButton />}
      </div>
    );
  }

  // ── Heritage ──
  if (slide.type === 'heritage') {
    const sticker = slide.heritageKey ? HERITAGE_STICKERS[slide.heritageKey] : null;
    return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        {sticker && <div style={{ fontSize: '72px', marginBottom: '12px' }}>{sticker.icon}</div>}
        <div style={{ padding: '0 48px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '36px', fontWeight: '700', color: p.text }} placeholder="Heritage & Origins" isEditing={isEditing} f={ff} />
          <EditField value={slide.subtitle || ''} onChange={v => onUpdate({ ...slide, subtitle: v })} style={{ fontSize: '18px', color: p.muted, fontStyle: 'italic' }} placeholder="Where we come from" isEditing={isEditing} f={ff} />
          <EditField value={slide.body || ''} onChange={v => onUpdate({ ...slide, body: v })} style={{ fontSize: '14px', color: p.text, lineHeight: '1.7', maxWidth: '500px' }} placeholder="Write about this heritage..." multiline isEditing={isEditing} f={ff} />
          {isEditing && (
            <select value={slide.heritageKey || ''} onChange={e => onUpdate({ ...slide, heritageKey: e.target.value })} style={{ fontSize: '12px', padding: '5px 8px', border: `1px solid ${p.border}`, borderRadius: '6px', background: p.card, color: p.text, fontFamily: ff }}>
              <option value="">Select heritage...</option>
              {Object.entries(HERITAGE_STICKERS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          )}
        </div>
        <Footnotes citations={slide.citations} p={p} f={ff} />
        {isEditing && <CiteButton />}
      </div>
    );
  }

  // ── Facts ──
  if (slide.type === 'facts') {
    const facts = slide.facts || [];
    return (
      <div style={base}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: p.accent }} />
        <div style={{ padding: '24px 32px 12px 40px' }}>
          <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '28px', fontWeight: '700', color: p.text }} placeholder="Facts & Statistics" isEditing={isEditing} f={ff} />
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '0 40px 12px', overflowY: 'auto' }}>
          {facts.map((fact, i) => (
            <div key={i} style={{ backgroundColor: `${p.border}50`, borderRadius: '10px', padding: '16px 20px', position: 'relative' }}>
              <EditField value={fact.value} onChange={v => { const f2 = [...facts]; f2[i] = { ...f2[i], value: v }; onUpdate({ ...slide, facts: f2 }); }} style={{ fontSize: '36px', fontWeight: '700', color: p.accent, display: 'block' }} placeholder="0" isEditing={isEditing} f={ff} />
              <EditField value={fact.label} onChange={v => { const f2 = [...facts]; f2[i] = { ...f2[i], label: v }; onUpdate({ ...slide, facts: f2 }); }} style={{ fontSize: '12px', color: p.muted, textTransform: 'uppercase' as const, letterSpacing: '1px' }} placeholder="Label" isEditing={isEditing} f={ff} />
              {isEditing && <button onClick={() => onUpdate({ ...slide, facts: facts.filter((_, j) => j !== i) })} style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', color: p.muted, fontSize: '12px' }}>✕</button>}
            </div>
          ))}
          {isEditing && <button onClick={() => onUpdate({ ...slide, facts: [...facts, { label: 'New Fact', value: '0' }] })} style={{ backgroundColor: 'transparent', border: `1px dashed ${p.accent}`, borderRadius: '10px', padding: '16px', color: p.accent, cursor: 'pointer', fontSize: '20px', fontFamily: ff }}>+</button>}
        </div>
        <Footnotes citations={slide.citations} p={p} f={ff} />
        {isEditing && <CiteButton />}
      </div>
    );
  }

  // ── Photo ──
  if (slide.type === 'photo') {
    return (
      <div style={{ ...base, flexDirection: 'row' }}>
        <div style={{ width: '42%', backgroundColor: p.border, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          {slide.imageUrl ? <img src={slide.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '36px' }}>📸</span>
              {isEditing && <input type="text" placeholder="Image URL" value={slide.imageUrl || ''} onChange={e => onUpdate({ ...slide, imageUrl: e.target.value })} style={{ fontSize: '10px', padding: '4px 6px', border: `1px dashed ${p.accent}50`, borderRadius: '4px', background: 'transparent', color: p.muted, width: '80%', fontFamily: ff }} />}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px' }}>
          <div style={{ width: '32px', height: '3px', backgroundColor: p.accent }} />
          <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '28px', fontWeight: '700', color: p.text }} placeholder="Our Story" isEditing={isEditing} f={ff} />
          <EditField value={slide.body || ''} onChange={v => onUpdate({ ...slide, body: v })} style={{ fontSize: '13px', color: p.muted, lineHeight: '1.8' }} placeholder="Write your family story here..." multiline isEditing={isEditing} f={ff} />
        </div>
        <Footnotes citations={slide.citations} p={p} f={ff} />
        {isEditing && <CiteButton />}
      </div>
    );
  }

  // ── Citations ──
  if (slide.type === 'citations') {
    // Auto-collect all citations from all slides — passed via slide.citations
    return (
      <div style={base}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        <div style={{ padding: '24px 32px 12px' }}>
          <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '28px', fontWeight: '700', color: p.text }} placeholder="Sources & Citations" isEditing={isEditing} f={ff} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 12px' }}>
          {(!slide.citations || slide.citations.length === 0) ? (
            <p style={{ color: p.muted, fontSize: '13px', fontStyle: 'italic' }}>
              Citations from all slides will appear here automatically.
            </p>
          ) : slide.citations.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: p.accent, fontWeight: '700', fontSize: '13px', minWidth: '20px' }}>{i + 1}.</span>
              <div>
                <div style={{ fontSize: '9px', color: p.muted, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '2px' }}>{c.type}</div>
                <p style={{ fontSize: '12px', color: p.text, fontStyle: 'italic', lineHeight: '1.5', margin: 0, fontFamily: ff }}>{c.footnoteText}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Closing ──
  if (slide.type === 'closing') {
    return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        <EditField value={slide.title} onChange={v => onUpdate({ ...slide, title: v })} style={{ fontSize: '42px', fontWeight: '700', color: p.accent }} placeholder="Preserving the Future" isEditing={isEditing} f={ff} />
        <EditField value={slide.subtitle || ''} onChange={v => onUpdate({ ...slide, subtitle: v })} style={{ fontSize: '18px', color: p.muted, fontStyle: 'italic' }} placeholder="Join us in mapping the next chapter" isEditing={isEditing} f={ff} />
        <div style={{ width: '48px', height: '1px', backgroundColor: p.border }} />
        <EditField value={slide.body || ''} onChange={v => onUpdate({ ...slide, body: v })} style={{ fontSize: '13px', color: p.muted, lineHeight: '1.8', maxWidth: '480px' }} placeholder="Add contact info or closing message..." multiline isEditing={isEditing} f={ff} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
      </div>
    );
  }

  return <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '48px' }}>📄</span></div>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuilderPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [slides, setSlides] = useState<SlideData[]>([createSlide('cover')]);
  const [activeId, setActiveId] = useState<string>(slides[0].id);
  const [palette, setPalette] = useState<PaletteKey>('cream');
  const [font, setFont] = useState<FontKey>('playfair');
  const [isEditing, setIsEditing] = useState(true);
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);
  const [panel, setPanel] = useState<PanelKey>('slides');
  const [title, setTitle] = useState('My Family Presentation');
  const [isSaving, setIsSaving] = useState(false);
  const [citingSlide, setCitingSlide] = useState<SlideData | null>(null);
  const [members, setMembers] = useState<IFamilyMember[]>([]);
  const [treeId, setTreeId] = useState<string | null>(null);

  const p = PALETTES[palette];
  const f = FONTS[font];
  const activeSlide = slides.find(s => s.id === activeId) || slides[0];
  const token = localStorage.getItem('genea_token');

  // Load font
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = f.url;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [font]);

  // Load or create tree
  useEffect(() => {
    const saved = localStorage.getItem('genea_tree_id');
    if (saved) { setTreeId(saved); fetchMembers(saved); }
    else initTree();
  }, []);

  const initTree = async () => {
    try {
      const res = await fetch('http://localhost:5500/api/trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      setTreeId(data._id);
      localStorage.setItem('genea_tree_id', data._id);
      fetchMembers(data._id);
    } catch { console.error('Could not init tree'); }
  };

  const fetchMembers = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5500/api/trees/${id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch { console.error('Could not fetch members'); }
  };

  const updateSlide = (updated: SlideData) => {
    setSlides(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const addSlide = (type: SlideType) => {
    const s = createSlide(type);
    setSlides(prev => [...prev, s]);
    setActiveId(s.id);
    setPanel('slides');
  };

  const deleteSlide = (id: string) => {
    if (slides.length === 1) return;
    const idx = slides.findIndex(s => s.id === id);
    const next = slides.filter(s => s.id !== id);
    setSlides(next);
    setActiveId(next[Math.max(0, idx - 1)].id);
  };

  const moveSlide = (id: string, dir: 'up' | 'down') => {
    const idx = slides.findIndex(s => s.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === slides.length - 1) return;
    const next = [...slides];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setSlides(next);
  };

  const handleSaveCitations = (citations: ISlideCitation[]) => {
    if (!citingSlide) return;
    const updated = { ...citingSlide, citations };
    updateSlide(updated);
    // Sync to citations slide
    const citSlide = slides.find(s => s.type === 'citations');
    if (citSlide) {
      const all = slides
        .filter(s => s.id !== citingSlide.id && s.type !== 'citations')
        .flatMap(s => s.citations || [])
        .concat(citations);
      updateSlide({ ...citSlide, citations: all });
    }
    setCitingSlide(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('http://localhost:5500/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, slides, palette, font })
      });
    } catch { console.error('Could not save'); }
    finally { setIsSaving(false); }
  };

  // Keyboard navigation in present mode
  useEffect(() => {
    if (!isPresentMode) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setPresentIndex(i => Math.min(slides.length - 1, i + 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setPresentIndex(i => Math.max(0, i - 1));
      if (e.key === 'Escape') setIsPresentMode(false);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isPresentMode, slides.length]);

  // ── Present Mode ──
  if (isPresentMode) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '1200px', aspectRatio: '16/9', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
            <SlideCanvas slide={slides[presentIndex]} members={members} p={p} f={f} isEditing={false} onUpdate={() => {}} onCite={() => {}} />
          </div>
        </div>
        <div style={{ padding: '12px 24px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setIsPresentMode(false)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>✕ Exit (Esc)</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setPresentIndex(i => Math.max(0, i - 1))} disabled={presentIndex === 0} style={{ padding: '8px 20px', background: '#222', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>← Prev</button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setPresentIndex(i)} style={{ width: i === presentIndex ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === presentIndex ? '#fff' : '#555', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
              ))}
            </div>
            <button onClick={() => setPresentIndex(i => Math.min(slides.length - 1, i + 1))} disabled={presentIndex === slides.length - 1} style={{ padding: '8px 20px', background: '#222', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>Next →</button>
          </div>
          <span style={{ color: '#555', fontSize: '12px' }}>{presentIndex + 1} / {slides.length}</span>
        </div>
      </div>
    );
  }

  const groupedTemplates = ['Presentation', 'Family Trees'].map(group => ({
    group,
    items: SLIDE_TEMPLATES.filter(t => t.group === group)
  }));

  // ── Editor ──
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f4f0', fontFamily: f.family, overflow: 'hidden' }}>

      {/* ── Top Bar ── */}
      <div style={{ height: '52px', backgroundColor: '#1c1c28', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, borderBottom: '1px solid #2a2a3a' }}>

        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/')} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🌳 <span style={{ color: '#9b7fd4' }}>Genea</span>
          </button>
          <span style={{ color: '#333', fontSize: '16px' }}>›</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#d0ccc5', fontSize: '14px', fontFamily: f.family, width: '240px' }}
          />
        </div>

        {/* Center — People button */}
        <button
          onClick={() => navigate('/people')}
          style={{ padding: '6px 16px', background: treeId ? '#c9a84c22' : 'transparent', border: `1px solid ${treeId ? '#c9a84c' : '#444'}`, color: treeId ? '#c9a84c' : '#666', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          👨‍👩‍👧 People {members.length > 0 && <span style={{ backgroundColor: '#c9a84c', color: '#1c1c28', borderRadius: '10px', padding: '0px 6px', fontSize: '10px', fontWeight: '700' }}>{members.length}</span>}
        </button>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(e => !e)}
            style={{ padding: '5px 12px', background: isEditing ? '#c9a84c22' : 'transparent', border: `1px solid ${isEditing ? '#c9a84c80' : '#333'}`, color: isEditing ? '#c9a84c' : '#666', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}
          >
            {isEditing ? '✏️ Edit' : '👁 View'}
          </button>
          <button
            onClick={() => { setIsPresentMode(true); setPresentIndex(slides.findIndex(s => s.id === activeId)); }}
            style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #333', color: '#aaa', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}
          >
            🎬 Present
          </button>
          <button
            onClick={() => window.print()}
            style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #333', color: '#aaa', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}
          >
            🖨️ Print
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{ padding: '5px 14px', background: p.accent, border: 'none', color: '#fff', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
          <div style={{ width: '1px', height: '20px', background: '#333' }} />
          <span style={{ color: '#555', fontSize: '11px' }}>{user?.name}</span>
          <span style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: `${p.accent}22`, border: `1px solid ${p.accent}60`, borderRadius: '10px', color: p.accent }}>{user?.role}</span>
          <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #333', color: '#666', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Sidebar ── */}
        <div style={{ width: '180px', backgroundColor: '#16161f', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Slide list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            {slides.map((slide, i) => {
              const tmpl = SLIDE_TEMPLATES.find(t => t.type === slide.type);
              return (
                <div
                  key={slide.id}
                  onClick={() => setActiveId(slide.id)}
                  style={{
                    padding: '8px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px',
                    backgroundColor: slide.id === activeId ? `${p.accent}20` : 'transparent',
                    border: `1px solid ${slide.id === activeId ? p.accent + '60' : 'transparent'}`,
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{tmpl?.icon || '📄'}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '9px', color: '#555', marginBottom: '1px' }}>{String(i + 1).padStart(2, '0')}</div>
                    <div style={{ fontSize: '10px', color: '#bbb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.title || tmpl?.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Slide button */}
          <div style={{ padding: '8px', borderTop: '1px solid #222' }}>
            <button
              onClick={() => setPanel(panel === 'add' ? 'slides' : 'add')}
              style={{ width: '100%', padding: '8px', background: 'transparent', border: `1px dashed ${panel === 'add' ? p.accent : '#333'}`, borderRadius: '6px', color: panel === 'add' ? p.accent : '#555', cursor: 'pointer', fontSize: '11px', fontFamily: f.family }}
            >
              + Add Slide
            </button>
          </div>
        </div>

        {/* ── Canvas ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto', backgroundColor: '#ebe9e3', gap: '12px' }}>

          {/* Slide controls */}
          <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-end' }}>
            <button onClick={() => moveSlide(activeId, 'up')} style={{ padding: '3px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>↑</button>
            <button onClick={() => moveSlide(activeId, 'down')} style={{ padding: '3px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>↓</button>
            <button onClick={() => deleteSlide(activeId)} style={{ padding: '3px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#c44' }}>🗑</button>
          </div>

          {/* Slide */}
          <div style={{ width: '100%', maxWidth: '900px', aspectRatio: '16/9', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
            <SlideCanvas
              slide={activeSlide}
              members={members}
              p={p}
              f={f}
              isEditing={isEditing}
              onUpdate={updateSlide}
              onCite={setCitingSlide}
            />
          </div>

          <div style={{ fontSize: '11px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {SLIDE_TEMPLATES.find(t => t.type === activeSlide.type)?.label} · {slides.findIndex(s => s.id === activeId) + 1} of {slides.length}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ width: '240px', backgroundColor: '#fff', borderLeft: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8' }}>
            {(['slides', 'style', 'add'] as PanelKey[]).map(tab => (
              <button
                key={tab}
                onClick={() => setPanel(tab)}
                style={{
                  flex: 1, padding: '12px 4px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${panel === tab ? p.accent : 'transparent'}`,
                  color: panel === tab ? p.accent : '#bbb', cursor: 'pointer',
                  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: f.family
                }}
              >
                {tab === 'slides' ? '📋 Slides' : tab === 'style' ? '🎨 Style' : '➕ Add'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>

            {/* Slides panel */}
            {panel === 'slides' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{slides.length} Slides</div>
                {slides.map((slide, i) => {
                  const tmpl = SLIDE_TEMPLATES.find(t => t.type === slide.type);
                  return (
                    <div key={slide.id} onClick={() => setActiveId(slide.id)} style={{ padding: '8px 10px', borderRadius: '7px', cursor: 'pointer', border: `1px solid ${slide.id === activeId ? p.accent : '#eee'}`, backgroundColor: slide.id === activeId ? `${p.accent}10` : '#fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{tmpl?.icon}</span>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '500', color: '#333' }}>{slide.title || tmpl?.label}</div>
                          <div style={{ fontSize: '9px', color: '#bbb' }}>Slide {i + 1} · {tmpl?.group}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Style panel */}
            {panel === 'style' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Color Palette</div>
                  {(Object.keys(PALETTES) as PaletteKey[]).map(key => (
                    <button key={key} onClick={() => setPalette(key)} style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', cursor: 'pointer', textAlign: 'left', border: `1px solid ${palette === key ? PALETTES[key].accent : '#eee'}`, backgroundColor: palette === key ? `${PALETTES[key].accent}12` : '#fafafa', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: f.family }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: PALETTES[key].bg, border: `2px solid ${PALETTES[key].accent}` }} />
                      <span style={{ fontSize: '12px', color: '#444' }}>{PALETTES[key].name}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Typography</div>
                  {(Object.keys(FONTS) as FontKey[]).map(key => (
                    <button key={key} onClick={() => setFont(key)} style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', cursor: 'pointer', textAlign: 'left', border: `1px solid ${font === key ? p.accent : '#eee'}`, backgroundColor: font === key ? `${p.accent}12` : '#fafafa', marginBottom: '4px', fontFamily: FONTS[key].family }}>
                      <span style={{ fontSize: '13px', color: font === key ? p.accent : '#555' }}>{FONTS[key].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add slide panel */}
            {panel === 'add' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {groupedTemplates.map(({ group, items }) => (
                  <div key={group} style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', paddingBottom: '4px', borderBottom: '1px solid #f0f0f0' }}>{group}</div>
                    {items.map(tmpl => (
                      <button key={tmpl.type} onClick={() => addSlide(tmpl.type)} style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', cursor: 'pointer', textAlign: 'left', border: '1px solid #eee', backgroundColor: '#fafafa', marginBottom: '4px', fontFamily: f.family, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{tmpl.icon}</span>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#333', marginBottom: '1px' }}>{tmpl.label}</div>
                          <div style={{ fontSize: '9px', color: '#bbb', lineHeight: '1.3' }}>{tmpl.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Citation Modal */}
      {citingSlide && (
        <CitationModal
          slideTitle={citingSlide.title}
          existingCitations={citingSlide.citations || []}
          onSave={handleSaveCitations}
          onClose={() => setCitingSlide(null)}
          palette={p}
          font={f.family}
        />
      )}
    </div>
  );
}