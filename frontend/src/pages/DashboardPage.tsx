import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface IFamilyTree {
  _id: string;
  title: string;
  description?: string;
  memberCount: number;
  generationCount: number;
  createdAt: string;
  updatedAt: string;
  coverHeritage?: string;
}

export default function DashboardPage() {
  const { user, logout, isGenealogist } = useAuth();
  const navigate = useNavigate();

  const [trees, setTrees] = useState<IFamilyTree[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      const token = localStorage.getItem('genea_token');
      const res = await fetch('http://localhost:5500/api/trees', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch trees');
      const data = await res.json();
      setTrees(data);
    } catch (err) {
      setError('Could not load your family trees.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewTree = async () => {
    try {
      const token = localStorage.getItem('genea_token');
      const res = await fetch('http://localhost:5500/api/trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'New Family Tree' })
      });

      const data = await res.json();
      navigate(`/editor/${data._id}`);
    } catch (err) {
      setError('Could not create a new tree.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="font-serif text-xl text-stone-800">Genea</span>
        </div>

        <div className="flex items-center gap-4">
          {isGenealogist && (
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-medium">
              🔍 Genealogist
            </span>
          )}
          <span className="text-stone-400 text-sm">Welcome, {user?.name}</span>
          <button
            onClick={logout}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-stone-800">Your Family Trees</h1>
            <p className="text-stone-400 text-sm mt-1 font-light">
              {trees.length === 0
                ? 'Start by creating your first tree'
                : `${trees.length} tree${trees.length > 1 ? 's' : ''} in your collection`}
            </p>
          </div>

          <button
            onClick={handleNewTree}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <span>＋</span>
            <span>New Tree</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl animate-spin">🌳</div>
              <p className="text-stone-400 text-sm font-light">Loading your trees...</p>
            </div>
          </div>
        ) : trees.length === 0 ? (

          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="font-serif text-xl text-stone-600 mb-2">No trees yet</h3>
            <p className="text-stone-400 text-sm font-light mb-6 max-w-sm">
              Create your first family tree and start adding your ancestors going back to the 1700s.
            </p>
            <button
              onClick={handleNewTree}
              className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Create your first tree
            </button>
          </div>
        ) : (

          /* Tree Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map(tree => (
              <div
                key={tree._id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/editor/${tree._id}`)}
              >
                {/* Tree Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">🌳</div>
                  <span className="text-[10px] text-stone-300 font-mono">
                    {new Date(tree.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Tree Info */}
                <h3 className="font-serif text-lg text-stone-800 group-hover:text-amber-700 transition-colors">
                  {tree.title}
                </h3>
                {tree.description && (
                  <p className="text-stone-400 text-xs mt-1 font-light line-clamp-2">
                    {tree.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                  <div className="text-center">
                    <div className="text-stone-800 font-medium text-sm">{tree.memberCount}</div>
                    <div className="text-stone-400 text-[10px] uppercase tracking-wider">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-stone-800 font-medium text-sm">{tree.generationCount}</div>
                    <div className="text-stone-400 text-[10px] uppercase tracking-wider">Generations</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/editor/${tree._id}`); }}
                    className="flex-1 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-xl text-xs text-stone-500 hover:text-amber-700 transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/presentation/${tree._id}`); }}
                    className="flex-1 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-xl text-xs text-stone-500 hover:text-amber-700 transition-all"
                  >
                    🎬 Present
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/print/${tree._id}`); }}
                    className="flex-1 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-xl text-xs text-stone-500 hover:text-amber-700 transition-all"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Genealogist Report Banner */}
        {isGenealogist && trees.length > 0 && (
          <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="font-serif text-stone-700 font-medium">📊 Research Reports</h4>
              <p className="text-stone-500 text-xs mt-1 font-light">
                View time tracking and auto-generated research reports for your presentations.
              </p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-medium transition-colors"
            >
              View Reports
            </button>
          </div>
        )}
      </main>
    </div>
  );
}