import React from 'react';
import { useNavigate } from 'react-router-dom';

interface IFeature {
  icon: string;
  title: string;
  description: string;
}

interface ITimelineEvent {
  year: string;
  title: string;
  description: string;
}

const FEATURES: IFeature[] = [
  {
    icon: '🌳',
    title: 'Interactive Family Trees',
    description: 'Build beautiful drag-and-drop trees spanning from the 1700s to the present with custom layouts and pastel palettes.'
  },
  {
    icon: '🎬',
    title: 'Presentation Mode',
    description: 'Present your family story slide by slide at family reunions, meetings, or events with fullscreen support and keyboard navigation.'
  },
  {
    icon: '⏱️',
    title: 'Research Time Tracking',
    description: 'Genealogists can track exactly how long each slide takes during presentations and generate automatic research reports.'
  },
  {
    icon: '📚',
    title: 'Chicago-Style Citations',
    description: 'Cite every source professionally using Chicago Manual of Style formatting — books, census records, newspapers, oral histories and more.'
  },
  {
    icon: '🌍',
    title: 'Heritage Stickers',
    description: 'Tag family members with beautiful heritage stickers representing their country of origin with pastel color themes.'
  },
  {
    icon: '🖨️',
    title: 'Print & Export',
    description: 'Download your tree as HTML or print it directly — four generation charts, member cards, citations page and research reports.'
  },
  {
    icon: '🔗',
    title: 'Share Your Tree',
    description: 'Share a public link to your family tree so relatives anywhere in the world can view it without needing an account.'
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Living family members are protected automatically. You control what is public and what stays private.'
  },
];

const TIMELINE: ITimelineEvent[] = [
  {
    year: '1700s',
    title: 'The Roots',
    description: 'The earliest ancestors in our family records, documented through church records, land deeds and colonial census data.'
  },
  {
    year: '1800s',
    title: 'Migration & Growth',
    description: 'Family branches spread across Central America and Europe, leaving trails in immigration records and vital documents.'
  },
  {
    year: '1900s',
    title: 'Living Memory',
    description: 'Oral histories, photographs and personal letters bring the family story into living memory.'
  },
  {
    year: 'Today',
    title: 'Your Generation',
    description: 'The story continues. Genea helps you document, preserve and share it for generations to come.'
  },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <span className="text-2xl">🌳</span>
          <span className="font-serif text-xl text-stone-800">Genea</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="text-7xl mb-6">🌳</div>
        <h1 className="font-serif text-5xl text-stone-800 tracking-wide mb-4">
          About Genea
        </h1>
        <p className="text-stone-400 text-lg font-light leading-relaxed max-w-2xl mx-auto">
          A beautiful genealogy presentation tool built to help families
          discover, document and share their story — from the 1700s to the present day.
        </p>
      </section>

      {/* The Story */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-10">
          <h2 className="font-serif text-3xl text-stone-800 mb-6">The Story Behind Genea</h2>
          <div className="flex flex-col gap-4 text-stone-500 text-sm font-light leading-relaxed">
            <p>
              Genea was born out of a real need — preparing for a family reunion and wanting to
              display a family tree spanning from the late 1700s all the way to the present,
              with beautiful layouts, heritage stickers, pastel palettes and professionally
              cited sources.
            </p>
            <p>
              Most genealogy tools are built for researchers, not for storytellers. They are
              powerful but complicated — not designed for the moment you stand in front of your
              family and say, <span className="italic text-stone-600">"Let me show you where we came from."</span>
            </p>
            <p>
              Genea is different. It is designed to be both rigorous and beautiful — combining
              Chicago Manual of Style citations with elegant pastel card layouts, so your
              research looks as good as it reads.
            </p>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-4xl flex-shrink-0">
              🔍
            </div>
            <div>
              <h2 className="font-serif text-2xl text-stone-800">The Author</h2>
              <p className="text-amber-700 text-sm font-medium mt-1">
                Genealogist & Developer
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-stone-500 text-sm font-light leading-relaxed">
            <p>
              Built by a genealogist with a passion for both family history and technology.
              Every feature in Genea comes from real experience — hours spent in archives,
              deciphering handwritten census records, tracing migration routes and trying to
              explain a 300-year family tree to relatives at a reunion.
            </p>
            <p>
              The Chicago citation formatter, the heritage stickers, the presentation time
              tracker — these are not abstract features. They are answers to real problems
              faced while doing real genealogy research.
            </p>
            <p className="text-stone-600 font-medium italic">
              "Every family has a story worth telling beautifully."
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-serif text-3xl text-stone-800 text-center mb-10">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-all duration-300 hover:border-amber-200"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-serif text-stone-800 text-sm font-medium mb-2">
                {feature.title}
              </h3>
              <p className="text-stone-400 text-xs font-light leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="font-serif text-3xl text-stone-800 text-center mb-10">
          A Story Spanning Centuries
        </h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-stone-200" />

          <div className="flex flex-col gap-8">
            {TIMELINE.map((event, i) => (
              <div key={i} className="flex items-start gap-6 pl-2">
                {/* Dot */}
                <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center flex-shrink-0 z-10">
                  <span className="text-amber-700 text-xs font-mono font-bold">
                    {event.year.length > 4 ? '◆' : event.year.slice(-2)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="text-amber-700 text-xs font-mono mb-1">{event.year}</div>
                  <h3 className="font-serif text-stone-800 text-lg mb-1">{event.title}</h3>
                  <p className="text-stone-400 text-sm font-light leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Account Types */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="font-serif text-3xl text-stone-800 text-center mb-10">
          Choose your role
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Family Member */}
          <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center hover:shadow-md transition-all">
            <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="font-serif text-xl text-stone-800 mb-2">Family Member</h3>
            <p className="text-stone-400 text-sm font-light leading-relaxed mb-6">
              View and explore family trees shared with you.
              See your heritage, discover relatives and enjoy
              beautiful presentations of your family story.
            </p>
            <ul className="text-left flex flex-col gap-2 mb-6">
              {[
                'View shared family trees',
                'Explore member cards',
                'See heritage stickers',
                'Download & print trees',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-stone-500 text-xs">
                  <span className="text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
            >
              Join as Family Member
            </button>
          </div>

          {/* Genealogist */}
          <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 text-center hover:shadow-md transition-all">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-xl text-stone-800 mb-2">Genealogist</h3>
            <p className="text-stone-400 text-sm font-light leading-relaxed mb-6">
              Build, present and document family trees
              professionally. Track your research time and
              generate reports automatically.
            </p>
            <ul className="text-left flex flex-col gap-2 mb-6">
              {[
                'Build & edit family trees',
                'Full presentation mode',
                'Research time tracking',
                'Auto research reports',
                'Chicago-style citations',
                'Share public trees',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-stone-500 text-xs">
                  <span className="text-amber-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Join as Genealogist
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-12">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="font-serif text-3xl text-stone-800 mb-3">
            Start your family story today
          </h2>
          <p className="text-stone-400 text-sm font-light mb-8 max-w-sm mx-auto">
            Free to start. Beautiful from day one.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Get started free →
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-sm font-medium transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <span className="font-serif text-stone-600">Genea</span>
          </div>
          <p className="text-stone-300 text-xs font-light">
            Built with care for families everywhere
          </p>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <button onClick={() => navigate('/login')} className="hover:text-stone-600 transition-colors">Sign in</button>
            <button onClick={() => navigate('/register')} className="hover:text-stone-600 transition-colors">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
}