import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HERITAGE_STICKERS } from '../constants/stickers';
import { useParams } from 'react-router-dom';
import MembersPanel from '../components/MembersPanel';

// ─── Types ────────────────────────────────────────────────────────────────────

type SlideType =
  | 'cover'
  | 'person'
  | 'tree'
  | 'timeline'
  | 'heritage'
  | 'facts'
  | 'photo'
  | 'citations'
  | 'closing';

type PaletteKey = 'cream' | 'sage' | 'rose' | 'slate' | 'lavender';
type FontKey = 'playfair' | 'cormorant' | 'lora' | 'merriweather' | 'cinzel' | 'crimson' | 'libre' | 'spectral';

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

interface CitationEntry {
  id: string;
  type: string;
  text: string;
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
  citations?: CitationEntry[];
  imageUrl?: string;
  heritageKey?: string;
  backgroundColor?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PALETTES: Record<PaletteKey, {
  name: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
  muted: string;
  border: string;
  preview: string;
}> = {
  cream: {
    name: '📜 Cream & Sepia',
    bg: '#faf6ef',
    card: '#ffffff',
    accent: '#8b5e3c',
    text: '#2c1810',
    muted: '#9c8573',
    border: '#e8ddd0',
    preview: 'bg-amber-50'
  },
  sage: {
    name: '🌿 Sage & Stone',
    bg: '#f4f6f2',
    card: '#ffffff',
    accent: '#4a6741',
    text: '#1e2b1c',
    muted: '#7a9175',
    border: '#d4ddd0',
    preview: 'bg-green-50'
  },
  rose: {
    name: '🌸 Rose & Pearl',
    bg: '#fdf4f5',
    card: '#ffffff',
    accent: '#9b4f6a',
    text: '#2c1018',
    muted: '#b87a90',
    border: '#edd5dd',
    preview: 'bg-rose-50'
  },
  slate: {
    name: '🌑 Slate & Gold',
    bg: '#1e2330',
    card: '#252d3d',
    accent: '#c9a84c',
    text: '#f0ece4',
    muted: '#8a9bb5',
    border: '#2e3a50',
    preview: 'bg-slate-800'
  },
  lavender: {
    name: '💜 Lavender & Mist',
    bg: '#f4f2fb',
    card: '#ffffff',
    accent: '#6b5b9e',
    text: '#1e1a2e',
    muted: '#9b8fc0',
    border: '#ddd8f0',
    preview: 'bg-purple-50'
  }
};

const FONTS: Record<FontKey, { name: string; family: string; url: string }> = {
  playfair: { name: 'Playfair Display', family: "'Playfair Display', serif", url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap' },
  cormorant: { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap' },
  lora: { name: 'Lora', family: "'Lora', serif", url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap' },
  merriweather: { name: 'Merriweather', family: "'Merriweather', serif", url: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,700;1,300&display=swap' },
  cinzel: { name: 'Cinzel', family: "'Cinzel', serif", url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap' },
  crimson: { name: 'Crimson Text', family: "'Crimson Text', serif", url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap' },
  libre: { name: 'Libre Baskerville', family: "'Libre Baskerville', serif", url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap' },
  spectral: { name: 'Spectral', family: "'Spectral', serif", url: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,600;1,300&display=swap' },
};

const SLIDE_TEMPLATES: { type: SlideType; icon: string; label: string; description: string }[] = [
  { type: 'cover', icon: '📖', label: 'Cover', description: 'Title slide with family name and dates' },
  { type: 'person', icon: '👤', label: 'Person Profile', description: 'Full profile with bio and photo' },
  { type: 'tree', icon: '🌳', label: 'Family Tree', description: 'Visual tree with generations' },
  { type: 'timeline', icon: '📅', label: 'Timeline', description: 'Historical events and milestones' },
  { type: 'heritage', icon: '🌍', label: 'Heritage', description: 'Country of origin with sticker' },
  { type: 'facts', icon: '📊', label: 'Facts & Stats', description: 'Key numbers and data points' },
  { type: 'photo', icon: '📸', label: 'Photo & Story', description: 'Image with narrative text' },
  { type: 'citations', icon: '📚', label: 'Citations', description: 'Chicago-style source list' },
  { type: 'closing', icon: '🎬', label: 'Closing', description: 'Final slide with contact info' },
];

const createDefaultSlide = (type: SlideType): SlideData => {
  const id = `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  switch (type) {
    case 'cover':
      return { id, type, title: 'Family Name Chronicles', subtitle: 'A Journey Through Generations', body: 'Established 1780 — Present Day' };
    case 'person':
      return {
        id, type, title: 'Person Profile',
        person: { firstName: '', lastName: '', birthDate: '', birthPlace: '', deathDate: '', deathPlace: '', heritage: '', bio: '', photoUrl: '', generation: '' }
      };
    case 'timeline':
      return {
        id, type, title: 'Family Timeline',
        timelineEvents: [
          { year: '1780', title: 'Event Title', description: 'Describe this milestone...' },
          { year: '1820', title: 'Event Title', description: 'Describe this milestone...' },
          { year: '1860', title: 'Event Title', description: 'Describe this milestone...' },
        ]
      };
    case 'heritage':
      return { id, type, title: 'Heritage & Origins', subtitle: 'Where we come from', heritageKey: 'honduras' };
    case 'facts':
      return {
        id, type, title: 'Legacy by the Numbers',
        facts: [
          { label: 'Generations', value: '7' },
          { label: 'Countries', value: '4' },
          { label: 'Years of History', value: '240+' },
          { label: 'Family Members', value: '120+' },
        ]
      };
    case 'photo':
      return { id, type, title: 'Our Story', body: 'Write your family story here...', imageUrl: '' };
    case 'citations':
      return {
        id, type, title: 'Sources & Citations',
        citations: [{ id: 'c1', type: 'Census', text: '' }]
      };
    case 'closing':
      return { id, type, title: 'Preserving the Future', subtitle: 'Join us in mapping the next chapter', body: '' };
    default:
      return { id, type, title: 'New Slide', body: '' };
  }
};

// ─── Slide Canvas ─────────────────────────────────────────────────────────────

function SlideCanvas({ slide, palette, font, isEditing, onUpdate }: {
  slide: SlideData;
  palette: typeof PALETTES[PaletteKey];
  font: typeof FONTS[FontKey];
  isEditing: boolean;
  onUpdate: (updated: SlideData) => void;
}) {
  const p = palette;
  const f = font.family;

  const editableText = (
    value: string,
    onChange: (v: string) => void,
    style: React.CSSProperties,
    placeholder: string,
    multiline = false
  ) => {
    if (!isEditing) {
      return <span style={style}>{value || placeholder}</span>;
    }
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            ...style,
            background: 'transparent',
            border: `1px dashed ${p.accent}60`,
            borderRadius: '4px',
            outline: 'none',
            resize: 'vertical',
            width: '100%',
            padding: '4px 8px',
            fontFamily: f,
          }}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...style,
          background: 'transparent',
          border: `1px dashed ${p.accent}60`,
          borderRadius: '4px',
          outline: 'none',
          width: '100%',
          padding: '2px 8px',
          fontFamily: f,
        }}
      />
    );
  };

  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: p.bg,
    fontFamily: f,
    color: p.text,
    display: 'flex',
    flexDirection: 'column',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden',
  };

  // ── Cover ──
  if (slide.type === 'cover') {
    return (
      <div style={baseStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '2px', backgroundColor: p.accent, marginBottom: '8px' }} />
          {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '52px', fontWeight: '700', color: p.text, letterSpacing: '-1px', lineHeight: '1.1' }, 'Family Chronicles')}
          {editableText(slide.subtitle || '', v => onUpdate({ ...slide, subtitle: v }), { fontSize: '22px', color: p.muted, fontStyle: 'italic', marginTop: '8px' }, 'A Journey Through Generations')}
          <div style={{ width: '40px', height: '1px', backgroundColor: p.border, margin: '8px 0' }} />
          {editableText(slide.body || '', v => onUpdate({ ...slide, body: v }), { fontSize: '13px', color: p.muted, letterSpacing: '3px', textTransform: 'uppercase' }, 'Established 1780 — Present Day')}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
      </div>
    );
  }

  // ── Person Profile ──
  if (slide.type === 'person') {
    const person = slide.person!;
    return (
      <div style={baseStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: p.accent }} />
        <div style={{ display: 'flex', gap: '40px', height: '100%' }}>
          {/* Left */}
          <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Photo */}
            <div style={{ width: '180px', height: '220px', backgroundColor: p.border, borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${p.border}` }}>
              {person.photoUrl
                ? <img src={person.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="profile" />
                : <div style={{ textAlign: 'center', color: p.muted }}>
                    {isEditing && <input type="text" placeholder="Photo URL" value={person.photoUrl} onChange={e => onUpdate({ ...slide, person: { ...person, photoUrl: e.target.value } })} style={{ fontSize: '11px', background: 'transparent', border: `1px dashed ${p.accent}60`, borderRadius: '4px', outline: 'none', padding: '4px', width: '150px', color: p.muted, fontFamily: f }} />}
                    {!isEditing && <span style={{ fontSize: '40px' }}>📷</span>}
                  </div>
              }
            </div>
            {/* Heritage sticker */}
            {person.heritage && HERITAGE_STICKERS[person.heritage] && (
              <div style={{ padding: '8px 12px', borderRadius: '20px', backgroundColor: p.border, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: p.accent, fontWeight: '600' }}>
                <span>{HERITAGE_STICKERS[person.heritage].icon}</span>
                <span>{HERITAGE_STICKERS[person.heritage].label}</span>
              </div>
            )}
            {isEditing && (
              <select value={person.heritage} onChange={e => onUpdate({ ...slide, person: { ...person, heritage: e.target.value } })} style={{ fontSize: '12px', padding: '4px', border: `1px dashed ${p.accent}60`, borderRadius: '4px', background: 'transparent', color: p.text, fontFamily: f }}>
                <option value="">Select heritage...</option>
                {Object.entries(HERITAGE_STICKERS).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Right */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {editableText(person.firstName, v => onUpdate({ ...slide, person: { ...person, firstName: v } }), { fontSize: '36px', fontWeight: '700', color: p.text }, 'First Name')}
              {editableText(person.lastName, v => onUpdate({ ...slide, person: { ...person, lastName: v } }), { fontSize: '36px', fontWeight: '300', color: p.accent }, 'Last Name')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              {[
                { label: 'Born', value: person.birthDate, key: 'birthDate' },
                { label: 'Birthplace', value: person.birthPlace, key: 'birthPlace' },
                { label: 'Died', value: person.deathDate, key: 'deathDate' },
                { label: 'Death Place', value: person.deathPlace, key: 'deathPlace' },
                { label: 'Generation', value: person.generation, key: 'generation' },
              ].map(({ label, value, key }) => (
                <div key={key} style={{ padding: '8px', backgroundColor: `${p.border}60`, borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: p.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
                  {editableText(value, v => onUpdate({ ...slide, person: { ...person, [key]: v } }), { fontSize: '13px', color: p.text, fontWeight: '500' }, `Enter ${label.toLowerCase()}...`)}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: p.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Biography</div>
              {editableText(person.bio, v => onUpdate({ ...slide, person: { ...person, bio: v } }), { fontSize: '14px', color: p.text, lineHeight: '1.6' }, 'Write a biography...', true)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Timeline ──
  if (slide.type === 'timeline') {
    const events = slide.timelineEvents || [];
    return (
      <div style={baseStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '32px', fontWeight: '700', color: p.text, marginBottom: '32px' }, 'Family Timeline')}
        <div style={{ position: 'relative', flex: 1 }}>
          {/* Line */}
          <div style={{ position: 'absolute', left: '80px', top: 0, bottom: 0, width: '2px', backgroundColor: p.border }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '400px' }}>
            {events.map((event, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ width: '80px', textAlign: 'right', flexShrink: 0 }}>
                  {editableText(event.year, v => { const ev = [...events]; ev[i] = { ...ev[i], year: v }; onUpdate({ ...slide, timelineEvents: ev }); }, { fontSize: '16px', fontWeight: '700', color: p.accent }, 'Year')}
                </div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: p.accent, flexShrink: 0, marginTop: '4px' }} />
                <div style={{ flex: 1, padding: '8px 12px', backgroundColor: `${p.border}50`, borderRadius: '8px' }}>
                  {editableText(event.title, v => { const ev = [...events]; ev[i] = { ...ev[i], title: v }; onUpdate({ ...slide, timelineEvents: ev }); }, { fontSize: '15px', fontWeight: '600', color: p.text, display: 'block', marginBottom: '4px' }, 'Event title')}
                  {editableText(event.description, v => { const ev = [...events]; ev[i] = { ...ev[i], description: v }; onUpdate({ ...slide, timelineEvents: ev }); }, { fontSize: '13px', color: p.muted, lineHeight: '1.5' }, 'Describe this event...', true)}
                </div>
                {isEditing && (
                  <button onClick={() => { const ev = events.filter((_, j) => j !== i); onUpdate({ ...slide, timelineEvents: ev }); }} style={{ color: p.muted, background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <button onClick={() => onUpdate({ ...slide, timelineEvents: [...events, { year: '', title: '', description: '' }] })} style={{ marginTop: '12px', padding: '6px 16px', backgroundColor: 'transparent', border: `1px dashed ${p.accent}`, borderRadius: '6px', color: p.accent, cursor: 'pointer', fontSize: '13px', fontFamily: f }}>
              + Add Event
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Heritage ──
  if (slide.type === 'heritage') {
    const sticker = slide.heritageKey ? HERITAGE_STICKERS[slide.heritageKey] : null;
    return (
      <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        {sticker && <div style={{ fontSize: '80px', marginBottom: '16px' }}>{sticker.icon}</div>}
        {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '40px', fontWeight: '700', color: p.text, display: 'block', marginBottom: '12px' }, 'Heritage & Origins')}
        {editableText(slide.subtitle || '', v => onUpdate({ ...slide, subtitle: v }), { fontSize: '20px', color: p.muted, fontStyle: 'italic', display: 'block', marginBottom: '24px' }, 'Where we come from')}
        {editableText(slide.body || '', v => onUpdate({ ...slide, body: v }), { fontSize: '15px', color: p.text, lineHeight: '1.7', maxWidth: '600px', display: 'block' }, 'Write about this heritage...', true)}
        {isEditing && (
          <div style={{ marginTop: '16px' }}>
            <select value={slide.heritageKey || ''} onChange={e => onUpdate({ ...slide, heritageKey: e.target.value })} style={{ fontSize: '13px', padding: '6px 10px', border: `1px solid ${p.border}`, borderRadius: '6px', background: p.card, color: p.text, fontFamily: f }}>
              <option value="">Select heritage...</option>
              {Object.entries(HERITAGE_STICKERS).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  // ── Facts ──
  if (slide.type === 'facts') {
    const facts = slide.facts || [];
    return (
      <div style={baseStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', backgroundColor: p.accent }} />
        {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '32px', fontWeight: '700', color: p.text, marginBottom: '32px', display: 'block' }, 'Facts & Statistics')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', flex: 1 }}>
          {facts.map((fact, i) => (
            <div key={i} style={{ backgroundColor: `${p.border}50`, borderRadius: '12px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              {editableText(fact.value, v => { const f = [...facts]; f[i] = { ...f[i], value: v }; onUpdate({ ...slide, facts: f }); }, { fontSize: '40px', fontWeight: '700', color: p.accent }, '0')}
              {editableText(fact.label, v => { const f = [...facts]; f[i] = { ...f[i], label: v }; onUpdate({ ...slide, facts: f }); }, { fontSize: '14px', color: p.muted, textTransform: 'uppercase', letterSpacing: '1px' }, 'Label')}
              {isEditing && (
                <button onClick={() => onUpdate({ ...slide, facts: facts.filter((_, j) => j !== i) })} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: p.muted, fontSize: '14px' }}>✕</button>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={() => onUpdate({ ...slide, facts: [...facts, { label: 'New Fact', value: '0' }] })} style={{ backgroundColor: 'transparent', border: `1px dashed ${p.accent}`, borderRadius: '12px', padding: '20px', color: p.accent, cursor: 'pointer', fontSize: '24px', fontFamily: f }}>+</button>
          )}
        </div>
      </div>
    );
  }

  // ── Photo + Story ──
  if (slide.type === 'photo') {
    return (
      <div style={{ ...baseStyle, flexDirection: 'row', padding: '0', gap: '0' }}>
        <div style={{ width: '45%', backgroundColor: p.border, overflow: 'hidden', position: 'relative' }}>
          {slide.imageUrl
            ? <img src={slide.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="slide" />
            : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '40px' }}>📸</span>
                {isEditing && <input type="text" placeholder="Image URL" value={slide.imageUrl || ''} onChange={e => onUpdate({ ...slide, imageUrl: e.target.value })} style={{ fontSize: '12px', padding: '6px', border: `1px dashed ${p.accent}60`, borderRadius: '4px', background: 'transparent', color: p.muted, width: '80%', fontFamily: f }} />}
              </div>
          }
        </div>
        <div style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', backgroundColor: p.bg }}>
          <div style={{ width: '40px', height: '3px', backgroundColor: p.accent }} />
          {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '32px', fontWeight: '700', color: p.text, display: 'block' }, 'Our Story')}
          {editableText(slide.body || '', v => onUpdate({ ...slide, body: v }), { fontSize: '15px', color: p.muted, lineHeight: '1.8' }, 'Write your family story here...', true)}
        </div>
      </div>
    );
  }

  // ── Citations ──
  if (slide.type === 'citations') {
    const citations = slide.citations || [];
    return (
      <div style={baseStyle}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '32px', fontWeight: '700', color: p.text, marginBottom: '24px', display: 'block' }, 'Sources & Citations')}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {citations.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ color: p.accent, fontWeight: '700', fontSize: '14px', minWidth: '20px', marginTop: '4px' }}>{i + 1}.</span>
              <div style={{ flex: 1 }}>
                {isEditing && (
                  <select value={c.type} onChange={e => { const cs = [...citations]; cs[i] = { ...cs[i], type: e.target.value }; onUpdate({ ...slide, citations: cs }); }} style={{ fontSize: '11px', padding: '2px 6px', border: `1px solid ${p.border}`, borderRadius: '4px', background: p.card, color: p.muted, marginBottom: '4px', fontFamily: f }}>
                    {['Book', 'Census', 'Newspaper', 'OralHistory', 'Magazine', 'Portrait', 'Custom'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
                {!isEditing && <span style={{ fontSize: '10px', color: p.muted, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>{c.type}</span>}
                {editableText(c.text, v => { const cs = [...citations]; cs[i] = { ...cs[i], text: v }; onUpdate({ ...slide, citations: cs }); }, { fontSize: '13px', color: p.text, lineHeight: '1.6', fontStyle: 'italic' }, 'Enter Chicago-style citation here...', true)}
              </div>
              {isEditing && <button onClick={() => onUpdate({ ...slide, citations: citations.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.muted, fontSize: '14px' }}>✕</button>}
            </div>
          ))}
          {isEditing && (
            <button onClick={() => onUpdate({ ...slide, citations: [...citations, { id: `c${Date.now()}`, type: 'Census', text: '' }] })} style={{ padding: '6px 16px', backgroundColor: 'transparent', border: `1px dashed ${p.accent}`, borderRadius: '6px', color: p.accent, cursor: 'pointer', fontSize: '13px', fontFamily: f, alignSelf: 'flex-start' }}>
              + Add Citation
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Closing ──
  if (slide.type === 'closing') {
    return (
      <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
        {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '44px', fontWeight: '700', color: p.accent, display: 'block' }, 'Preserving the Future')}
        {editableText(slide.subtitle || '', v => onUpdate({ ...slide, subtitle: v }), { fontSize: '20px', color: p.muted, fontStyle: 'italic', display: 'block' }, 'Join us in mapping the next chapter')}
        <div style={{ width: '60px', height: '1px', backgroundColor: p.border }} />
        {editableText(slide.body || '', v => onUpdate({ ...slide, body: v }), { fontSize: '14px', color: p.muted, lineHeight: '1.8', maxWidth: '500px', display: 'block' }, 'Add contact info, website, or closing message...', true)}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: p.accent }} />
      </div>
    );
  }

  // ── Tree placeholder ──
  return (
    <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <span style={{ fontSize: '60px' }}>🌳</span>
      {editableText(slide.title, v => onUpdate({ ...slide, title: v }), { fontSize: '28px', fontWeight: '700', color: p.text }, 'Family Tree')}
      <p style={{ color: p.muted, fontSize: '14px', textAlign: 'center', maxWidth: '400px' }}>
        The interactive family tree will render here with your member data from the database.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PresentationBuilderPage() {
  const navigate = useNavigate();
  const { presentationId } = useParams<{ presentationId?: string }>();
  const { user, logout } = useAuth();

  const [slides, setSlides] = useState<SlideData[]>([
    createDefaultSlide('cover'),
  ]);
  const [activeSlideId, setActiveSlideId] = useState<string>(slides[0].id);
  const [palette, setPalette] = useState<PaletteKey>('cream');
  const [font, setFont] = useState<FontKey>('playfair');
  const [isEditing, setIsEditing] = useState(true);
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);
  const [rightPanel, setRightPanel] = useState<'slides' | 'design' | 'add' | 'members'>('slides');
  const [presentationTitle, setPresentationTitle] = useState('My Family Presentation');
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0];
  const p = PALETTES[palette];
  const f = FONTS[font];

  // Load font
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = f.url;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [font]);

  const updateSlide = (updated: SlideData) => {
    setSlides(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const addSlide = (type: SlideType) => {
    const newSlide = createDefaultSlide(type);
    setSlides(prev => [...prev, newSlide]);
    setActiveSlideId(newSlide.id);
    setRightPanel('slides');
  };

  const deleteSlide = (id: string) => {
    if (slides.length === 1) return;
    const idx = slides.findIndex(s => s.id === id);
    const newSlides = slides.filter(s => s.id !== id);
    setSlides(newSlides);
    setActiveSlideId(newSlides[Math.max(0, idx - 1)].id);
  };

  const moveSlide = (id: string, dir: 'up' | 'down') => {
    const idx = slides.findIndex(s => s.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === slides.length - 1) return;
    const newSlides = [...slides];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [newSlides[idx], newSlides[swap]] = [newSlides[swap], newSlides[idx]];
    setSlides(newSlides);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('genea_token');
      await fetch('http://localhost:5500/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: presentationTitle, slides, palette, font })
      });
    } catch {
      console.error('Could not save presentation');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => window.print();

  // ── Present Mode ──
  if (isPresentMode) {
    const currentSlide = slides[presentIndex];
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '1200px', aspectRatio: '16/9', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}>
            <SlideCanvas slide={currentSlide} palette={p} font={f} isEditing={false} onUpdate={() => {}} />
          </div>
        </div>
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111' }}>
          <button onClick={() => setIsPresentMode(false)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>✕ Exit</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setPresentIndex(i => Math.max(0, i - 1))} disabled={presentIndex === 0} style={{ padding: '8px 20px', background: '#222', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>← Prev</button>
            <span style={{ color: '#888', fontSize: '13px' }}>{presentIndex + 1} / {slides.length}</span>
            <button onClick={() => setPresentIndex(i => Math.min(slides.length - 1, i + 1))} disabled={presentIndex === slides.length - 1} style={{ padding: '8px 20px', background: '#222', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>Next →</button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setPresentIndex(i)} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === presentIndex ? '#fff' : '#444', border: 'none', cursor: 'pointer', padding: 0 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Editor ──
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0eee8', fontFamily: f.family, display: 'flex', flexDirection: 'column' }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: '#1a1a2e', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
          <span style={{ color: '#444', fontSize: '18px' }}>|</span>
          <input
            type="text"
            value={presentationTitle}
            onChange={e => setPresentationTitle(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#e0ddd5', fontSize: '15px', fontFamily: f.family, fontWeight: '500', width: '280px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(e => !e)}
            style={{ padding: '6px 14px', background: isEditing ? '#c9a84c22' : 'transparent', border: `1px solid ${isEditing ? '#c9a84c' : '#444'}`, color: isEditing ? '#c9a84c' : '#888', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            {isEditing ? '✏️ Editing' : '👁 Viewing'}
          </button>
          <button
            onClick={() => { setIsPresentMode(true); setPresentIndex(slides.findIndex(s => s.id === activeSlideId)); }}
            style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            🎬 Present
          </button>
          <button
            onClick={handlePrint}
            style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            🖨️ Print
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{ padding: '6px 14px', background: '#c9a84c', border: 'none', color: '#1a1a2e', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
          <div style={{ width: '1px', height: '24px', background: '#333' }} />
          <span style={{ color: '#666', fontSize: '12px' }}>
            {user?.name}
          </span>
          <button onClick={logout} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Sign out</button>
        </div>
      </div>
<button 
  onClick={() => { logout(); navigate('/'); }} 
  style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
>
  Sign out
</button>
      {/* Main Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left Panel — Slide List */}
        <div style={{ width: '200px', backgroundColor: '#13131f', padding: '12px 8px', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              onClick={() => setActiveSlideId(slide.id)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: slide.id === activeSlideId ? '#c9a84c22' : 'transparent',
                border: `1px solid ${slide.id === activeSlideId ? '#c9a84c' : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>
                {SLIDE_TEMPLATES.find(t => t.type === slide.type)?.icon || '📄'}
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '1px' }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {slide.title || slide.type}
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => setRightPanel('add')}
            style={{ padding: '8px', backgroundColor: 'transparent', border: '1px dashed #333', borderRadius: '6px', color: '#666', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}
          >
            + Add Slide
          </button>
        </div>

        {/* Center — Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', overflowY: 'auto', gap: '16px' }}>
          {/* Slide actions */}
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', marginRight: '8px' }}>
            <button onClick={() => moveSlide(activeSlideId, 'up')} style={{ padding: '4px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>↑</button>
            <button onClick={() => moveSlide(activeSlideId, 'down')} style={{ padding: '4px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>↓</button>
            <button onClick={() => deleteSlide(activeSlideId)} style={{ padding: '4px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#e53' }}>🗑</button>
          </div>

          {/* Slide */}
          <div ref={printRef} style={{ width: '100%', maxWidth: '960px', aspectRatio: '16/9', boxShadow: '0 4px 32px rgba(0,0,0,0.15)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <SlideCanvas
              slide={activeSlide}
              palette={p}
              font={f}
              isEditing={isEditing}
              onUpdate={updateSlide}
            />
          </div>

          {/* Slide type label */}
          <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {SLIDE_TEMPLATES.find(t => t.type === activeSlide.type)?.label} · Slide {slides.findIndex(s => s.id === activeSlideId) + 1} of {slides.length}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: '260px', backgroundColor: '#fff', borderLeft: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
    
         {/* Panel Tabs */}
<div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', overflowX: 'auto' }}>
  {(['slides', 'design', 'add', 'members'] as const).map(tab => (
    <button
      key={tab}
      onClick={() => setRightPanel(tab)}
      style={{
        flex: 1, padding: '10px 4px', background: 'none',
        border: 'none', borderBottom: `2px solid ${rightPanel === tab ? p.accent : 'transparent'}`,
        color: rightPanel === tab ? p.accent : '#999', cursor: 'pointer', fontSize: '10px',
        textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: f.family,
        whiteSpace: 'nowrap'
      }}
    >
      {tab === 'slides' ? '📋' : tab === 'design' ? '🎨' : tab === 'add' ? '➕' : '👥'}
      {' '}{tab}
    </button>
  ))}
  {/* Members Panel */}
{rightPanel === 'members' && (
  <MembersPanel
    treeId={treeId}
    token={localStorage.getItem('genea_token') || ''}
    palette={p}
    font={f.family}
  />
)}
</div>
          

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

            {/* Slides Panel */}
            {rightPanel === 'slides' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {slides.length} Slides
                </div>
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    onClick={() => setActiveSlideId(slide.id)}
                    style={{
                      padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${slide.id === activeSlideId ? p.accent : '#e8e8e8'}`,
                      backgroundColor: slide.id === activeSlideId ? `${p.accent}10` : '#fafafa',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{SLIDE_TEMPLATES.find(t => t.type === slide.type)?.icon}</span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>{slide.title || slide.type}</div>
                        <div style={{ fontSize: '10px', color: '#999' }}>Slide {i + 1}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Design Panel */}
            {rightPanel === 'design' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Palette */}
                <div>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Color Palette</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(Object.keys(PALETTES) as PaletteKey[]).map(key => (
                      <button
                        key={key}
                        onClick={() => setPalette(key)}
                        style={{
                          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                          border: `1px solid ${palette === key ? PALETTES[key].accent : '#e8e8e8'}`,
                          backgroundColor: palette === key ? `${PALETTES[key].accent}15` : '#fafafa',
                          display: 'flex', alignItems: 'center', gap: '10px', fontFamily: f.family
                        }}
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: PALETTES[key].bg, border: `2px solid ${PALETTES[key].accent}` }} />
                        <span style={{ fontSize: '12px', color: '#333' }}>{PALETTES[key].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Typography</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(Object.keys(FONTS) as FontKey[]).map(key => (
                      <button
                        key={key}
                        onClick={() => setFont(key)}
                        style={{
                          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                          border: `1px solid ${font === key ? p.accent : '#e8e8e8'}`,
                          backgroundColor: font === key ? `${p.accent}15` : '#fafafa',
                          fontFamily: FONTS[key].family
                        }}
                      >
                        <span style={{ fontSize: '14px', color: font === key ? p.accent : '#333' }}>{FONTS[key].name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add Slide Panel */}
            {rightPanel === 'add' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Choose Slide Type</div>
                {SLIDE_TEMPLATES.map(template => (
                  <button
                    key={template.type}
                    onClick={() => addSlide(template.type)}
                    style={{
                      padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                      border: '1px solid #e8e8e8', backgroundColor: '#fafafa', fontFamily: f.family,
                      display: 'flex', alignItems: 'flex-start', gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{template.icon}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>{template.label}</div>
                      <div style={{ fontSize: '11px', color: '#999', lineHeight: '1.4' }}>{template.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}