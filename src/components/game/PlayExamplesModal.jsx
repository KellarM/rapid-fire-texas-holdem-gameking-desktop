import { useState } from 'react';

const SESSIONS = [
  {
    id: 'session_02',
    label: 'Session 02 — Only Rank Survives',
    result: 'Net: -$1.69',
    slides: [
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/c8871853d_session_02_flop.png',
        phase: 'PRE-DEAL → FLOP',
        caption: "Player bets Pocket Kings — K♣ K♠. Hedges with 5 of the 7 Rank bets and places bets on all 3 Black Color Board positions. Flop comes up 5♥, 10♦, 4♣. Board shows 2 Red, 1 Black. Kings take the early lead with One Pair.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/362e0cc9f_session_02_turn.png',
        phase: 'THE TURN',
        caption: "Turn: 4♥ — 4♣/2♠ hits Three of a Kind and steals the lead. A 3rd Red card appears — all Black Color Board bets are dead. Board shows 3 Low, 1 High. River bet opens: LOW 1.06:1 vs HIGH 0.79:1. Player maxes the cap on HIGH. \"Come on King, I need a King on the river!\"",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/cef12e139_session_02_river.png',
        phase: 'THE RIVER',
        caption: "River: 2♥ — LOW. The 4♣/2♠ hand completes a Full House — 4-4-4-2-2 — a decisive win. The player's HIGH River bet backfired. The 2♥ was exactly the card that killed it.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/a975d23c0_session_02_results.png',
        phase: 'THE RESULTS',
        caption: "Only the Rank — Full House — survives. 1 board out of 4 wins.\nTotal Win: $0.31\nTotal Bet: $2.00\nNet Result: -$1.69",
      },
    ],
  },
];

export default function PlayExamplesModal({ onClose }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  const panelStyle = {
    background: 'linear-gradient(160deg, #1a0f00 0%, #0f0800 100%)',
    border: '2px solid rgba(202,138,4,0.5)',
    borderRadius: '16px',
    width: '920px', maxWidth: '96vw',
    maxHeight: '94vh',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 12px 60px rgba(0,0,0,0.9)',
  };

  const btnStyle = {
    background: 'rgba(90,45,0,0.5)',
    border: '1px solid rgba(202,138,4,0.4)',
    color: '#e2d9a0', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 700, fontSize: '13px',
    padding: '6px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  };

  const navBtn = (disabled) => ({
    ...btnStyle,
    background: disabled ? 'rgba(30,15,0,0.3)' : 'rgba(90,45,0,0.6)',
    color: disabled ? 'rgba(226,217,160,0.3)' : '#e2d9a0',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '6px 16px',
  });

  // Session list view
  if (!selectedSession) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={panelStyle} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(202,138,4,0.3)',
          }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#facc15', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>
              🎬 PLAY EXAMPLES
            </span>
            <button style={btnStyle} onClick={onClose}>✕ Close</button>
          </div>

          <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
            <p style={{ fontSize: '12px', color: 'rgba(226,217,160,0.6)', marginBottom: '14px' }}>
              Select a session to watch a real played round with strategy commentary.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SESSIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSession(s); setSlideIndex(0); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                    border: '1px solid rgba(202,138,4,0.4)',
                    background: 'rgba(60,35,0,0.5)',
                    color: '#e2d9a0', fontWeight: 700, fontSize: '13px',
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(90,45,0,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(60,35,0,0.5)'}
                >
                  <span>{s.label}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(250,204,21,0.6)' }}>{s.result}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide player view
  const slide = selectedSession.slides[slideIndex];
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === selectedSession.slides.length - 1;

  return (
    <div style={overlayStyle} onClick={() => setSelectedSession(null)}>
      <div style={panelStyle} onClick={e => e.stopPropagation()}>

        {/* TOP BAR: Back | Session label | Phase | Nav buttons | Close */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid rgba(202,138,4,0.3)',
          gap: '12px', flexShrink: 0,
        }}>
          {/* Left: Back + Session name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setSelectedSession(null)}
              style={navBtn(false)}
            >
              ← Back
            </button>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#facc15', fontFamily: 'Oswald, sans-serif', whiteSpace: 'nowrap' }}>
              {selectedSession.label}
            </span>
          </div>

          {/* Center: Phase label */}
          <span style={{
            fontSize: '11px', fontWeight: 700, color: 'rgba(250,204,21,0.8)',
            letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>
            {slide.phase}
          </span>

          {/* Right: Nav + Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={navBtn(isFirst)} disabled={isFirst} onClick={() => setSlideIndex(i => i - 1)}>
              ← Prev
            </button>
            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              {selectedSession.slides.map((_, i) => (
                <div key={i} onClick={() => setSlideIndex(i)} style={{
                  width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                  background: i === slideIndex ? '#facc15' : 'rgba(202,138,4,0.3)',
                  transition: 'background 0.15s',
                }} />
              ))}
            </div>
            <button style={navBtn(isLast)} disabled={isLast} onClick={() => setSlideIndex(i => i + 1)}>
              Next →
            </button>
            <button style={btnStyle} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* SCREENSHOT — full, unblocked, centered */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px 20px', minHeight: '0',
          overflow: 'hidden',
        }}>
          <img
            src={slide.image}
            alt={slide.phase}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              border: '1px solid rgba(202,138,4,0.25)',
              display: 'block',
            }}
          />
        </div>

        {/* CAPTION — below the screenshot, never overlapping */}
        <div style={{
          padding: '14px 24px',
          background: 'rgba(0,0,0,0.4)',
          borderTop: '1px solid rgba(202,138,4,0.2)',
          flexShrink: 0,
        }}>
          <p style={{
            fontSize: '14px', color: '#e2d9a0', lineHeight: '1.65', margin: 0,
            whiteSpace: 'pre-line', textAlign: 'center',
          }}>
            {slide.caption}
          </p>
        </div>

      </div>
    </div>
  );
}
