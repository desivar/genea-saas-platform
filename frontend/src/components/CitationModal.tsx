import React, { useState } from 'react';
import { ChicagoFormatter, ICitationParams } from '../utils/citationFormatter';

type SourceType = 'Book' | 'Newspaper' | 'Magazine' | 'Census' | 'OralHistory' | 'Portrait' | 'Custom';

interface ICitation {
  id: string;
  type: SourceType;
  params: ICitationParams;
  footnoteText: string;
  shortCite: string;
}

interface CitationModalProps {
  slideTitle: string;
  existingCitations: ICitation[];
  onSave: (citations: ICitation[]) => void;
  onClose: () => void;
  palette: any;
  font: string;
}

const SOURCE_TYPES: { type: SourceType; icon: string; label: string; fields: string[] }[] = [
  {
    type: 'Census',
    icon: '📊',
    label: 'Census Record',
    fields: ['date', 'pubPlace', 'pageNumbers', 'url']
  },
  {
    type: 'Book',
    icon: '📖',
    label: 'Book',
    fields: ['title', 'creator', 'pubPlace', 'publisher', 'date', 'pageNumbers']
  },
  {
    type: 'Newspaper',
    icon: '📰',
    label: 'Newspaper',
    fields: ['title', 'creator', 'publicationName', 'pubPlace', 'date', 'pageNumbers', 'url']
  },
  {
    type: 'Magazine',
    icon: '📄',
    label: 'Magazine',
    fields: ['title', 'creator', 'publicationName', 'date', 'pageNumbers', 'url']
  },
  {
    type: 'OralHistory',
    icon: '🎙️',
    label: 'Oral History',
    fields: ['creator', 'interviewer', 'date', 'publicationName']
  },
  {
    type: 'Portrait',
    icon: '🖼️',
    label: 'Portrait / Photo',
    fields: ['title', 'creator', 'date', 'formatType', 'publisher', 'pubPlace']
  },
  {
    type: 'Custom',
    icon: '✏️',
    label: 'Custom',
    fields: ['title']
  },
];

const FIELD_LABELS: Record<string, string> = {
  title: 'Title / Article Name',
  creator: 'Author / Creator',
  date: 'Date / Year',
  url: 'URL (if online)',
  publicationName: 'Publication Name',
  pubPlace: 'Place of Publication / Location',
  publisher: 'Publisher / Repository',
  pageNumbers: 'Page / Item Number',
  interviewer: 'Interviewer Name',
  formatType: 'Format (e.g. oil on canvas)',
};

const emptyParams: ICitationParams = {
  title: '', creator: '', date: '', url: '',
  publicationName: '', pubPlace: '', publisher: '',
  pageNumbers: '', interviewer: '', formatType: ''
};

