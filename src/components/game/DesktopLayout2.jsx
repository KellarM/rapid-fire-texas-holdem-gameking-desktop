import { motion } from 'framer-motion';
import FixedHandCard from './FixedHandCard';
import CommunityCards from './CommunityCards';
import SideBets from './SideBets';
import RankBets from './RankBets';
import DealerAnnouncement from './DealerAnnouncement';
import DetailedPayoutDisplay from './DetailedPayoutDisplay';
import CountdownClock from './CountdownClock';
import DealerButton from './DealerButton';
import Chip from './Chip';
import GearMenu from './GearMenu';
import OnboardingIndicator from './OnboardingIndicator';
import { FIXED_HANDS, SUITS, evaluateBestHand } from '@/lib/gameEngine';
import { getCardImageUrl } from '@/lib/cardImages';

const CHIP_VALUES = [0.50, 0.25, 0.10, 0.05, 0.02, 0.01];

const GOLD = '#e8b84b';
const GOLD_BRIGHT = '#fde047';

const stripStyle = (flexGrow = 1) => ({
  border: `3px solid ${GOLD}`,
  borderRadius: '0.75rem',
  boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)',
  background: 'rgba(0,0,0,0.35)',
  boxSizing: 'border-box',
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'column',
  flexGrow,
  flexShrink: 0,
  minHeight: 0,
  padding: '4px',
});

