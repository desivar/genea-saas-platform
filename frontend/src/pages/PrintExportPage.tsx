import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FourGenTree from '../components/FourGenTree';
import FamilyCard from '../components/FamilyCard';

interface IFamilyMember {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'Male' | 'Female' | 'Unknown';
  photoUrl?: string;
  heritage?: string;
  generation?: number;
  notes?: string;
  citations?: ICitation[];
}

interface ICitation {
  sourceTitle: string;
  footnoteText: string;
  author?: string;
  publicationYear?: number;
  repositoryName?: string;
  sourceUrl?: string;
}

type PrintLayout = 'fourgen' | 'cards' | 'report' | 'citations';

export default function PrintExportPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isGenealogist } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [members, setMembers] = useState<IFamilyMember[]>([]);
  const [treeTitle, setTreeTitle] = useState('Family Tree');
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState<PrintLayout>('fourgen');

  // Genealogist report data from URL params
  const isReport = searchParams.get('report') === 'true';
  const totalTime = parseInt(searchParams.get('total') ?? '0');
  const slideTimings: Record<number, number> = JSON.parse(
    decodeURIComponent(searchParams.get('timings') ?? '{}')
  );

  const token = localStorage.getItem('genea_token');

  useEffect(() => {
    fetchData();
    if (isReport) setLayout('report');
  }, [treeId]);

  const fetchData = async () => {
    try {
      const [treeRes, membersRes] = await Promise.all([
        fetch(`http://localhost:5500/api/trees/${treeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:5500/api/trees/${treeId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const treeData = await treeRes.json();
      const membersData = await membersRes.json();
      setTreeTitle(treeData.title);
      setMembers(membersData);
    } catch {
      console.error('Could not load print data.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    const content = printRef.current?.innerHTML ?? '';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${treeTitle}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: Georgia, serif; background: #fafaf9; padding: 2rem; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${treeTitle.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-spin">🌳</div>
          <p className="text-stone-400 text-sm font-light">Preparing document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">

      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/editor/${treeId}`)}
            className="text-stone-400 hover:text-stone-600 text-sm transition-colors"
          >
            ← Back
          </button>
          <span className="text-stone-200">|</span>
          <span className="font-serif text-stone-700">{treeTitle}</span>
        </div>

        {/* Center: Layout Selector */}
        <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
          {([
            { key: 'fourgen', label: '📊 4 Generations' },
            { key: 'cards', label: '🃏 Member Cards' },
            { key: 'citations', label: '📚 Citations' },
            ...(isGenealogist ? [{ key: 'report', label: '📋 Research Report' }] : [])
          ] as { key: PrintLayout; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setLayout(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                layout === key
                  ? 'bg-white shadow-sm text-stone-800'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadHTML}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 rounded-xl text-xs font-medium transition-colors"
          >
            ⬇️ Download HTML
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-medium transition-colors"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="max-w-5xl mx-auto my-8 bg-white rounded-3xl border border-stone-200 shadow-sm p-12 print:shadow-none print:rounded-none print:border-none print:my-0">

        {/* Document Header */}
        <div className="text-center mb-12 pb-8 border-b border-stone-100">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="font-serif text-4xl text-stone-800 tracking-wide">{treeTitle}</h1>
          <p className="text-stone-400 text-sm mt-2 font-light">
            {members.length} family members · Generated {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* 4 Generation Layout */}
        {layout === 'fourgen' && (
          <div>
            <h2 className="font-serif text-2xl text-stone-700 mb-6">Four Generations</h2>
            <FourGenTree
              familyData={members.map(m => ({
                id: m._id,
                name: `${m.firstName} ${m.lastName}`,
                birthYear: m.birthDate,
                deathYear: m.deathDate,
                generation: m.generation ?? 1,
                heritage: m.heritage,
                gender: m.gender,
                photoUrl: m.photoUrl,
              }))}
              title={treeTitle}
            />
          </div>
        )}

        {/* Member Cards Layout */}
        {layout === 'cards' && (
          <div>
            <h2 className="font-serif text-2xl text-stone-700 mb-6">Family Members</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => (
                <FamilyCard
                  key={member._id}
                  member={{
                    name: `${member.firstName} ${member.lastName}`,
                    birthYear: member.birthDate,
                    deathYear: member.deathDate,
                    photoUrl: member.photoUrl,
                    heritage: member.heritage,
                    gender: member.gender,
                    generation: member.generation,
                    quickFact: member.notes,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Citations Layout */}
        {layout === 'citations' && (
          <div>
            <h2 className="font-serif text-2xl text-stone-700 mb-6">Sources & Citations</h2>
            {members.some(m => m.citations && m.citations.length > 0) ? (
              <div className="flex flex-col gap-8">
                {members
                  .filter(m => m.citations && m.citations.length > 0)
                  .map((member, mi) => (
                    <div key={member._id}>
                      <h3 className="font-serif text-lg text-stone-700 mb-3 pb-2 border-b border-stone-100">
                        {member.firstName} {member.lastName}
                      </h3>
                      <ol className="flex flex-col gap-3">
                        {member.citations!.map((citation, ci) => (
                          <li key={ci} className="flex gap-3 text-sm">
                            <span className="text-stone-400 font-mono text-xs mt-0.5 flex-shrink-0">
                              {mi + 1}.{ci + 1}
                            </span>
                            <div>
                              <p className="text-stone-700 font-light leading-relaxed">
                                {citation.footnoteText}
                              </p>
                              {citation.sourceUrl && (
                                
                                  href={citation.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-amber-700 text-xs hover:underline mt-1 block"
                                >
                                  {citation.sourceUrl}
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-stone-400 text-sm font-light italic">
                No citations added yet. Add sources in the tree editor.
              </p>
            )}
          </div>
        )}

        {/* Research Report Layout — Genealogist Only */}
        {layout === 'report' && isGenealogist && (
          <div>
            <h2 className="font-serif text-2xl text-stone-700 mb-2">Research Report</h2>
            <p className="text-stone-400 text-sm font-light mb-8">
              Auto-generated presentation time log and family summary
            </p>

            {/* Time Summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <div className="font-serif text-3xl text-amber-700">{formatTime(totalTime)}</div>
                <div className="text-amber-600 text-xs uppercase tracking-wider mt-1">Total Time</div>
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
                <div className="font-serif text-3xl text-stone-700">{members.length}</div>
                <div className="text-stone-500 text-xs uppercase tracking-wider mt-1">Members</div>
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
                <div className="font-serif text-3xl text-stone-700">
                  {Object.keys(slideTimings).length}
                </div>
                <div className="text-stone-500 text-xs uppercase tracking-wider mt-1">Slides Covered</div>
              </div>
            </div>

            {/* Per-Slide Time Breakdown */}
            {Object.keys(slideTimings).length > 0 && (
              <div className="mb-8">
                <h3 className="font-serif text-lg text-stone-700 mb-4">Time Per Slide</h3>
                <div className="flex flex-col gap-2">
                  {Object.entries(slideTimings).map(([slideIndex, time]) => {
                    const pct = totalTime > 0 ? Math.round((time / totalTime) * 100) : 0;
                    return (
                      <div key={slideIndex} className="flex items-center gap-4">
                        <span className="text-stone-400 text-xs font-mono w-16 flex-shrink-0">
                          Slide {parseInt(slideIndex) + 1}
                        </span>
                        <div className="flex-1 bg-stone-100 rounded-full h-2">
                          <div
                            className="bg-amber-400 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-stone-500 text-xs font-mono w-16 text-right flex-shrink-0">
                          {formatTime(time)}
                        </span>
                        <span className="text-stone-300 text-xs w-8 text-right flex-shrink-0">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Family Summary */}
            <div className="mb-8">
              <h3 className="font-serif text-lg text-stone-700 mb-4">Family Summary</h3>
              <div className="grid grid-cols-2 gap-4">

                {/* Gender Breakdown */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                  <h4 className="text-xs uppercase tracking-wider text-stone-400 mb-3">By Gender</h4>
                  {['Male', 'Female', 'Unknown'].map(gender => {
                    const count = members.filter(m => m.gender === gender).length;
                    return count > 0 ? (
                      <div key={gender} className="flex justify-between text-sm py-1">
                        <span className="text-stone-600">{gender}</span>
                        <span className="text-stone-800 font-medium">{count}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                {/* Heritage Breakdown */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                  <h4 className="text-xs uppercase tracking-wider text-stone-400 mb-3">By Heritage</h4>
                  {Array.from(new Set(members.map(m => m.heritage).filter(Boolean))).map(heritage => {
                    const count = members.filter(m => m.heritage === heritage).length;
                    return (
                      <div key={heritage} className="flex justify-between text-sm py-1">
                        <span className="text-stone-600">{heritage}</span>
                        <span className="text-stone-800 font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Generation Breakdown */}
            <div>
              <h3 className="font-serif text-lg text-stone-700 mb-4">By Generation</h3>
              <div className="flex flex-col gap-2">
                {Array.from(new Set(members.map(m => m.generation ?? 1))).sort().map(gen => {
                  const count = members.filter(m => (m.generation ?? 1) === gen).length;
                  return (
                    <div key={gen} className="flex items-center gap-4">
                      <span className="text-stone-400 text-xs font-mono w-20 flex-shrink-0">
                        Generation {gen}
                      </span>
                      <div className="flex-1 bg-stone-100 rounded-full h-2">
                        <div
                          className="bg-stone-400 h-2 rounded-full"
                          style={{ width: `${(count / members.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-stone-500 text-xs font-mono w-8 text-right flex-shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Researcher Signature */}
            <div className="mt-12 pt-6 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-stone-400 text-xs font-light">Report generated by</p>
                <p className="text-stone-600 text-sm font-medium mt-0.5">
                  Genea — Genealogy Presentation Tool
                </p>
              </div>
              <p className="text-stone-300 text-xs font-mono">
                {new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}