export default function CitationModal({
  slideTitle, existingCitations, onSave, onClose, palette: p, font
}: CitationModalProps) {
  const [citations, setCitations] = useState<ICitation[]>(existingCitations);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<SourceType>('Census');
  const [params, setParams] = useState<ICitationParams>(emptyParams);
  const [preview, setPreview] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const generatePreview = (type: SourceType, p: ICitationParams) => {
    try {
      return ChicagoFormatter.format(type, p);
    } catch {
      return 'Fill in fields to preview citation...';
    }
  };

  const handleParamChange = (field: keyof ICitationParams, value: string) => {
    const updated = { ...params, [field]: value };
    setParams(updated);
    setPreview(generatePreview(selectedType, updated));
  };

  const handleTypeChange = (type: SourceType) => {
    setSelectedType(type);
    setPreview(generatePreview(type, params));
  };

  const handleAddCitation = () => {
    const footnoteText = ChicagoFormatter.format(selectedType, params);
    const shortCite = ChicagoFormatter.shortCite
      ? ChicagoFormatter.shortCite(params.creator, params.title)
      : footnoteText.slice(0, 60) + '...';

    const newCitation: ICitation = {
      id: editingId || `cite-${Date.now()}`,
      type: selectedType,
      params,
      footnoteText,
      shortCite
    };

    if (editingId) {
      setCitations(prev => prev.map(c => c.id === editingId ? newCitation : c));
    } else {
      setCitations(prev => [...prev, newCitation]);
    }

    setIsAdding(false);
    setParams(emptyParams);
    setPreview('');
    setEditingId(null);
  };

  const handleEdit = (citation: ICitation) => {
    setSelectedType(citation.type);
    setParams(citation.params);
    setPreview(citation.footnoteText);
    setEditingId(citation.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setCitations(prev => prev.filter(c => c.id !== id));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 10px', fontSize: '12px',
    border: '1px solid #e8e8e8', borderRadius: '6px',
    background: '#fafafa', color: '#333', fontFamily: font,
    outline: 'none', boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px', display: 'block', marginBottom: '3px'
  };

  const currentSourceType = SOURCE_TYPES.find(s => s.type === selectedType)!;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '680px', maxHeight: '85vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e8e8e8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e1a2e', margin: 0, fontFamily: font }}>
              📚 Citations
            </h3>
            <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0', fontFamily: font }}>
              Slide: {slideTitle} · Chicago Manual of Style
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Existing citations */}
          {citations.length > 0 && !isAdding && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                {citations.length} Source{citations.length > 1 ? 's' : ''} on this slide
              </div>
              {citations.map((c, i) => (
                <div key={c.id} style={{
                  padding: '12px 14px', borderRadius: '10px',
                  border: '1px solid #e8e8e8', backgroundColor: '#fafafa',
                  marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start'
                }}>
                  <span style={{ color: p.accent, fontWeight: '700', fontSize: '14px', minWidth: '20px', fontFamily: font }}>
                    {i + 1}.
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      {SOURCE_TYPES.find(s => s.type === c.type)?.icon} {c.type}
                    </div>
                    <p style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', lineHeight: '1.5', margin: 0, fontFamily: font }}>
                      {c.footnoteText}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => handleEdit(c)} style={{ padding: '3px 8px', background: 'transparent', border: '1px solid #e8e8e8', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                    <button onClick={() => handleDelete(c.id)} style={{ padding: '3px 8px', background: 'transparent', border: '1px solid #fee2e2', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: '#e53' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {isAdding ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#333', fontFamily: font }}>
                {editingId ? 'Edit Citation' : 'Add New Citation'}
              </div>

              {/* Source type selector */}
              <div>
                <label style={labelStyle}>Source Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {SOURCE_TYPES.map(s => (
                    <button
                      key={s.type}
                      onClick={() => handleTypeChange(s.type)}
                      style={{
                        padding: '8px 4px', borderRadius: '8px', cursor: 'pointer',
                        border: `1px solid ${selectedType === s.type ? p.accent : '#e8e8e8'}`,
                        backgroundColor: selectedType === s.type ? `${p.accent}15` : '#fafafa',
                        textAlign: 'center', fontFamily: font
                      }}
                    >
                      <div style={{ fontSize: '18px' }}>{s.icon}</div>
                      <div style={{ fontSize: '10px', color: selectedType === s.type ? p.accent : '#999', marginTop: '2px' }}>{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentSourceType.fields.map(field => (
                  <div key={field}>
                    <label style={labelStyle}>{FIELD_LABELS[field] || field}</label>
                    <input
                      style={inputStyle}
                      value={(params as any)[field] || ''}
                      onChange={e => handleParamChange(field as keyof ICitationParams, e.target.value)}
                      placeholder={`Enter ${FIELD_LABELS[field]?.toLowerCase() || field}...`}
                    />
                  </div>
                ))}
              </div>

              {/* Preview */}
              {preview && (
                <div style={{
                  padding: '12px 14px', backgroundColor: `${p.accent}10`,
                  borderRadius: '8px', border: `1px solid ${p.accent}30`
                }}>
                  <div style={{ fontSize: '10px', color: p.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontFamily: font }}>
                    Chicago Style Preview
                  </div>
                  <p style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', lineHeight: '1.6', margin: 0, fontFamily: font }}>
                    {preview}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAddCitation}
                  style={{
                    flex: 1, padding: '10px', background: p.accent,
                    border: 'none', color: '#fff', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '13px', fontFamily: font, fontWeight: '600'
                  }}
                >
                  {editingId ? '✅ Update Citation' : '✅ Add Citation'}
                </button>
                <button
                  onClick={() => { setIsAdding(false); setParams(emptyParams); setEditingId(null); }}
                  style={{
                    padding: '10px 16px', background: 'transparent',
                    border: '1px solid #e8e8e8', color: '#999',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: font
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent', border: `1px dashed ${p.accent}`,
                color: p.accent, borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontFamily: font
              }}
            >
              + Add Citation
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #e8e8e8',
          display: 'flex', justifyContent: 'flex-end', gap: '8px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', background: 'transparent',
              border: '1px solid #e8e8e8', color: '#999',
              borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: font
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(citations)}
            style={{
              padding: '8px 24px', background: p.accent,
              border: 'none', color: '#fff', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', fontFamily: font, fontWeight: '600'
            }}
          >
            💾 Save Citations
          </button>
        </div>
      </div>
    </div>
  );
}