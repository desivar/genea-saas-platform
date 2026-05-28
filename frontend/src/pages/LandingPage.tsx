import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🌳',
    title: 'Interactive Family Trees',
    description: 'Build drag-and-drop trees spanning from the 1700s to the present with artistic nodes and heritage stickers.'
  },
  {
    icon: '🎬',
    title: 'Presentation Builder',
    description: 'Create stunning slide-by-slide genealogy presentations with 9 slide types, 5 palettes and 8 historical fonts.'
  },
  {
    icon: '📚',
    title: 'Chicago Citations',
    description: 'Every source professionally formatted in Chicago Manual of Style — books, census, newspapers, oral histories.'
  },
  {
    icon: '🌍',
    title: 'Heritage Stickers',
    description: 'Tag family members with beautiful heritage stickers representing 9+ countries of origin.'
  },
  {
    icon: '⏱️',
    title: 'Research Time Tracker',
    description: 'Track how long you spend on each slide and generate automatic research reports.'
  },
  {
    icon: '🖨️',
    title: 'Print & Export',
    description: 'Export as HTML or print a beautiful booklet — four-gen charts, member cards, full citations.'
  },
];

const SLIDE_PREVIEWS = [
  { icon: '📖', label: 'Cover Slide', color: '#f9e8d0' },
  { icon: '👤', label: 'Person Profile', color: '#e8d0f9' },
  { icon: '📅', label: 'Timeline', color: '#d0e8f9' },
  { icon: '🌍', label: 'Heritage', color: '#d0f9e8' },
  { icon: '📊', label: 'Facts & Stats', color: '#f9d0d0' },
  { icon: '📸', label: 'Photo & Story', color: '#f9f0d0' },
];

