import React from 'react';
import HistoryRail from './HistoryRail';
import DealerAnnouncement from './DealerAnnouncement';
import CommunityCards from './CommunityCards';
import FixedHandCard from './FixedHandCard';
import CountdownClock from './CountdownClock';
import ToolsMenu from './ToolsMenu';
import Chip from './Chip';
import DealerButton from './DealerButton';
import OnboardingIndicator from './OnboardingIndicator';
import GearMenu from './GearMenu';
import DetailedPayoutDisplay from './DetailedPayoutDisplay';
import { HAND_RANK_PAYOUTS, COLOR_BOARD_PAYOUTS, LOW_HIGH_PAYOUT } from '@/lib/payoutConstants';

const GOLD_BORDER = '3px solid #e8b84b';
const GOLD_GLOW = '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)';
const PANEL_BG = 'rgba(0,0,0,0.35)';
const PANEL_BG_DARK = 'rgba(0,0,0,0.45)';

function GoldStrip({ children, style, dark }) {
  return (
    <div
      style={{
        flexShrink: 0,
        borderRadius: '0.75rem',
        border: GOLD_BORDER,
        boxShadow: GOLD_GLOW,
        background: dark ? PANEL_BG_DARK : PANEL_BG,
        boxSizing: 'border-box',
        overflow: 'visible',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Established app gradients (pulled directly from RankBets.jsx / SideBets.jsx so
// Layout 2 matches the SAME visual language as the rest of the game — no more
// flat placeholder colors).
const GOLD_AVAILABLE = 'linear-gradient(135deg, #f6d860 0%, #e8c22a 30%, #fef08a 55%, #c9960a 80%, #e8c22a 100%)';
const GOLD_WINNER = 'linear-gradient(135deg, #fff176 0%, #ffd600 40%, #ffe57a 70%, #ffab00 100%)';
const RED_AVAILABLE = 'linear-gradient(160deg, #e02020 0%, #8c0e0e 100%)';
const RED_HASBET = 'linear-gradient(160deg, #c01c1c 0%, #7a0909 100%)';
const BLACK_AVAILABLE = 'linear-gradient(160deg, #222 0%, #000 100%)';
const BLACK_HASBET = 'linear-gradient(160deg, #141414 0%, #000 100%)';

// Flat betting box, styled to match the app's established gold/red/black gradient
// language (same treatment as the Rank/Color boards elsewhere). Winning positions
// get the gold-winner gradient + black border + "WIN!" banner, same pattern as
// FixedHandCard. Bet chips render as real Chip tokens pinned INSIDE the left edge
// (contained on the position, not hanging off it).
function FlatBetBox({ label, sub, group, onClick, active, locked, winner, betAmount }) {
  let background, textColor, border, boxShadow;
  if (winner) {
    background = GOLD_WINNER;
    textColor = '#000';
    border = '3px solid #000';
    boxShadow = '0 0 16px rgba(255,200,50,0.7), inset 0 1px 2px rgba(255,255,200,0.6)';
  } else if (group === 'red') {
    background = active ? RED_HASBET : RED_AVAILABLE;
    textColor = '#fff';
    border = '1px solid #111';
    boxShadow = 'inset 0 1px 2px rgba(255,150,150,0.25), 0 1px 4px rgba(0,0,0,0.5)';
  } else if (group === 'black') {
    background = active ? BLACK_HASBET : BLACK_AVAILABLE;
    textColor = '#fbbf24';
    border = '1px solid #2a2a2a';
    boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.08), 0 1px 4px rgba(0,0,0,0.5)';
  } else {
    // gold group (Rank + River)
    background = GOLD_AVAILABLE;
    textColor = '#000';
    border = '1px solid #000';
    boxShadow = 'inset 0 1px 2px rgba(255,255,200,0.6), inset 0 -1px 2px rgba(100,60,0,0.5), 0 1px 4px rgba(0,0,0,0.5)';
  }

  return (
    <button
      onClick={onClick}
      disabled={locked}
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        background,
        color: textColor,
        border,
        borderRadius: '6px',
        cursor: locked ? 'not-allowed' : 'pointer',
        position: 'relative',
        fontWeight: 900,
        textAlign: 'center',
        boxShadow: active && !winner ? `0 0 8px 1px rgba(232,184,75,0.5), ${boxShadow}` : boxShadow,
        transition: 'all 0.15s',
        padding: '2px 4px',
        minWidth: 0,
        overflow: 'visible',
      }}
    >
      <span style={{ position: 'relative', zIndex: 2, fontSize: '0.72rem', lineHeight: 1.05, whiteSpace: 'pre-line' }}>{label}</span>
      {sub && <span style={{ position: 'relative', zIndex: 2, fontSize: '0.62rem', lineHeight: 1, opacity: 0.85 }}>{sub}</span>}
      {betAmount > 0 && (
        <div style={{
          position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, pointerEvents: 'none',
        }}>
          <Chip amount={betAmount} scale={0.5} />
        </div>
      )}
      {winner && (
        <div style={{
          position: 'absolute', top: '-10px', right: '-8px',
          background: '#000', color: '#fbbf24',
          fontSize: '0.62rem', fontWeight: 900,
          padding: '2px 6px', borderRadius: '999px',
          whiteSpace: 'nowrap', zIndex: 21,
        }}>
          WIN!
        </div>
      )}
    </button>
  );
}

// Whole-strip lock overlay — same "Smoked Glass Vault" treatment SideBets.jsx uses
// when a board isn't available yet (backdrop-blur black gradient + lock icon).
function LockedOverlay({ text, sub }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl"
      style={{
        backdropFilter: 'blur(4px)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(15,10,5,0.85) 100%)',
      }}
    >
      <span style={{ fontSize: '1.1rem', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' }}>🔒</span>
      <span style={{ color: '#fbbf24', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>{text}</span>
      {sub && <span style={{ color: 'rgba(253,224,71,0.6)', fontSize: '0.55rem', textAlign: 'center', padding: '0 6px', marginTop: '1px' }}>{sub}</span>}
    </div>
  );
}

// Match Cap pill — same badge SideBets.jsx/RankBets.jsx show in each board's header
// row. Layout 2's strips are fixed-height with no header row, so it floats on top
// of the strip's gold border (top-right corner) instead.
function MatchCapBadge({ amount }) {
  return (
    <div
      className="px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap pointer-events-none"
      style={{
        position: 'absolute', top: '-9px', right: '10px', zIndex: 25,
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(234,179,8,0.5)', color: '#fbbf24',
      }}
    >
      Match Cap: ${amount.toLocaleString()}
    </div>
  );
}

export default function DesktopLayout2({
  gamePhase,
  communityCards,
  dealerMessage,
  history,
  boardTheme,
  setBoardTheme,
  soundManager,
  FIXED_HANDS,
  handDisplayOrder,
  leadingHandIds,
  winnerHandIds,
  pHandBets,
  handBets,
  playerCount,
  pid,
  handleHandBet,
  handleRemoveHandBet,
  handleDropChip,
  selectedChip,
  balance,
  handBetCount,
  maxHandBetsAllowed,
  setShowHandLimitAlert,
  pRankBets,
  rankBets,
  handleRankBet,
  winningRank,
  killSwitchActive,
  versions,
  totalHandAmt,
  totalRankAmt,
  setShowRankLimitAlert,
  pRedBlackBets,
  pLowHighBet,
  redBlackBets,
  lowHighBets,
  handleRedBlackBet,
  handleLowHighBet,
  winningRedBlack,
  winningLowHigh,
  sideBetGateOpen,
  setShowColorSideAlert,
  totalColorAmt,
  lastWinInfo,
  setLastWinInfo,
  CHIP_VALUES,
  setSelectedChip,
  balances,
  activePlayer,
  totalBet,
  dealerMode,
  handleDealButtonPress,
  clearBets,
  setShowHowToPlay,
  setShowStatsPanel,
  handleResetBank,
  setShowMobileLayout,
  setShowDesktopLayout,
  countdownTime,
  countdownActive,
  showUnlockFlash,
  toolbarVisible,
  setToolbarVisible,
  setShowMollySimulator,
  setShowExploitHunter,
  setShowComplianceReport,
  setShowKsStrategyTest,
  setShowAnalytics,
  setShowGameTiming,
  setShowVersions,
  setShowBellCurve,
  setShowControl,
  LOGO_URLS,
}) {
  const colorLocked = killSwitchActive || !sideBetGateOpen;
  // Overlay/open-display gate — mirrors SideBets.jsx's "Smoked Glass Vault" condition
  // exactly. Once the river is dealt (gamePhase moves to 'river'/'winner'), this must
  // stay OPEN so the winning LOW/HIGH position stays visible — only re-locks if we're
  // still in betting/flop, or briefly in lowHighBetting with no rank bet active.
  const riverLocked = (gamePhase === 'betting' || gamePhase === 'flop' || (gamePhase === 'lowHighBetting' && !sideBetGateOpen));
  const riverAvailable = !riverLocked;
  const canBetColor = gamePhase === 'betting' && balance >= selectedChip && !colorLocked;
  const canBetRiver = gamePhase === 'lowHighBetting' && sideBetGateOpen && balance >= selectedChip;
  const canBetRank = gamePhase === 'betting' && balance >= selectedChip && !killSwitchActive && !(!handBetCount || handBetCount === 0);

  const activeColorSide = versions?.colorBothSides ? null :
    (['3R','4R','5R'].some(k => (pRedBlackBets[k]||0) > 0) ? 'red' :
     ['3B','4B','5B'].some(k => (pRedBlackBets[k]||0) > 0) ? 'black' : null);

  // Match Cap pills — same formulas RankBets.jsx / SideBets.jsx use in their header rows
  const noHandBets = !handBetCount || handBetCount === 0;
  const matchCapRank = Math.max(0, totalHandAmt - totalRankAmt);
  const matchCapColor = Math.max(0, (totalHandAmt + totalRankAmt) - totalColorAmt);
  const matchCapRiver = Math.max(0, (totalHandAmt + totalRankAmt + totalColorAmt) - (pLowHighBet?.amount || 0));

  const RANK_ROW = [
    { key: 'Four of a Kind',  label: '4 Of A Kind'  },
    { key: 'Full House',      label: 'Full House'    },
    { key: 'Flush',           label: 'Flush'         },
    { key: 'Straight',        label: 'Straight'      },
    { key: 'Three of a Kind', label: '3 Of A Kind'   },
    { key: 'Two Pair',        label: '2 Pair'        },
    { key: 'One Pair',        label: '1 Pair'        },
  ];

  return (
    <div className="flex flex-col gap-1.5 p-1.5 flex-1 min-h-0">
      <div className="flex gap-1.5 flex-1 min-h-0">

        {/* LEFT: History rail */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-1.5 overflow-hidden">
          <HistoryRail history={history} />
        </div>

        {/* RIGHT: Stacked strips — River → Color → Rank → Card Hands */}
        <div className="flex-1 flex flex-col gap-0 min-w-0">

          {/* Dealer bar */}
          <GoldStrip style={{ height: '32px', minHeight: '32px', maxHeight: '32px', width: '100%', display: 'flex', alignItems: 'center', padding: 0, whiteSpace: 'nowrap' }} dark>
            <DealerAnnouncement message={dealerMessage} phase={gamePhase} />
          </GoldStrip>

          {/* Community cards */}
          <GoldStrip style={{ height: '120px', minHeight: '120px', maxHeight: '120px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '6px', paddingBottom: '6px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <img src={LOGO_URLS[boardTheme]} alt="Rapid Fire Texas Hold'em" style={{ width: '56px', height: 'auto', display: 'block', borderRadius: '8px' }} />
              <ToolsMenu onOpenStats={() => setShowStatsPanel(true)} onOpenMollySimulator={() => setShowMollySimulator(true)} onOpenExploitHunter={() => setShowExploitHunter(true)} onOpenComplianceReport={() => setShowComplianceReport(true)} onOpenKsStrategyTest={() => setShowKsStrategyTest(true)} onOpenAnalytics={() => setShowAnalytics(true)} onOpenGameTiming={() => setShowGameTiming(true)} onOpenMobileLayout={() => setShowMobileLayout(true)} onOpenVersions={() => setShowVersions(true)} onOpenBellCurve={() => setShowBellCurve(true)} onOpenControl={() => setShowControl(true)} toolsVisible={toolbarVisible} onHideTools={() => setToolbarVisible(false)} />
            </div>
            <CommunityCards cards={communityCards} phase={gamePhase} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={LOGO_URLS[boardTheme]} alt="Rapid Fire Texas Hold'em" style={{ width: '56px', height: 'auto', display: 'block', borderRadius: '8px' }} />
            </div>
          </GoldStrip>

          <DetailedPayoutDisplay winInfo={lastWinInfo} playerCount={playerCount} onClose={() => setLastWinInfo(null)} />

          {/* STRIP 1: RIVER — Low / High, 2 flat boxes */}
          <GoldStrip style={{ height: '58px', minHeight: '58px', maxHeight: '58px', width: '100%', padding: '5px', display: 'flex', gap: '5px' }}>
            {riverLocked && <LockedOverlay text="Opens After Turn" />}
            {!riverLocked && <MatchCapBadge amount={matchCapRiver} />}
            <FlatBetBox
              label="LOW (2-7)"
              sub={`${LOW_HIGH_PAYOUT}:1`}
              onClick={() => canBetRiver && handleLowHighBet('LOW')}
              active={pLowHighBet?.type === 'LOW' && pLowHighBet?.amount > 0}
              locked={!canBetRiver}
              winner={winningLowHigh === 'LOW'}
              betAmount={pLowHighBet?.type === 'LOW' ? pLowHighBet.amount : 0}
            />
            <FlatBetBox
              label="HIGH (8-Ace)"
              sub={`${LOW_HIGH_PAYOUT}:1`}
              onClick={() => canBetRiver && handleLowHighBet('HIGH')}
              active={pLowHighBet?.type === 'HIGH' && pLowHighBet?.amount > 0}
              locked={!canBetRiver}
              winner={winningLowHigh === 'HIGH'}
              betAmount={pLowHighBet?.type === 'HIGH' ? pLowHighBet.amount : 0}
            />
          </GoldStrip>

          {/* STRIP 2: COLOR — 3/4/5 Red, 3/4/5 Black, 6 flat boxes */}
          <GoldStrip style={{ height: '58px', minHeight: '58px', maxHeight: '58px', width: '100%', padding: '5px', display: 'flex', gap: '5px' }}>
            {colorLocked && <LockedOverlay text="Place Matching Rank Bet" />}
            {!colorLocked && <MatchCapBadge amount={matchCapColor} />}
            {['3R','4R','5R'].map((key) => (
              <FlatBetBox
                key={key}
                label={`${key[0]} Red`}
                sub={`${COLOR_BOARD_PAYOUTS[key]}:1`}
                group="red"
                onClick={() => {
                  if (activeColorSide === 'black') { setShowColorSideAlert(true); return; }
                  canBetColor && handleRedBlackBet(key);
                }}
                active={(pRedBlackBets[key] || 0) > 0}
                locked={!canBetColor || activeColorSide === 'black'}
                winner={winningRedBlack && winningRedBlack.includes(key)}
                betAmount={pRedBlackBets[key] || 0}
              />
            ))}
            {['3B','4B','5B'].map((key) => (
              <FlatBetBox
                key={key}
                label={`${key[0]} Black`}
                sub={`${COLOR_BOARD_PAYOUTS[key]}:1`}
                group="black"
                onClick={() => {
                  if (activeColorSide === 'red') { setShowColorSideAlert(true); return; }
                  canBetColor && handleRedBlackBet(key);
                }}
                active={(pRedBlackBets[key] || 0) > 0}
                locked={!canBetColor || activeColorSide === 'red'}
                winner={winningRedBlack && winningRedBlack.includes(key)}
                betAmount={pRedBlackBets[key] || 0}
              />
            ))}
          </GoldStrip>

          {/* STRIP 3: RANK — 7 flat boxes */}
          <GoldStrip style={{ height: '58px', minHeight: '58px', maxHeight: '58px', width: '100%', padding: '5px', display: 'flex', gap: '5px' }}>
            {killSwitchActive && <LockedOverlay text="Side Bets Disabled" />}
            {noHandBets && !killSwitchActive && gamePhase === 'betting' && (
              <LockedOverlay text="Rank Board Locked" sub="Place a Card Hand bet to unlock" />
            )}
            {!noHandBets && !killSwitchActive && <MatchCapBadge amount={matchCapRank} />}
            {RANK_ROW.map(({ key: rankKey, label }) => (
              <FlatBetBox
                key={rankKey}
                label={label}
                sub={`${HAND_RANK_PAYOUTS[rankKey]}:1`}
                onClick={() => canBetRank && handleRankBet(rankKey)}
                active={(pRankBets[rankKey] || 0) > 0}
                locked={!canBetRank}
                winner={winningRank === rankKey}
                betAmount={pRankBets[rankKey] || 0}
              />
            ))}
          </GoldStrip>

          {/* STRIP 4: CARD HANDS — 10 slots, 5x2 grid (card art is fixed-size; single row won't fit) */}
          <GoldStrip style={{ flex: '1 1 0', minHeight: '190px', width: '100%', padding: '6px', overflow: 'visible' }}>
            {!dealerMode && (
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                pointerEvents: 'none',
              }}>
                <CountdownClock timeRemaining={countdownTime} isActive={countdownActive} phase={gamePhase} />
              </div>
            )}
            <div className="grid grid-cols-5 gap-x-1.5 gap-y-3 h-full auto-rows-fr">
              {handDisplayOrder.map((hid) => {
                const hand = FIXED_HANDS.find(h => h.id === hid);
                if (!hand) return null;
                return (
                  <FixedHandCard
                    key={hand.id}
                    hand={hand}
                    isLeading={leadingHandIds.includes(hand.id)}
                    isWinner={winnerHandIds.includes(hand.id)}
                    communityCards={communityCards}
                    betAmount={pHandBets[hand.id] || 0}
                    allHandBets={handBets}
                    playerCount={playerCount}
                    activePlayerId={pid}
                    onBet={handleHandBet}
                    onRemoveBet={handleRemoveHandBet}
                    onDropChip={handleDropChip}
                    gamePhase={gamePhase}
                    disabled={balance < selectedChip && !pHandBets[hand.id]}
                    disabledByConstraint={!pHandBets[hand.id] && handBetCount >= maxHandBetsAllowed}
                    onAttemptLockedBet={() => setShowHandLimitAlert(true)}
                  />
                );
              })}
            </div>
          </GoldStrip>

        </div>
      </div>

      {/* Full-width footer */}
      <div className="flex items-center gap-2 rounded-xl pt-1.5 px-3 pb-1.5 flex-shrink-0 w-full"
        style={{ border: GOLD_BORDER, boxShadow: GOLD_GLOW, background: PANEL_BG }}>
        <div className="flex items-center" style={{ flex: 1, justifyContent: 'flex-start' }}>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {CHIP_VALUES.map((v) =>
              <button
                key={v}
                onClick={() => setSelectedChip(v)}
                className={`relative flex-shrink-0 transition-all duration-150 rounded-full border-0 bg-transparent p-0
                    ${selectedChip === v ? 'scale-125 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]' : 'opacity-75 hover:opacity-100 hover:scale-110'}`}
                style={{ lineHeight: 0 }}
              >
                <Chip amount={v} scale={0.72} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-yellow-400/80 text-[10px] font-bold leading-none tracking-widest uppercase mb-0.5">Players Bank</span>
            <div className="flex items-center justify-center px-4 py-2 rounded-xl border-2 border-yellow-500 bg-black" style={{ minWidth: '110px' }}>
              <span className="text-yellow-400 font-black text-lg leading-none tracking-tight" style={{ textShadow: '0 0 8px rgba(251,191,36,0.7)' }}>${(balances[activePlayer] ?? 20).toFixed(2)}</span>
            </div>
          </div>
          {dealerMode ? (
            <DealerButton gamePhase={gamePhase} totalBet={totalBet} onDeal={handleDealButtonPress} />
          ) : (
            <div style={{ width: 120, flexShrink: 0 }} />
          )}
          <div className="flex flex-col items-center">
            <span className="text-yellow-400/80 text-[10px] font-bold leading-none tracking-widest uppercase mb-0.5">Bet Sum Count</span>
            <div className="flex items-center justify-center px-4 py-2 rounded-xl border-2 border-yellow-500 bg-black" style={{ minWidth: '110px' }}>
              <span className="text-yellow-400 font-black text-lg leading-none tracking-tight" style={{ textShadow: '0 0 8px rgba(251,191,36,0.7)' }}>${totalBet.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ flex: 1, justifyContent: 'flex-end' }}>
          <div className="flex items-center gap-2 flex-shrink-0" style={{ minWidth: '80px', justifyContent: 'flex-end' }}>
            {gamePhase === 'betting' && totalBet > 0 &&
              <button
                onClick={clearBets}
                className="px-3 py-1.5 rounded-lg border border-red-700/50 bg-red-900/30 text-red-300 text-xs font-semibold hover:bg-red-900/50 transition-all">
                Clear
              </button>
            }
          </div>
          <OnboardingIndicator>
            <GearMenu
              soundManager={soundManager}
              boardTheme={boardTheme}
              setBoardTheme={setBoardTheme}
              onHowToPlay={() => setShowHowToPlay(true)}
              onOpenStats={() => setShowStatsPanel(true)}
              onResetBank={handleResetBank}
              onOpenDesktopLayout={() => setShowDesktopLayout(true)}
            />
          </OnboardingIndicator>
        </div>
      </div>

      {showUnlockFlash && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', zIndex: 999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: '14px',
          background: 'linear-gradient(160deg, rgba(0,0,0,0.97) 0%, rgba(25,12,0,0.98) 100%)',
          border: '2px solid #eab308',
          boxShadow: '0 0 40px rgba(234,179,8,0.5), 0 8px 32px rgba(0,0,0,0.8)',
          animation: 'rfUnlockFadeOut 8s ease forwards',
          pointerEvents: 'none', padding: '16px 28px', gap: 0, minWidth: '220px',
        }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#eab308', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>🔓 Bonus Bets Unlocked</span>
          <div style={{ height: 8 }} />
          <span style={{ fontSize: 12, color: '#f87171', fontWeight: 700, textAlign: 'center' }}>🔴 Color Board Open</span>
          <div style={{ height: 4 }} />
          <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700, textAlign: 'center' }}>🌊 River Bet Available After The Turn</span>
        </div>
      )}
    </div>
  );
}
