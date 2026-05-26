import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FamilyCard from '../components/FamilyCard';
import FourGenTree from '../components/FourGenTree';

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
  quickFact?: string;
}

interface ISlide {
  id: string;
  type: 'cover' | 'member' | 'fourgen' | 'timeline' | 'citations';
  title: string;
  member?: IFamilyMember;
}

type PaletteKey = 'pastel' | 'sepia' | 'sage' | 'rose';

const PALETTES: Record<PaletteKey, {
  bg: string;
  card: string;
  text: string;
  accent: string;
  border: string;
}> = {
  pastel: {
    bg: 'bg-stone-50',
    card: 'bg-white',
    text: 'text-stone-800',
    accent: 'text-amber-700',
    border: 'border-stone-200',
  },
  sepia: {
    bg: 'bg-amber-50',
    card: 'bg-amber-50/60',
    text: 'text-amber-900',
    accent: 'text-amber-700',
    border: 'border-amber-200',
  },
  sage: {
    bg: 'bg-green-50',
    card: 'bg-green-50/60',
    text: 'text-green-900',
    accent: 'text-green-700',
    border: 'border-green-200',
  },
  rose: {
    bg: 'bg-rose-50',
    card: 'bg-rose-50/60',
    text: 'text-rose-900',
    accent: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export default function PresentationPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const { isGenealogist } = useAuth();

  const [members, setMembers] = useState<IFamilyMember[]>([]);
  const [slides, setSlides] = useState<ISlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [palette, setPalette] = useState<PaletteKey>('pastel');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [treeTitle, setTreeTitle] = useState('Family Tree');

  // ⏱️ Genealogist Time Tracker
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [slideTimings, setSlideTimings] = useState<Record<number, number>>({});
  const [slideStartTime, setSlideStartTime] = useState<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = localStorage.getItem('genea_token');
  const colors = PALETTES[palette];

  // Fetch tree data
  useEffect(() => {
    fetchData();
  }, [treeId]);

  // Build slides from members
  useEffect(() => {
    if (members.length === 0) return;

    const builtSlides: ISlide[] = [
      // Cover slide
      {
        id: 'cover',
        type: 'cover',
        title: treeTitle,
      },
      // One slide per member
      ...members.map(member => ({
        id: member._id,
        type: 'member' as const,
        title: `${member.firstName} ${member.lastName}`,
        member,
      })),
      // 4 Generation overview
      {
        id: 'fourgen',
        type: 'fourgen',
        title: 'Four Generations Overview',
      },
      // Citations slide
      {
        id: 'citations',
        type: 'citations',
        title: 'Sources & Citations',
      },
    ];

    setSlides(builtSlides);
  }, [members, treeTitle]);

  // Timer logic for genealogists
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

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
      console.error('Could not load presentation data.');
    } finally {
      setIsLoading(false);
    }
  };

  const recordSlideTime = useCallback((slideIndex: number) => {
    const timeSpent = Math.floor((Date.now() - slideStartTime) / 1000);
    setSlideTimings(prev => ({
      ...prev,
      [slideIndex]: (prev[slideIndex] ?? 0) + timeSpent
    }));
    setSlideStartTime(Date.now());
  }, [slideStartTime]);

  const goToSlide = useCallback((index: number) => {
    if (isGenealogist) recordSlideTime(currentSlide);
    setCurrentSlide(index);
  }, [currentSlide, isGenealogist, recordSlideTime]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1);
  }, [currentSlide, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextSlide, prevSlide]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const generateReport = () => {
    navigate(`/print/${treeId}?report=true&timings=${encodeURIComponent(JSON.stringify(slideTimings))}&total=${elapsedTime}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-spin">🌳</div>
          <p className="text-stone-400 text-sm font-light">Preparing presentation...</p>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className={`min-h-screen ${colors.bg} flex flex-col`}>

      {/* Top Bar */}
      {!isFullscreen && (
        <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/editor/${treeId}`)}
              className="text-stone-400 hover:text-stone-600 text-sm transition-colors"
            >
              ← Editor
            </button>
            <span className="text-stone-200">|</span>
            <span className="font-serif text-stone-700">{treeTitle}</span>
          </div>

          {/* Center: Palette */}
          <div className="flex items-center gap-2">
            {(Object.keys(PALETTES) as PaletteKey[]).map(key => (
              <button
                key={key}
                onClick={() => setPalette(key)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  palette === key
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {/* Right: Timer + Actions */}
          <div className="flex items-center gap-3">

            {/* ⏱️ Genealogist Timer */}
            {isGenealogist && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-amber-700 font-mono text-sm font-medium">
                  ⏱️ {formatTime(elapsedTime)}
                </span>
                <button
                  onClick={() => setIsTimerRunning(prev => !prev)}
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
                >
                  {isTimerRunning ? '⏸ Pause' : '▶ Start'}
                </button>
                {elapsedTime > 0 && (
                  <button
                    onClick={generateReport}
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
                  >
                    📊 Report
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(true)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-medium transition-colors"
            >
              ⛶ Fullscreen
            </button>

            <button
              onClick={() => navigate(`/print/${treeId}`)}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-medium transition-colors"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      )}

      {/* Slide Area */}
      <div className={`flex-1 flex items-center justify-center p-8 ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${colors.bg}`}>

        {/* Slide Content */}
        <div className={`w-full max-w-4xl min-h-[500px] ${colors.card} rounded-3xl border ${colors.border} shadow-lg p-12 flex flex-col items-center justify-center transition-all duration-500`}>

          {/* Cover Slide */}
          {slide?.type === 'cover' && (
            <div className="text-center">
              <div className="text-7xl mb-6">🌳</div>
              <h1 className={`font-serif text-5xl ${colors.text} mb-4 tracking-wide`}>
                {treeTitle}
              </h1>
              <p className={`${colors.accent} text-lg font-light tracking-widest uppercase`}>
                A Family Story
              </p>
              <p className="text-stone-400 text-sm mt-6 font-light">
                {members.length} family members · {new Date().getFullYear()}
              </p>
            </div>
          )}

          {/* Member Slide */}
          {slide?.type === 'member' && slide.member && (
            <div className="w-full flex flex-col items-center gap-8">
              <div className="flex items-center gap-8">
                {/* Photo */}
                <div className="w-32 h-32 rounded-full bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center text-stone-300 text-4xl flex-shrink-0">
                  {slide.member.photoUrl
                    ? <img src={slide.member.photoUrl} className="w-full h-full object-cover" alt={slide.member.firstName} />
                    : '📷'
                  }
                </div>

                {/* Info */}
                <div>
                  <h2 className={`font-serif text-4xl ${colors.text} mb-2`}>
                    {slide.member.firstName} {slide.member.lastName}
                  </h2>
                  <p className="text-stone-400 text-lg font-light">
                    {slide.member.birthDate} — {slide.member.deathDate || 'Present'}
                  </p>
                  {slide.member.heritage && (
                    <p className={`${colors.accent} text-sm mt-1 font-medium`}>
                      🌍 {slide.member.heritage}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {slide.member.notes && (
                <div className={`w-full max-w-2xl p-6 bg-stone-50 rounded-2xl border ${colors.border}`}>
                  <p className={`${colors.text} text-sm font-light leading-relaxed italic`}>
                    "{slide.member.notes}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Four Generation Slide */}
          {slide?.type === 'fourgen' && (
            <div className="w-full">
              <h2 className={`font-serif text-3xl ${colors.text} mb-6 text-center`}>
                Four Generations
              </h2>
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
              />
            </div>
          )}

          {/* Citations Slide */}
          {slide?.type === 'citations' && (
            <div className="w-full text-center">
              <h2 className={`font-serif text-3xl ${colors.text} mb-6`}>
                Sources & Citations
              </h2>
              <p className="text-stone-400 text-sm font-light">
                Citations will appear here from your member records.
              </p>
            </div>
          )}
        </div>

        {/* Fullscreen Exit */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs transition-colors z-50"
          >
            ✕ Exit
          </button>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`${isFullscreen ? 'fixed bottom-0 left-0 right-0 z-50' : ''} bg-white/80 backdrop-blur border-t border-stone-200 px-6 py-4 flex items-center justify-between`}>

        {/* Slide Counter */}
        <span className="text-stone-400 text-xs font-mono">
          {currentSlide + 1} / {slides.length}
        </span>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm text-stone-600 disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>

          {/* Slide Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`rounded-full transition-all ${
                  i === currentSlide
                    ? 'w-4 h-2 bg-amber-700'
                    : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm text-stone-600 disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Slide Title */}
        <span className="text-stone-400 text-xs font-light truncate max-w-[200px]">
          {slide?.title}
        </span>
      </div>
    </div>
  );
}