const TESTIMONIAL = {
  quote: "Genea helped me present 240 years of our family history in a way that moved everyone to tears. Our reunion will never be the same.",
  author: "A Genealogist",
  role: "7 Generations Documented"
};

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      backgroundColor: '#fdf8ff',
      color: '#1e1a2e',
      overflowX: 'hidden'
    }}>

      {/* Google Fonts */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" />

      
      {/* ── Navbar ── */}
<nav style={{
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, // Increased z-index to stay on top
  backgroundColor: scrollY > 50 ? 'rgba(253,248,255,0.95)' : 'transparent',
  backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
  borderBottom: scrollY > 50 ? '1px solid #e8d5f5' : 'none',
  padding: '16px 48px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  transition: 'all 0.3s ease'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{ fontSize: '28px' }}>🌳</span>
    <span style={{ fontSize: '24px', fontWeight: '700', color: '#3d1f6e', letterSpacing: '-0.5px' }}>Genea</span>
  </div>
  {/* Keeps nav content interactive */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '32px', zIndex: 1001, position: 'relative' }}>
    <a href="#features" style={{ color: '#6b5b9e', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>Features</a>
    <a href="#how" style={{ color: '#6b5b9e', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>How it works</a>
    <a href="#about" style={{ color: '#6b5b9e', fontSize: '15px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>About</a>
    <button
      onClick={() => navigate('/login')}
      style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #9b7fd4', color: '#6b5b9e', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}
    >
      Sign in
    </button>
    <button
      onClick={() => navigate('/register')}
      style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #9b7fd4, #c084fc)', border: 'none', color: '#fff', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(155,127,212,0.4)' }}
    >
      Get started free
    </button>
  </div>
</nav>

{/* ── Hero ── */}
<section ref={heroRef} style={{
  minHeight: '100vh',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', padding: '120px 24px 80px',
  background: 'radial-gradient(ellipse at 50% 0%, #f0e6ff 0%, #fdf8ff 60%)',
  position: 'relative',
  zIndex: 1 // Gives the hero a low base layer
}}>

  {/* Decorative orbs (Ensured pointerEvents: 'none' and low zIndex) */}
  <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, #e9d5ff40, transparent)', pointerEvents: 'none', zIndex: -1 }} />
  <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, #fce7f340, transparent)', pointerEvents: 'none', zIndex: -1 }} />
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '24px',
          backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe',
          fontSize: '13px', color: '#7c3aed', marginBottom: '32px',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <span>✨</span>
          <span>The professional genealogy presentation tool</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 88px)',
          fontWeight: '700', lineHeight: '1.05',
          color: '#1e1a2e', maxWidth: '900px',
          marginBottom: '24px', letterSpacing: '-2px'
        }}>
          Tell your family story{' '}
          <span style={{ color: '#9b7fd4', fontStyle: 'italic' }}>beautifully</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '20px', color: '#6b5b9e', maxWidth: '580px',
          lineHeight: '1.6', marginBottom: '48px',
          fontFamily: "'DM Sans', sans-serif", fontWeight: '300'
        }}>
          Build stunning genealogy presentations with family trees, timelines, heritage stickers and Chicago-style citations — all in one elegant tool.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #9b7fd4, #c084fc)',
              border: 'none', color: '#fff', borderRadius: '32px',
              cursor: 'pointer', fontSize: '17px', fontWeight: '500',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 8px 32px rgba(155,127,212,0.5)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(155,127,212,0.6)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 8px 32px rgba(155,127,212,0.5)'; }}
          >
            Start building for free →
          </button>
          <button
            onClick={() => navigate('/about')}
            style={{
              padding: '16px 36px', background: 'transparent',
              border: '1px solid #d8b4fe', color: '#7c3aed',
              borderRadius: '32px', cursor: 'pointer', fontSize: '17px',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Learn more
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '48px', marginTop: '72px',
          padding: '24px 48px', backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: '20px', border: '1px solid #e9d5ff',
          backdropFilter: 'blur(8px)', flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {[
            { value: '9', label: 'Slide Templates' },
            { value: '8', label: 'Historical Fonts' },
            { value: '5', label: 'Color Palettes' },
            { value: '9+', label: 'Heritage Stickers' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#7c3aed', lineHeight: '1' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#9b7fd4', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Slide Previews ── */}
      <section style={{ padding: '80px 48px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#1e1a2e', marginBottom: '12px' }}>
              9 beautiful slide types
            </h2>
            <p style={{ fontSize: '18px', color: '#9b7fd4', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
              Everything you need to tell a complete family story
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {SLIDE_PREVIEWS.map(slide => (
              <div
                key={slide.label}
                style={{
                  backgroundColor: slide.color,
                  borderRadius: '16px', padding: '32px 24px',
                  textAlign: 'center', border: '1px solid rgba(255,255,255,0.8)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{slide.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e1a2e' }}>{slide.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 48px', background: 'linear-gradient(180deg, #fdf8ff 0%, #f5edff 100%)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#1e1a2e', marginBottom: '12px' }}>
              Built for serious genealogists
            </h2>
            <p style={{ fontSize: '18px', color: '#9b7fd4', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
              Every feature designed around real genealogy research workflows
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#fff', borderRadius: '20px',
                  padding: '28px 24px', border: '1px solid #e9d5ff',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(155,127,212,0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = '#c084fc';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = '#e9d5ff';
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e1a2e', marginBottom: '10px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#7c6b9e', lineHeight: '1.6', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '80px 48px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#1e1a2e', marginBottom: '12px' }}>
            How it works
          </h2>
          <p style={{ fontSize: '18px', color: '#9b7fd4', fontFamily: "'DM Sans', sans-serif", fontWeight: '300', marginBottom: '56px' }}>
            From sign up to family reunion in four steps
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { step: '01', icon: '📝', title: 'Register', description: 'Create your free account as a genealogist or family member.' },
              { step: '02', icon: '🎨', title: 'Build Slides', description: 'Add slides, fill in your family data, choose fonts and palettes.' },
              { step: '03', icon: '🌳', title: 'Add Your Tree', description: 'Enter family members with dates, places, photos and citations.' },
              { step: '04', icon: '🎬', title: 'Present & Share', description: 'Present at your family meeting, print a booklet or share a link.' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', margin: '0 auto 16px',
                  border: '2px solid #d8b4fe'
                }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '11px', color: '#c084fc', letterSpacing: '2px', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>
                  STEP {item.step}
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1e1a2e', marginBottom: '8px' }}>{item.title}</h4>
                <p style={{ fontSize: '13px', color: '#7c6b9e', lineHeight: '1.6', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section style={{
        padding: '80px 48px',
        background: 'linear-gradient(135deg, #9b7fd4, #c084fc)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px', opacity: 0.6 }}>"</div>
          <p style={{
            fontSize: '24px', fontStyle: 'italic', color: '#fff',
            lineHeight: '1.6', marginBottom: '32px', fontWeight: '300'
          }}>
            {TESTIMONIAL.quote}
          </p>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontFamily: "'DM Sans', sans-serif" }}>
            — {TESTIMONIAL.author} · {TESTIMONIAL.role}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" style={{ padding: '80px 48px', backgroundColor: '#fdf8ff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#1e1a2e', marginBottom: '24px' }}>
            Built from real research
          </h2>
          <p style={{ fontSize: '18px', color: '#7c6b9e', lineHeight: '1.8', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
            Genea was born from a real need — preparing for a family reunion and wanting to display a family tree spanning from the late 1700s to the present, with beautiful layouts, heritage stickers and professionally cited sources.
          </p>
          <p style={{ fontSize: '18px', color: '#7c6b9e', lineHeight: '1.8', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
            Most genealogy tools are built for researchers, not storytellers. Genea is different — combining Chicago Manual of Style citations with elegant presentation design, so your research looks as good as it reads.
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{
        padding: '80px 48px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 100%, #f0e6ff 0%, #fdf8ff 60%)'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>🌳</div>
          <h2 style={{ fontSize: '48px', fontWeight: '700', color: '#1e1a2e', marginBottom: '16px', letterSpacing: '-1px' }}>
            Start your family story today
          </h2>
          <p style={{ fontSize: '18px', color: '#9b7fd4', marginBottom: '40px', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
            Free to start. Beautiful from day one.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '18px 48px',
              background: 'linear-gradient(135deg, #9b7fd4, #c084fc)',
              border: 'none', color: '#fff', borderRadius: '32px',
              cursor: 'pointer', fontSize: '18px', fontWeight: '500',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 8px 32px rgba(155,127,212,0.5)'
            }}
          >
            Get started free →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: '32px 48px', backgroundColor: '#1e1a2e',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🌳</span>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#e9d5ff' }}>Genea</span>
        </div>
        <p style={{ color: '#6b5b9e', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
          Built with care for families everywhere
          @ 2026 Genea Software Inc.
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button onClick={() => navigate('/login')} style={{ color: '#6b5b9e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>Sign in</button>
          <button onClick={() => navigate('/register')} style={{ color: '#6b5b9e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>Register</button>
          <button onClick={() => navigate('/about')} style={{ color: '#6b5b9e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>About</button>
        </div>
      </footer>
    </div>
  );
}