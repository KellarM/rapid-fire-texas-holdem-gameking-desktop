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
  {
    id: 'session_03',
    label: 'Session 03 — Three of a Kind / 3 Boards Win',
    result: 'Net: +$1.32',
    slides: [
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/1c7595a88_session_03_flop.png',
        phase: 'PRE-DEAL → FLOP',
        caption: "Player bets the 4/2 hand at 7.3:1. Targets the Flush Rank bet and bets 3 Black on the Color Board. Flop comes up J♣, A♥, 4♥. Board shows 2 Red, 1 Black. A♦/10♥ leads with One Pair.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/03da0f995_session_03_turn.png',
        phase: 'THE TURN',
        caption: "Q♦/J♥ now takes the lead by 2 Pair with a Q♠ on the Turn.\nColor board is still open with 2 Red & 2 Black cards showing.\nWith 3 High cards & 1 low card showing, Low is the favourite.\nPlayer bets the max cap on Low \"Come on Low card, make it Low & Black!!\"",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/521514cd1_session_03_river.png',
        phase: 'THE RIVER',
        caption: "River: 4♣ — LOW. The 4/2 hand completes Three of a Kind — 4-4-4. Board finishes 2 Red, 3 Black.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/11ec1dc21_session_03_results.png',
        phase: 'THE RESULTS',
        caption: "3 out of 4 boards win — Card, Color, and River.\nThe Rank Flush bet lost — the winning hand was Three of a Kind.\nTotal Win: $2.12 | Total Bet: $0.80 | Net Result: +$1.32",
      },
    ],
  },
  {
    id: 'session_04',
    label: 'Session 04 — Full House Overtake (Only 2 Boards Win)',
    result: 'Net: +$2.42',
    slides: [
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/f3497b30b_session_04_flop.png',
        phase: 'PRE-DEAL → FLOP',
        caption: "Player bets only 1 card hand the 8/6 and targets both Flush and Straight Rank bets. Chooses to bet the cap on 3 black. Flop comes up 6♥, 7♦, 6♦. Board shows 3 Red, 0 Black. The Color board black bet is already lost. 7/7 takes a quick lead with a full house.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/604d30754_session_04_turn.png',
        phase: 'THE TURN',
        caption: "Dealer turns over: 8♥. 7/7 still leads with 7s full of 6s. 8/6 now has a Full House too — 6s full of 8s — but it is not enough. Board shows 3 Low, 1 High. HIGH is the favourite. Player bets the max cap on HIGH.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/23d20b5ec_session_04_river.png',
        phase: 'THE RIVER',
        caption: "River: 8♠ — HIGH. The 8/6 hand completes a Full House — 8-8-8-6-6 — overtaking 7/7. Board finishes 4 Red, 1 Black.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/ad4c0a878_session_04_results.png',
        phase: 'THE RESULTS',
        caption: "Huge win on the river card. 2 out of 4 boards win — Card and River.\nTotal Win: $5.62 | Total Bet: $3.20 | Net Result: +$2.42",
      },
    ],
  },
  {
    id: 'session_05',
    label: 'Session 05 — 5-Black Sweep (Only Rank + River Win)',
    result: 'Net: +$0.08',
    slides: [
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/26dd50bd6_session_05_flop.png',
        phase: 'PRE-DEAL → FLOP',
        caption: "Player bets 1 card hand and covers ALL 7 Rank positions at 1¢ each. Bets Red on the Color Board. Flop comes up 4♠, 6♠, 6♣. Board shows 0 Red, 3 Black. The Color board Red bet is already lost. 8/6 takes the early lead with Three of a Kind — 6-6-6.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/2f7216ed2_session_05_turn.png',
        phase: 'THE TURN',
        caption: "Turn: 9♠ is dealt. Q♠ / 10♠ is now in the lead with a flush. Board shows 3 Low, 1 High. HIGH is the favourite. Player bets the max cap on HIGH.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/1594e70da_session_05_river.png',
        phase: 'THE RIVER',
        caption: "The river card is Dealt. A♠. K/K Wins with a Flush.",
      },
      {
        image: 'https://base44.app/api/apps/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/d7b3fc04e_session_05_results.png',
        phase: 'THE RESULTS',
        caption: "Coverage saves the round. 2 out of 4 boards win — Rank and River.\nTotal Win: $0.64 | Total Bet: $0.56 | Net Result: +$0.08",
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
