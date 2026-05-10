import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Menu, X } from 'lucide-react';
import { LogoMark } from './LogoMark';

interface NavbarProps {
  gameMode?: boolean;
  demoMode?: boolean;
}

const landingLinks = [
  { label: 'HOW IT WORKS',  href: '#how-it-works' },
  { label: 'CARDS',         href: '#cards' },
  { label: 'LEADERBOARD',   href: '/leaderboard' },
  { label: 'DOCS',          href: '/docs' },
];

const Navbar: React.FC<NavbarProps> = ({ gameMode = false, demoMode = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: '#F0EDDA',
      borderBottom: '2px solid #111',
    }}>
      <div className="container mx-auto flex items-center justify-between h-14 px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" style={{ textDecoration: 'none' }}>
          <LogoMark height={38} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', fontWeight: 600, color: '#111',
            border: '1.5px solid #111', padding: '1px 6px',
            letterSpacing: '0.08em',
          }}>
            DEVNET
          </span>
          {demoMode && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', fontWeight: 600,
              background: 'rgba(217,26,110,0.1)', color: '#D91A6E',
              border: '1.5px solid #D91A6E', padding: '1px 6px',
              letterSpacing: '0.08em',
            }}>
              DEMO
            </span>
          )}
        </Link>

        {/* Desktop links */}
        {!gameMode && (
          <div className="hidden md:flex items-center gap-8">
            {landingLinks.map(link => {
              const isPath = link.href.startsWith('/');
              return isPath ? (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem', fontWeight: 600, color: '#555',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem', fontWeight: 600, color: '#555',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    textDecoration: 'none', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#111')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!gameMode ? (
            <button
              onClick={() => navigate('/game')}
              className="hidden md:flex items-center gap-2 sketch-btn px-4 py-2 text-xs"
            >
              <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
                <polygon points="1,1 11,6 1,11" />
              </svg>
              PLAY NOW
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem', color: '#555',
                background: 'transparent', border: '1.5px solid #555',
                padding: '4px 12px', cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
              className="hidden md:block"
            >
              ← LOBBY
            </button>
          )}

          <div className="hidden sm:block scale-90 origin-right">
            <WalletMultiButton />
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              padding: '6px', background: 'transparent',
              border: '2px solid #111', cursor: 'pointer', color: '#111',
            }}
            className="md:hidden"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: '2px solid #111', background: '#F0EDDA' }}>
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {!gameMode && landingLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.7rem', fontWeight: 600, color: '#555',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  textDecoration: 'none', padding: '4px 0',
                }}
              >
                → {link.label}
              </a>
            ))}
            <button
              onClick={() => { navigate('/game'); setMobileOpen(false); }}
              className="sketch-btn py-2.5 text-xs mt-2"
            >
              PLAY NOW
            </button>
            <div className="sm:hidden pt-1 scale-90 origin-left">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
