import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
}

interface ITree {
  _id: string;
  title: string;
  description?: string;
  ownerName?: string;
  isPublic: boolean;
}

type ViewMode = 'fourgen' | 'cards';

export default function SharePage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();

  const [tree, setTree] = useState<ITree | null>(null);
  const [members, setMembers] = useState<IFamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('fourgen');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchPublicTree();
  }, [treeId]);

  const fetchPublicTree = async () => {
    try {
      const [treeRes, membersRes] = await Promise.all([
        fetch(`http://localhost:5500/api/trees/public/${treeId}`),
        fetch(`http://localhost:5500/api/trees/public/${treeId}/members`)
      ]);

      if (!treeRes.ok) {
        setError('This family tree is private or does not exist.');
        return;
      }

      const treeData = await treeRes.json();
      const membersData = await membersRes.json();

      setTree(treeData);
      setMembers(membersData);
    } catch {
      setError('Could not load this family tree.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-spin">🌳</div>
          <p className="text-stone-400 text-sm font-light">Loading family tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-serif text-2xl text-stone-700 mb-2">Tree Not Found</h2>
          <p className="text-stone-400 text-sm font-light mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Sign in to Genea
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Header — hidden on print */}
      <div className="print:hidden bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">

          {/* Branding */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <span className="font-serif text-xl text-stone-800">Genea</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 mr-2">
              <button
                onClick={() => setViewMode('fourgen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'fourgen'
                    ? 'bg-white shadow-sm text-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                📊 Tree View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white shadow-sm text-stone-800'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                🃏 Card View
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                copySuccess
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-amber-200 hover:text-amber-700'
              }`}
            >
              {copySuccess ? '✅ Copied!' : '🔗 Copy Link'}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-600 rounded-xl text-xs font-medium transition-colors"
            >
              🖨️ Print
            </button>

            {/* Sign up CTA */}
            <button
              onClick={() => navigate('/register')}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-medium transition-colors"
            >
              Create your own tree →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Tree Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="font-serif text-4xl text-stone-800 tracking-wide mb-2">
            {tree?.title}
          </h1>
          {tree?.description && (
            <p className="text-stone-400 text-sm font-light max-w-xl mx-auto">
              {tree.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            {tree?.ownerName && (
              <span className="text-stone-400 text-xs font-light">
                Shared by <span className="text-stone-600 font-medium">{tree.ownerName}</span>
              </span>
            )}
            <span className="text-stone-300 text-xs">·</span>
            <span className="text-stone-400 text-xs font-light">
              {members.length} family members
            </span>
            <span className="text-stone-300 text-xs">·</span>
            <span className="text-stone-400 text-xs font-light">
              {Math.max(...members.map(m => m.generation ?? 1))} generations
            </span>
          </div>
        </div>

        {/* Heritage Legend */}
        {Array.from(new Set(members.map(m => m.heritage).filter(Boolean))).length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {Array.from(new Set(members.map(m => m.heritage).filter(Boolean))).map(heritage => (
              <span
                key={heritage}
                className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs text-stone-500 font-light"
              >
                🌍 {heritage}
              </span>
            ))}
          </div>
        )}

        {/* Tree View */}
        {viewMode === 'fourgen' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
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
              title={tree?.title}
            />
          </div>
        )}

        {/* Card View */}
        {viewMode === 'cards' && (
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
        )}

        {/* Footer CTA */}
        <div className="print:hidden mt-12 p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center">
          <div className="text-3xl mb-3">🌱</div>
          <h3 className="font-serif text-xl text-stone-700 mb-2">
            Build your own family tree
          </h3>
          <p className="text-stone-400 text-sm font-light mb-5 max-w-sm mx-auto">
            Create beautiful genealogy presentations with pastel palettes, heritage stickers, and Chicago-style citations.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Get started free →
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-6 py-3 bg-white border border-stone-200 text-stone-600 hover:border-amber-200 hover:text-amber-700 rounded-xl text-sm font-medium transition-colors"
            >
              Learn more
            </button>
          </div>
        </div>
      </main>

      {/* Print Footer */}
      <div className="hidden print:block text-center text-stone-300 text-xs mt-8 pb-4">
        Generated by Genea · {window.location.href}
      </div>
    </div>
  );
}