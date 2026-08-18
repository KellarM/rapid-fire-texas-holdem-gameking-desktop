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

// Flat betting box — matches Pic 1: solid color fill, bold text, gold border, click-to-bet.
function FlatBetBox({ label, sub, bg, color, onClick, active, locked, winner, betAmount }) {
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
        background: bg,
        color: color,
        border: winner ? '3px solid #fff' : '2px solid #e8b84b',
        borderRadius: '6px',
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.45 : 1,
        position: 'relative',
        fontWeight: 900,
        textAlign: 'center',
        boxShadow: winner
          ? '0 0 14px 3px rgba(255,255,255,0.8), inset 0 0 0 1px rgba(0,0,0,0.3)'
          : (active ? '0 0 10px 2px rgba(232,184,75,0.7), inset 0 0 0 1px rgba(0,0,0,0.3)' : 'inset 0 0 0 1px rgba(0,0,0,0.25)'),
        transition: 'all 0.15s',
        padding: '2px 4px',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: '0.72rem', lineHeight: 1.05, whiteSpace: 'pre-line' }}>{label}</span>
      {sub && <span style={{ fontSize: '0.62rem', lineHeight: 1, opacity: 0.85 }}>{sub}</span>}
      {betAmount > 0 && (
        <div style={{
          position: 'absolute', top: 2, right: 2,
          background: '#000', color: '#fbbf24',
          borderRadius: '999px', fontSize: '0.6rem', fontWeight: 900,
          padding: '1px 5px', border: '1px solid #fbbf24',
        }}>
          ${betAmount.toFixed(2)}
        </div>
      )}
    </button>
  );
}

const YELLOW_BG = '#f5e050';
const RED_BG = '#c81e1e';
const BLACK_BG = '#141414';

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
  const riverAvailable = gamePhase === 'lowHighBetting';
  const canBetColor = gamePhase === 'betting' && balance >= selectedChip && !colorLocked;
  const canBetRiver = riverAvailable && balance >= selectedChip;
  const canBetRank = gamePhase === 'betting' && balance >= selectedChip && !killSwitchActive;

  const activeColorSide = versions?.colorBothSides ? null :
    (['3R','4R','5R'].some(k => (pRedBlackBets[k]||0) > 0) ? 'red' :
     ['3B','4B','5B'].some(k => (pRedBlackBets[k]||0) > 0) ? 'black' : null);

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
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">

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
            <FlatBetBox
              label="LOW (2-7)"
              sub={`${LOW_HIGH_PAYOUT}:1`}
              bg={YELLOW_BG}
              color="#000"
              onClick={() => canBetRiver && handleLowHighBet('LOW')}
              active={pLowHighBet?.type === 'LOW' && pLowHighBet?.amount > 0}
              locked={!canBetRiver}
              winner={winningLowHigh === 'LOW'}
              betAmount={pLowHighBet?.type === 'LOW' ? pLowHighBet.amount : 0}
            />
            <FlatBetBox
              label="HIGH (8-Ace)"
              sub={`${LOW_HIGH_PAYOUT}:1`}
              bg={YELLOW_BG}
              color="#000"
              onClick={() => canBetRiver && handleLowHighBet('HIGH')}
              active={pLowHighBet?.type === 'HIGH' && pLowHighBet?.amount > 0}
              locked={!canBetRiver}
              winner={winningLowHigh === 'HIGH'}
              betAmount={pLowHighBet?.type === 'HIGH' ? pLowHighBet.amount : 0}
            />
          </GoldStrip>

          {/* STRIP 2: COLOR — 3/4/5 Red, 3/4/5 Black, 6 flat boxes */}
          <GoldStrip style={{ height: '58px', minHeight: '58px', maxHeight: '58px', width: '100%', padding: '5px', display: 'flex', gap: '5px' }}>
            {['3R','4R','5R'].map((key) => (
              <FlatBetBox
                key={key}
                label={`${key[0]} Red`}
                sub={`${COLOR_BOARD_PAYOUTS[key]}:1`}
                bg={RED_BG}
                color="#000"
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
                bg={BLACK_BG}
                color="#fbbf24"
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
            {RANK_ROW.map(({ key: rankKey, label }) => (
              <FlatBetBox
                key={rankKey}
                label={label}
                sub={`${HAND_RANK_PAYOUTS[rankKey]}:1`}
                bg={YELLOW_BG}
                color="#000"
                onClick={() => canBetRank && handleRankBet(rankKey)}
                active={(pRankBets[rankKey] || 0) > 0}
                locked={!canBetRank}
                winner={winningRank === rankKey}
                betAmount={pRankBets[rankKey] || 0}
              />
            ))}
          </GoldStrip>

          {/* STRIP 4: CARD HANDS — 10 slots, 5x2 grid (card art is fixed-size; single row won't fit) */}
          <GoldStrip style={{ flex: '1 1 0', minHeight: '150px', width: '100%', padding: '4px', overflow: 'visible' }}>
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
            <div className="grid grid-cols-5 gap-1.5 h-full auto-rows-fr">
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