export default function DesktopLayout2({
  // Game state
  gamePhase, communityCards, dealerMessage, handDisplayOrder,
  leadingHandIds, winnerHandIds, winningRank, leadingRank,
  winningRedBlack, winningLowHigh, lastWinInfo,
  playerCount, activePlayer, balances, selectedChip,
  handBets, redBlackBets, rankBets, lowHighBets,
  countdownTime, countdownActive, killSwitchActive,
  showUnlockFlash, sideBetGateOpen, handBetCount, rankBetCount,
  maxRankSlots, maxHandBetsAllowed, rankLockThreshold,
  hoveredRankRow, hoveredRiverType, riverWinFlash, isRankBetPlaced,
  totalBet, history, boardTheme, dealerMode, versions,
  // Player-scoped
  pHandBets, pRankBets, pRedBlackBets, pLowHighBet,
  pid, balance, totalHandAmt, totalRankAmt, totalColorAmt, totalInvestment,
  // Handlers
  onHandBet, onRemoveHandBet, onDropChip,
  onRankBet, onRemoveRankBet, onMoveRankBet,
  onRedBlackBet, onRemoveRedBlackBet,
  onLowHighBet, onRemoveLowHighBet,
  onSelectChip, onClearBets, onResetBank,
  onCloseWinDisplay, onDealerButton,
  onSetHoveredRankRow, onSetHoveredRiverType,
  // Modal triggers
  onHowToPlay, onOpenStats, onOpenMobileLayout, onOpenDesktopLayout,
  onColorSideConflict,
  // Sound
  soundManager,
  // Theme
  onSetTheme,
  preloadSounds,
}) {
  const LOGO_URLS = {
    red:   'https://base44-app-prod.s3.amazonaws.com/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/0a1b2c3d_logo_red.png',
    blue:  'https://base44-app-prod.s3.amazonaws.com/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/0a1b2c3d_logo_blue.png',
    green: 'https://base44-app-prod.s3.amazonaws.com/69fcabf54838c8e18515a406/files/mp/public/69fcabf54838c8e18515a406/0a1b2c3d_logo_green.png',
  };

  const theme = boardTheme || 'red';
  const logoUrl = LOGO_URLS[theme] || LOGO_URLS.red;

  return (
    <div className={`velvet-board h-screen w-screen overflow-hidden text-white flex flex-col theme-${theme}`} onClick={preloadSounds} onTouchStart={preloadSounds}>

      {/* Unlock flash overlay */}
      {showUnlockFlash && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)', zIndex: 999,
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

      {/* Main strip container — fills available space above footer */}
      <div className="flex flex-col gap-1.5 p-1.5 flex-1 min-h-0">

        {/* Strip 1 (TOP): Community Cards + Dealer Announcement */}
        <div style={stripStyle(0)} className="flex-row items-center justify-center">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '4px', paddingBottom: '4px', width: '100%', height: '100%' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logoUrl} alt="Rapid Fire" style={{ width: '48px', height: 'auto', borderRadius: '6px' }} />
            </div>
            <div style={{ flexShrink: 0, height: '32px', display: 'flex', alignItems: 'center', border: `3px solid ${GOLD}`, borderRadius: '0.5rem', background: 'rgba(0,0,0,0.45)', padding: '0 12px' }}>
              <DealerAnnouncement message={dealerMessage} phase={gamePhase} />
            </div>
            <CommunityCards cards={communityCards} phase={gamePhase} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logoUrl} alt="Rapid Fire" style={{ width: '48px', height: 'auto', borderRadius: '6px' }} />
            </div>
          </div>
        </div>

        {/* Strip 2: River + Color (SideBets with riverFirst, compactLandscape) */}
        <div style={stripStyle(1.8)}>
          <SideBets
            communityCards={communityCards}
            allRedBlackBets={redBlackBets}
            allLowHighBets={lowHighBets}
            redBlackBets={pRedBlackBets}
            lowHighBet={pLowHighBet}
            onRedBlackBet={onRedBlackBet}
            onRemoveRedBlackBet={onRemoveRedBlackBet}
            onLowHighBet={onLowHighBet}
            onRemoveLowHighBet={onRemoveLowHighBet}
            gamePhase={gamePhase}
            winningRedBlack={winningRedBlack}
            winningLowHigh={winningLowHigh}
            disabled={gamePhase === 'betting' ? balance < selectedChip : gamePhase === 'lowHighBetting' ? balance < selectedChip : true}
            killSwitchActive={killSwitchActive}
            rankBetActive={sideBetGateOpen}
            activeColorSide={versions?.colorBothSides ? null : (['3R','4R','5R'].some(k => (pRedBlackBets[k]||0) > 0) ? 'red' : ['3B','4B','5B'].some(k => (pRedBlackBets[k]||0) > 0) ? 'black' : null)}
            onColorSideConflict={onColorSideConflict || (() => {})}
            playerCount={playerCount}
            totalInvestment={totalInvestment}
            hoveredRiverType={hoveredRiverType}
            onHoverRiver={onSetHoveredRiverType}
            riverWinFlash={riverWinFlash}
            selectedChip={selectedChip}
            hoveredRankRow={hoveredRankRow}
            isRankBetPlaced={isRankBetPlaced}
            colorCap={Math.max(0, (totalHandAmt + totalRankAmt) - totalColorAmt)}
            riverCap={Math.max(0, (totalHandAmt + totalRankAmt + totalColorAmt) - (pLowHighBet?.amount || 0))}
            rankLockThreshold={rankLockThreshold ?? 1}
            compactLandscape={false}
            compactHeader={true}
            riverFirst={false}
          />
        </div>

        {/* Strip 3: Rank Bets (horizontal row) */}
        <div style={stripStyle(2)}>
          <RankBets
            rankBets={pRankBets}
            allRankBets={rankBets}
            playerCount={playerCount}
            onRankBet={onRankBet}
            onRemoveRankBet={onRemoveRankBet}
            onMoveRankBet={onMoveRankBet}
            gamePhase={gamePhase}
            winningRank={winningRank}
            leadingRank={leadingRank}
            disabled={balance < selectedChip}
            killSwitchActive={killSwitchActive}
            handBetCount={handBetCount}
            maxRankSlots={maxRankSlots}
            rankBetCount={rankBetCount}
            unlockedRanks={new Set()}
            activePlayerId={pid}
            activeHandIds={Object.keys(pHandBets).map(Number)}
            matchCapRemaining={Math.max(0, totalHandAmt - totalRankAmt)}
            onAttemptLockedRank={() => {}}
            onHoverRankRow={onSetHoveredRankRow}
            rankLockThreshold={rankLockThreshold ?? 1}
            fontScale={1}
            chipScale={0.65}
            compactHeader={true}
          />
        </div>

        {/* Strip 4: Card Hand Area — 10 hands in a single row */}
        <div style={{ ...stripStyle(3), position: 'relative' }}>
          {/* Countdown clock overlay — Timing mode */}
          {!dealerMode && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50, pointerEvents: 'none' }}>
              <CountdownClock timeRemaining={countdownTime} isActive={countdownActive} phase={gamePhase} />
            </div>
          )}
          <div className="flex gap-1 flex-1 min-h-0">
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
                  onBet={onHandBet}
                  onRemoveBet={onRemoveHandBet}
                  onDropChip={onDropChip}
                  gamePhase={gamePhase}
                  disabled={balance < selectedChip && !pHandBets[hand.id]}
                  disabledByConstraint={!pHandBets[hand.id] && handBetCount >= maxHandBetsAllowed}
                  onAttemptLockedBet={() => {}}
                  overlap={true}
                />
              );
            })}
          </div>
          {/* Detailed Payout Display */}
          <DetailedPayoutDisplay winInfo={lastWinInfo} playerCount={playerCount} onClose={onCloseWinDisplay} />
        </div>
      </div>

      {/* Strip 5 (BOTTOM): Footer — Players Area */}
      <div className="flex items-center gap-2 rounded-xl pt-1.5 px-3 pb-1.5 flex-shrink-0 w-full"
        style={{
          border: `3px solid ${GOLD}`,
          boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)',
          background: 'rgba(0,0,0,0.35)',
        }}>
        {/* LEFT: chips */}
        <div className="flex items-center" style={{ flex: 1, justifyContent: 'flex-start' }}>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {CHIP_VALUES.map((v) =>
              <button
                key={v}
                onClick={() => onSelectChip(v)}
                className={`relative flex-shrink-0 transition-all duration-150 rounded-full border-0 bg-transparent p-0
                  ${selectedChip === v ? 'scale-125 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]' : 'opacity-75 hover:opacity-100 hover:scale-110'}`}
                style={{ lineHeight: 0 }}
              >
                <Chip amount={v} scale={0.72} />
              </button>
            )}
          </div>
        </div>

        {/* CENTER: Player Bank + Dealer Button + Bet Sum */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-yellow-400/80 text-[10px] font-bold leading-none tracking-widest uppercase mb-0.5">Players Bank</span>
            <div className="flex items-center justify-center px-4 py-2 rounded-xl border-2 border-yellow-500 bg-black" style={{ minWidth: '110px' }}>
              <span className="text-yellow-400 font-black text-lg leading-none tracking-tight" style={{ textShadow: '0 0 8px rgba(251,191,36,0.7)' }}>${(balances[activePlayer] ?? 20).toFixed(2)}</span>
            </div>
          </div>
          {dealerMode ? (
            <DealerButton gamePhase={gamePhase} totalBet={totalBet} onDeal={onDealerButton} />
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

        {/* RIGHT: Clear + Gear */}
        <div className="flex items-center gap-2" style={{ flex: 1, justifyContent: 'flex-end' }}>
          <div className="flex items-center gap-2 flex-shrink-0" style={{ minWidth: '80px', justifyContent: 'flex-end' }}>
            {gamePhase === 'betting' && totalBet > 0 &&
              <button
                onClick={onClearBets}
                className="px-3 py-1.5 rounded-lg border border-red-700/50 bg-red-900/30 text-red-300 text-xs font-semibold hover:bg-red-900/50 transition-all">
                Clear
              </button>
            }
          </div>
          <OnboardingIndicator>
            <GearMenu
              soundManager={soundManager}
              boardTheme={boardTheme}
              setBoardTheme={onSetTheme}
              onHowToPlay={onHowToPlay}
              onOpenStats={onOpenStats}
              onResetBank={onResetBank}
              onOpenDesktopLayout={onOpenDesktopLayout}
            />
          </OnboardingIndicator>
        </div>
      </div>
    </div>
  );
}
