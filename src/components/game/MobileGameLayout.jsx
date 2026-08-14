import React from 'react';
import { getCardImageUrl } from '@/lib/cardImages';
import HistoryRail from './HistoryRail';
import { evaluateBestHand, FIXED_HANDS, getTotalHandBets, getTotalRankBets, getTotalColorBets } from '@/lib/gameEngine';
import CommunityCards from './CommunityCards';
import RankBets from './RankBets';
import SideBets from './SideBets';
import DealerAnnouncement from './DealerAnnouncement';
import Chip from './Chip';
import CountdownClock from './CountdownClock';
import DetailedPayoutDisplay from './DetailedPayoutDisplay';
import GameRulesModal from './GameRulesModal';
import HowToPlayOverlay from './HowToPlayOverlay';
import HandBetLimitAlert from './HandBetLimitAlert';
import RankBetLimitAlert from './RankBetLimitAlert';
import InsufficientFundsAlert from './InsufficientFundsAlert';
import AutoTrimToast from './AutoTrimToast';
import ColorSideAlert from './ColorSideAlert';
import VolumeControl from './VolumeControl';

const CHIP_VALUES = [0.50, 0.25, 0.05, 0.01];

const LOGO_URLS = {
  red:   'https://media.base44.com/images/public/69f3a45ad82dff5b772d4de2/2667063a3_image.png',
  blue:  'https://media.base44.com/images/public/69fbe99a6a81578f42265ae6/864b277e3_RapidFireGreenLogo.png',
  green: 'https://media.base44.com/images/public/69fbe99a6a81578f42265ae6/864b277e3_RapidFireGreenLogo.png',
};

// ── Portrait-optimised hand card ─────────────────────────────────────────
function MobileHandCard({
  hand, isLeading, isWinner, communityCards,
  betAmount, onBet, onRemoveBet,
  gamePhase, disabled, disabledByConstraint, onAttemptLockedBet,
}) {
  const isBettingPhase = gamePhase === 'betting';
  const isActive = isLeading || isWinner;

  let borderCls;
  if (isActive)                  borderCls = 'border-black shadow-black/60 shadow-xl';
  else if (disabledByConstraint) borderCls = 'slot-border-dormant bg-black/25';
  else if (betAmount > 0)        borderCls = 'slot-border-active bg-black/25';
  else                           borderCls = 'slot-border-dormant bg-black/25';

  const W = 29, H = 40;
  const card0 = hand.cards[0];
  const card1 = hand.cards[1];
  const img0 = getCardImageUrl(card0);
  const img1 = getCardImageUrl(card1);

  return (
    <div
      className={`relative rounded-lg border-2 cursor-pointer select-none flex flex-col items-center justify-between overflow-visible ${borderCls}`}
      style={{
        padding: '3px 2px 3px',
        height: '100%',
        ...(isActive ? { background: 'linear-gradient(135deg,#b8860b 0%,#d4a017 30%,#c9900e 60%,#8B6914 100%)' } : {}),
      }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        if (isBettingPhase) {
          if (disabledByConstraint) onAttemptLockedBet?.();
          else onBet(hand.id);
        }
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        if (!isBettingPhase) return;
        if (disabledByConstraint) { onAttemptLockedBet?.(); return; }
        // Tap on chip overlay = remove; tap elsewhere = add
        if (betAmount > 0 && e.target.closest('[data-chip-overlay]')) {
          onRemoveBet(hand.id);
        } else {
          onBet(hand.id);
        }
      }}
      onContextMenu={(e) => { e.preventDefault(); if (isBettingPhase) onRemoveBet(hand.id); }}
    >
      {/* Payout label */}
      <div style={{
        fontSize: '0.55rem',
        color: isActive ? '#000' : '#e8b84b',
        fontWeight: isActive ? 900 : 700,
        lineHeight: 1,
        textAlign: 'center',
        letterSpacing: '-0.02em',
        flexShrink: 0,
      }}>
        {hand.payout}:1
      </div>

      {/* Cards */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '0 3px', position: 'relative' }}>
        <div style={{ flexShrink: 0 }}>
          {img0
            ? <img src={img0} alt={card0?.rank} className="rounded shadow-md" style={{ width: W, height: H, objectFit: 'cover', display: 'block' }} />
            : <div className="bg-white rounded text-black flex items-center justify-center font-bold" style={{ width: W, height: H, fontSize: '0.5rem' }}>{card0?.rank}</div>
          }
        </div>
        <div style={{ flexShrink: 0 }}>
          {img1
            ? <img src={img1} alt={card1?.rank} className="rounded shadow-md" style={{ width: W, height: H, objectFit: 'cover', display: 'block' }} />
            : <div className="bg-white rounded text-black flex items-center justify-center font-bold" style={{ width: W, height: H, fontSize: '0.5rem' }}>{card1?.rank}</div>
          }
        </div>
        {betAmount > 0 && (
          <div data-chip-overlay="true" style={{ position: 'absolute', bottom: -6, right: -2, zIndex: 10, pointerEvents: 'auto', cursor: 'pointer' }}>
            <Chip amount={betAmount} scale={0.42} />
          </div>
        )}
      </div>

      {/* Rank eval */}
      {communityCards && communityCards.length > 0 && (() => {
        const ev = evaluateBestHand(hand.cards, communityCards);
        return ev && ev.name !== 'No Hand' && ev.name !== 'High Card'
          ? <div style={{ fontSize: '0.38rem', color: isActive ? '#000' : '#a8956a', fontWeight: 700, lineHeight: 1, textAlign: 'center', flexShrink: 0 }}>{ev.name}</div>
          : <div style={{ fontSize: '0.38rem', lineHeight: 1, flexShrink: 0 }}>&nbsp;</div>;
      })()}

      {/* WIN! badge — top-right, black bg / gold text (v12 spec) */}
      {isWinner && (
        <div
          className="absolute -top-2 -right-2 font-black rounded-full"
          style={{ fontSize: '0.5rem', padding: '2px 5px', zIndex: 20, background: '#000', color: '#ffd700', letterSpacing: '0.04em', boxShadow: '0 0 6px 2px rgba(251,191,36,0.7)' }}
        >
          WIN!
        </div>
      )}

      {/* Lock overlay */}
      {disabledByConstraint && (
        <div className="absolute inset-0 rounded-lg pointer-events-none flex flex-col items-center justify-center" style={{ zIndex: 20 }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.95))' }}>🔒</span>
          <span style={{ color: '#ff4444', fontSize: '0.42rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3, textShadow: '0 1px 4px #000' }}>LOCKED</span>
        </div>
      )}
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────
export default function MobileGameLayout({
  gamePhase,
  communityCards,
  maxHandBetsAllowed = 1,
  rankLockThreshold = undefined,
  dealerMessage,
  leadingHandIds,
  winnerHandIds,
  winningRedBlack,
  winningLowHigh,
  winningRank,
  leadingRank,
  lastWinInfo,
  playerCount,
  activePlayer,
  balances,
  selectedChip,
  handBets,
  redBlackBets,
  rankBets,
  lowHighBets,
  countdownTime,
  countdownActive,
  onCloseWinDisplay,
  killSwitchActive,
  showUnlockFlash = false,
  sideBetGateOpen,
  handBetCount,
  rankBetCount,
  maxRankSlots,
  luminosityClass,
  hoveredRankRow,
  hoveredRiverType,
  riverWinFlash,
  isRankBetPlaced,
  totalBet,
  history,
  // Alerts
  showHandLimitAlert,
  showRankLimitAlert,
  rankAlertType,
  showCapAlert,
  capAlertType,
  showInsufficientFunds,
  showAutoTrimToast,
  showColorSideAlert,
  // Handlers
  onHandBet,
  onRemoveHandBet,
  onDropChip,
  onRankBet,
  onRemoveRankBet,
  onMoveRankBet,
  onRedBlackBet,
  onRemoveRedBlackBet,
  onLowHighBet,
  onRemoveLowHighBet,
  onSelectChip,
  onClearBets,
  onCloseHandAlert,
  onCloseRankAlert,
  onCloseCapAlert,
  onCloseInsufficientFunds,
  onHideAutoTrimToast,
  onCloseColorSideAlert,
  // Tools
  onOpenStats,
  onOpenMollySimulator,
  onOpenArchetypeBattle,
  onOpenExploitHunter,
  onOpenComplianceReport,
  onOpenKsStrategyTest,
  onOpenObserver,
  onOpenGameTiming,
  onOpenAnalytics,
  onOpenVersions,
  onOpenBellCurve,
  toolsVisible,
  onSetHoveredRankRow,
  onSetHoveredRiverType,
  // v12-specific
  handDisplayOrder,
  boardTheme,
  soundManager,
  resetBankVisible,
  onResetBank,
  activeColorSide,
  preloadSounds,
  onSetTheme,
  onOpenHelp,
  onDealerButton,
  mobileLayout = 'A',
  suppressHowToPlay = false,
  versions = {},
  versionsReady = false,
}) {
  const pid = activePlayer;
  const balance = balances[pid] ?? 20;
  const [gearMenuOpen, setGearMenuOpen] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showHowToPlay, setShowHowToPlay] = React.useState(false);

  // Mobile lock-board copy must mirror the live Versions setting.
  // Prefer DB-loaded versions, then local cached Versions during load, then the explicit parent prop.
  const cachedRankLockThreshold = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('rapidFireGameVersions');
      if (!saved) return undefined;
      const parsed = JSON.parse(saved);
      return parsed?.rankLockThreshold;
    } catch {
      return undefined;
    }
  }, [versionsReady, versions?.rankLockThreshold, rankLockThreshold]);

  const rankLockAt = Number(
    (versionsReady ? versions?.rankLockThreshold : undefined) ??
    cachedRankLockThreshold ??
    rankLockThreshold ??
    versions?.rankLockThreshold ??
    1
  );
  const [muted, setMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(0.4);
  React.useEffect(() => {
    if (soundManager) soundManager.setAmbientVolume(muted ? 0 : volume);
  }, [muted, volume, soundManager]);
  const pHandBets = handBets[pid] || {};
  const pRedBlackBets = redBlackBets[pid] || {};
  const pRankBets = rankBets[pid] || {};
  const pLowHighBet = lowHighBets[pid] || null;
  const activeHandIds = Object.keys(pHandBets).map(Number);
  // ── Match cap calculations (same formulas as desktop layout) ──
  const _totalHandAmt = getTotalHandBets(pHandBets);
  const _totalRankAmt = getTotalRankBets(pRankBets);
  const _totalColorAmt = getTotalColorBets(pRedBlackBets);
  const matchCapRemaining = Math.max(0, _totalHandAmt - _totalRankAmt);
  const colorCap = Math.max(0, (_totalHandAmt + _totalRankAmt) - _totalColorAmt);
  const riverCap = Math.max(0, (_totalHandAmt + _totalRankAmt + _totalColorAmt) - (pLowHighBet?.amount || 0));
  const displayOrder = handDisplayOrder && handDisplayOrder.length === 10
    ? handDisplayOrder
    : FIXED_HANDS.map(h => h.id);


  // ── Landscape mode — 2-col layout ────────────────────────────────────────
  // Landscape mode DISABLED — portrait only until landscape layout is finalized
  // To re-enable: replace the line below with the full detection hook
  const isLandscape = false;

  if (isLandscape) {
    const panelBorder = '1px solid rgba(202,138,4,0.4)';

    return (
      <div
        className={`velvet-board text-white theme-${boardTheme || 'red'}`}
        style={{ width:'100dvw', height:'100dvh', display:'flex', overflow:'hidden' }}
        onClick={preloadSounds}
      >
        {/* ── Alerts ── */}
        <HandBetLimitAlert isOpen={showHandLimitAlert} onClose={onCloseHandAlert} />
        <RankBetLimitAlert isOpen={showRankLimitAlert} onClose={onCloseRankAlert} currentHandBets={handBetCount} alertType={rankAlertType} maxRankSlots={maxRankSlots} />
        <RankBetLimitAlert isOpen={showCapAlert} onClose={onCloseCapAlert} alertType={capAlertType} currentHandBets={handBetCount} />
        <InsufficientFundsAlert isVisible={showInsufficientFunds} onClose={onCloseInsufficientFunds} />
        <AutoTrimToast isVisible={showAutoTrimToast} onHide={onHideAutoTrimToast} />
        <ColorSideAlert isOpen={!!showColorSideAlert} onClose={onCloseColorSideAlert} />

        {/* Unlock flash */}
        {showUnlockFlash && (
          <div style={{ position:'fixed', top:'10%', left:'31%', transform:'translateX(-50%)', zIndex:9999,
            display:'flex', flexDirection:'column', alignItems:'center', borderRadius:8,
            background:'linear-gradient(160deg,rgba(0,0,0,0.97),rgba(25,12,0,0.98))',
            border:'2px solid #eab308', animation:'rfUnlockFadeOut 8s ease forwards',
            pointerEvents:'none', padding:'6px 12px', gap:2 }}>
            <span style={{fontSize:9,fontWeight:900,color:'#eab308',letterSpacing:'0.1em',textTransform:'uppercase'}}>🔓 Bonus Bets Unlocked</span>
            <span style={{fontSize:8,color:'#f87171',fontWeight:700}}>🔴 Color Board Open</span>
            <span style={{fontSize:8,color:'#60a5fa',fontWeight:700}}>🌊 River Bet — After Turn</span>
          </div>
        )}

        {/* ════════════════════════════════════════════
            LEFT COLUMN — 60% — dealer bar INSIDE here
            ════════════════════════════════════════════ */}
        <div style={{ width:'60%', display:'flex', flexDirection:'column',
          borderRight:'1.5px solid rgba(202,138,4,0.4)', overflow:'hidden' }}>

          {/* Dealer bar — left col only, 18px, single line, no wrap */}
          <div style={{ flexShrink:0, height:18, display:'flex', alignItems:'center',
            padding:'0 8px', overflow:'hidden',
            background:'linear-gradient(90deg,rgba(55,22,0,0.95),rgba(70,28,0,0.95))',
            borderBottom:'1px solid rgba(202,138,4,0.4)', whiteSpace:'nowrap' }}>
            <DealerAnnouncement message={dealerMessage} phase={gamePhase} fontSize="0.6rem" height="16px" lineHeight="16px" />
          </div>

          {/* Community cards — 30px hard cap, scale(0.40) */}
          <div style={{ flexShrink:0, height:30, maxHeight:30, overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(0,0,0,0.5)', borderBottom:panelBorder, padding:'0 4px' }}>
            <img src={LOGO_URLS[boardTheme]||LOGO_URLS.red} alt=""
              style={{width:9,height:'auto',borderRadius:2,flexShrink:0,opacity:0.7}} />
            <div style={{ transform:'scale(0.40)', transformOrigin:'center center',
              display:'flex', alignItems:'center', flexShrink:0,
              width:'78%', justifyContent:'center', pointerEvents:'none' }}>
              <CommunityCards cards={communityCards} phase={gamePhase} cardW={42} cardH={60} gap={4} groupGap={8} labelH={14} labelTopGap={3} />
            </div>
            <img src={LOGO_URLS[boardTheme]||LOGO_URLS.red} alt=""
              style={{width:9,height:'auto',borderRadius:2,flexShrink:0,opacity:0.7}} />
          </div>

          {/* Win display */}
          <div style={{flexShrink:0}}>
            <DetailedPayoutDisplay winInfo={lastWinInfo} playerCount={playerCount} onClose={onCloseWinDisplay} />
          </div>

          {/* 5×2 Hand grid — flex:1 but capped so cards stay compact */}
          <div style={{ flex:1, minHeight:0, display:'grid',
            gridTemplateColumns:'repeat(5,1fr)', gridTemplateRows:'repeat(2,1fr)',
            gap:2, padding:'2px', maxHeight:'calc(100% - 80px)' }}>
            {displayOrder.map(hid => {
              const hand = FIXED_HANDS.find(h => h.id === hid);
              if (!hand) return null;
              return (
                <MobileHandCard
                  key={hand.id} hand={hand}
                  isLeading={leadingHandIds.includes(hand.id)}
                  isWinner={winnerHandIds.includes(hand.id)}
                  communityCards={communityCards}
                  betAmount={pHandBets[hand.id]||0}
                  onBet={onHandBet} onRemoveBet={onRemoveHandBet}
                  gamePhase={gamePhase}
                  disabled={balance < selectedChip && !pHandBets[hand.id]}
                  disabledByConstraint={!pHandBets[hand.id] && handBetCount >= maxHandBetsAllowed}
                  onAttemptLockedBet={()=>{}}
                />
              );
            })}
          </div>

          {/* Action bar — chips, countdown, balance, clear, gear */}
          <div style={{ flexShrink:0, height:32, display:'flex', alignItems:'center',
            gap:3, padding:'0 5px',
            borderTop:'1px solid rgba(202,138,4,0.3)', background:'rgba(0,0,0,0.65)' }}>

            <div style={{display:'flex',gap:1,alignItems:'center',flexShrink:0}}>
              {CHIP_VALUES.map(v => (
                <button key={v} onClick={()=>onSelectChip(v)}
                  style={{ lineHeight:0, border:'none', background:'transparent', padding:0, cursor:'pointer',
                    transform: selectedChip===v ? 'scale(1.18)':'scale(1)',
                    filter: selectedChip===v ? 'drop-shadow(0 0 4px rgba(251,191,36,0.9))':'none',
                    opacity: selectedChip===v ? 1:0.6, transition:'all 0.15s' }}>
                  <Chip amount={v} scale={0.34} />
                </button>
              ))}
            </div>

            <div style={{flexShrink:0}}>
              <CountdownClock timeRemaining={countdownTime} isActive={countdownActive} phase={gamePhase} />
            </div>

            <div style={{flex:1}} />

            <div style={{ display:'flex', alignItems:'center', gap:2, flexShrink:0,
              padding:'2px 6px', borderRadius:5, border:'1.5px solid #eab308', background:'#000' }}>
              <span style={{fontSize:7,fontWeight:900,color:'#facc15'}}>P{pid+1}</span>
              <span style={{fontSize:10,fontWeight:900,color:'#facc15',textShadow:'0 0 5px rgba(251,191,36,0.7)'}}>
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {gamePhase==='betting' && totalBet>0 && (
              <button onClick={onClearBets} style={{flexShrink:0,padding:'2px 4px',borderRadius:4,
                border:'1px solid rgba(239,68,68,0.5)',background:'rgba(127,29,29,0.4)',
                color:'#fca5a5',fontSize:8,fontWeight:700,cursor:'pointer'}}>Clear</button>
            )}

            <button onClick={()=>setGearMenuOpen(o=>!o)}
              style={{flexShrink:0,width:22,height:22,borderRadius:5,
                border:'1px solid rgba(234,179,8,0.5)',
                background:gearMenuOpen?'rgba(234,179,8,0.2)':'rgba(0,0,0,0.5)',
                color:'#fde047',display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:11,cursor:'pointer'}}>⚙️</button>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT COLUMN — 40%
            No dealer bar — full height for rank + color/river
            ════════════════════════════════════════════ */}
        <div style={{ width:'40%', flexShrink:0, display:'flex', flexDirection:'column' }}>

          {/* RANK BOARD — top 52% of right col */}
          <div style={{ flex:'52 1 0', minHeight:0, display:'flex', flexDirection:'column',
            background:'rgba(0,0,0,0.55)', borderBottom:'1.5px solid rgba(202,138,4,0.4)',
            overflow:'hidden', padding:'2px' }}>
            <RankBets
              rankBets={pRankBets} allRankBets={rankBets} playerCount={playerCount}
              onRankBet={onRankBet} onRemoveRankBet={onRemoveRankBet} onMoveRankBet={onMoveRankBet}
              gamePhase={gamePhase} winningRank={winningRank} leadingRank={leadingRank}
              disabled={balance < selectedChip} killSwitchActive={killSwitchActive}
              handBetCount={handBetCount} maxRankSlots={maxRankSlots} rankBetCount={rankBetCount}
              unlockedRanks={new Set()} activePlayerId={pid} activeHandIds={activeHandIds}
              onAttemptLockedRank={()=>{}} onHoverRankRow={onSetHoveredRankRow}
              rankLockThreshold={rankLockAt}
            />
          </div>

          {/* COLOR + RIVER — bottom 48% of right col
              overflow visible + position relative so river buttons never get clipped */}
          <div className={luminosityClass} style={{ flex:'48 1 0', minHeight:0,
            display:'flex', flexDirection:'column',
            background:'rgba(0,0,0,0.55)', overflow:'visible', position:'relative',
            padding:'2px' }}>
            <SideBets
              communityCards={communityCards}
              allRedBlackBets={redBlackBets} allLowHighBets={lowHighBets}
              redBlackBets={pRedBlackBets} lowHighBet={pLowHighBet}
              onRedBlackBet={onRedBlackBet} onRemoveRedBlackBet={onRemoveRedBlackBet}
              onLowHighBet={onLowHighBet} onRemoveLowHighBet={onRemoveLowHighBet}
              gamePhase={gamePhase} winningRedBlack={winningRedBlack} winningLowHigh={winningLowHigh}
              disabled={balance < selectedChip}
              killSwitchActive={killSwitchActive} rankBetActive={sideBetGateOpen}
              playerCount={playerCount} totalInvestment={totalBet}
              hoveredRiverType={hoveredRiverType} onHoverRiver={onSetHoveredRiverType}
              riverWinFlash={riverWinFlash} selectedChip={selectedChip}
              hoveredRankRow={hoveredRankRow} isRankBetPlaced={isRankBetPlaced}
              activeColorSide={activeColorSide} onColorSideConflict={onCloseColorSideAlert}
              compactLandscape={true}
              rankLockThreshold={rankLockAt}
            />
          </div>
        </div>

        {/* Gear dropdown */}
        {gearMenuOpen && (
          <div style={{ position:'fixed', bottom:36, right:4, width:168, zIndex:500,
            background:'linear-gradient(160deg,rgba(20,8,0,0.98),rgba(40,15,0,0.98))',
            border:'1px solid rgba(234,179,8,0.45)', borderRadius:12, padding:'7px 0',
            boxShadow:'0 -4px 24px rgba(0,0,0,0.8)' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{padding:'2px 10px 6px',borderBottom:'1px solid rgba(234,179,8,0.2)',marginBottom:3}}>
              <span style={{fontSize:10,fontWeight:800,color:'#fde047',letterSpacing:'0.08em',textTransform:'uppercase'}}>Settings</span>
            </div>
            <div style={{padding:'4px 10px'}}>
              <div style={{fontSize:8,fontWeight:700,color:'rgba(253,224,71,0.6)',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:3}}>Board Color</div>
              <div style={{display:'flex',gap:4}}>
                {[{id:'red',label:'Red',dot:'#dc2626'},{id:'blue',label:'Blue',dot:'#2563eb'},{id:'green',label:'Green',dot:'#16a34a'}].map(t=>(
                  <button key={t.id} onClick={()=>{if(onSetTheme)onSetTheme(t.id);setGearMenuOpen(false);}}
                    style={{flex:1,padding:'3px 2px',borderRadius:5,cursor:'pointer',fontSize:8,fontWeight:700,
                      border:boardTheme===t.id?'1.5px solid #fde047':'1px solid rgba(234,179,8,0.25)',
                      background:boardTheme===t.id?'rgba(234,179,8,0.15)':'rgba(255,255,255,0.04)',
                      color:boardTheme===t.id?'#fde047':'#94a3b8',
                      display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                    <span style={{width:9,height:9,borderRadius:'50%',background:t.dot,display:'block'}} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{borderTop:'1px solid rgba(234,179,8,0.12)',margin:'2px 0'}} />
            <div style={{padding:'4px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:10,fontWeight:700,color:'#cbd5e1'}}>Sound</span>
              <div style={{display:'flex',alignItems:'center',gap:3}}>
                <button onClick={()=>setMuted(m=>!m)}
                  style={{width:22,height:22,borderRadius:4,border:'1px solid rgba(234,179,8,0.35)',
                    background:muted?'rgba(220,38,38,0.2)':'rgba(234,179,8,0.1)',
                    color:muted?'#f87171':'#fde047',fontSize:10,cursor:'pointer',
                    display:'flex',alignItems:'center',justifyContent:'center'}}>{muted?'🔇':'🔊'}</button>
                <input type="range" min="0" max="1" step="0.05" value={volume}
                  onChange={e=>{setVolume(parseFloat(e.target.value));setMuted(false);}}
                  style={{width:44,accentColor:'#eab308'}} />
              </div>
            </div>
            <div style={{borderTop:'1px solid rgba(234,179,8,0.12)',margin:'2px 0'}} />
            <div style={{padding:'3px 10px'}}><GameRulesModal asMenuItem /></div>
            <div style={{borderTop:'1px solid rgba(234,179,8,0.12)',margin:'2px 0'}} />
            {resetBankVisible && (<>
              <div style={{padding:'3px 10px'}}>
                <button onClick={()=>{onResetBank();setGearMenuOpen(false);}}
                  style={{width:'100%',padding:'5px 0',borderRadius:6,cursor:'pointer',
                    border:'1px solid rgba(234,179,8,0.4)',background:'rgba(234,179,8,0.08)',
                    color:'#fde047',fontSize:10,fontWeight:700}}>💰 Reset Bank</button>
              </div>
              <div style={{borderTop:'1px solid rgba(234,179,8,0.12)',margin:'2px 0'}} />
            </>)}
            <div style={{padding:'3px 10px'}}>
              <button onClick={()=>{setShowHistory(true);setGearMenuOpen(false);}}
                style={{width:'100%',padding:'5px 0',borderRadius:6,cursor:'pointer',
                  border:'1px solid rgba(234,179,8,0.4)',background:'rgba(234,179,8,0.08)',
                  color:'#fde047',fontSize:10,fontWeight:700,
                  display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>📜 Hand History</button>
            </div>
            <div style={{borderTop:'1px solid rgba(234,179,8,0.12)',margin:'2px 0'}} />
            <div style={{padding:'3px 10px'}}>
              <button onClick={()=>{if(onOpenHelp)onOpenHelp();else setShowHowToPlay(true);setGearMenuOpen(false);}}
                style={{width:'100%',padding:'5px 0',borderRadius:6,cursor:'pointer',
                  border:'1px solid rgba(234,179,8,0.4)',background:'rgba(234,179,8,0.08)',
                  color:'#fde047',fontSize:10,fontWeight:700,
                  display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>❓ How to Play</button>
            </div>
            <div style={{borderTop:'1px solid rgba(234,179,8,0.12)',margin:'2px 0'}} />
            <div style={{padding:'3px 10px'}}>
              <button onClick={()=>{onOpenStats();setGearMenuOpen(false);}}
                style={{width:'100%',padding:'5px 0',borderRadius:6,cursor:'pointer',
                  border:'1px solid rgba(59,130,246,0.4)',background:'rgba(59,130,246,0.08)',
                  color:'#93c5fd',fontSize:10,fontWeight:700,
                  display:'flex',alignItems:'center',justifyContent:'center',gap:3}}>📊 Player Stats</button>
            </div>
          </div>
        )}

        {/* History overlay */}
        {showHistory && (
          <div style={{position:'fixed',inset:0,zIndex:600,background:'rgba(0,0,0,0.96)',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'8px 12px',borderBottom:'1px solid rgba(234,179,8,0.3)',
              background:'rgba(20,8,0,0.98)',flexShrink:0}}>
              <span style={{color:'#fde047',fontWeight:800,fontSize:12,letterSpacing:'0.08em',textTransform:'uppercase'}}>📜 Hand History</span>
              <button onClick={()=>setShowHistory(false)}
                style={{width:28,height:28,borderRadius:6,border:'1px solid rgba(234,179,8,0.5)',
                  background:'rgba(234,179,8,0.15)',color:'#fde047',fontSize:14,fontWeight:900,
                  cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{flex:1,minHeight:0,padding:'8px',overflowY:'auto'}}>
              <HistoryRail history={history} />
            </div>
          </div>
        )}
        <HowToPlayOverlay versions={versions} versionsReady={versionsReady} forceOpen={showHowToPlay} onClose={()=>setShowHowToPlay(false)} suppress={suppressHowToPlay} />
      </div>
    );
  }
  // ── End landscape ─────────────────────────────────────────────────────────

  return (
    <div
      className={`velvet-board w-full flex flex-col text-white overflow-hidden theme-${boardTheme || 'red'}`}
      style={{ height: '100dvh' }}
      onClick={preloadSounds}
      onTouchStart={preloadSounds}
    >
      {/* ── Alerts ── */}
      <HandBetLimitAlert isOpen={showHandLimitAlert} onClose={onCloseHandAlert} />
      <RankBetLimitAlert isOpen={showRankLimitAlert} onClose={onCloseRankAlert} currentHandBets={handBetCount} alertType={rankAlertType} maxRankSlots={maxRankSlots} />
      <RankBetLimitAlert isOpen={showCapAlert} onClose={onCloseCapAlert} alertType={capAlertType} currentHandBets={handBetCount} />
      <InsufficientFundsAlert isVisible={showInsufficientFunds} onClose={onCloseInsufficientFunds} />
      <AutoTrimToast isVisible={showAutoTrimToast} onHide={onHideAutoTrimToast} />
      <ColorSideAlert isOpen={!!showColorSideAlert} onClose={onCloseColorSideAlert} />

      {/* ── Dealer message bar — fixed height, never moves ── */}
      <div className="flex-shrink-0 px-2 pt-1.5">
        <div style={{
          height: '26px',
          minHeight: '26px',
          maxHeight: '26px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '0.4rem',
          border: '1px solid rgba(202,138,4,0.4)',
          background: 'linear-gradient(90deg, rgba(78,47,0,0.5) 0%, rgba(83,37,0,0.5) 100%)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}>
          <DealerAnnouncement message={dealerMessage} phase={gamePhase} fontSize="0.75rem" height="24px" lineHeight="24px" />
        </div>
      </div>

      {/* Bonus Bets Unlocked — moved into River board wrappers below */}

      {mobileLayout === 'B' ? (
        <>
{/* ── Main game area ── */}
      <div className="flex-1 min-h-0 px-0.5 pt-2 pb-0 flex flex-col gap-2" style={{ touchAction: 'none' }}>

        {/* Rank + Color/River — clock floats at the top boundary overlapping both */}
        <div className="flex-1 min-h-0 flex gap-1.5" style={{ position: 'relative' }}>
          {/* Clock overlaps bottom of hand grid and top of rank/color boards */}
          <div style={{
            position: 'absolute',
            top: -26,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            pointerEvents: 'none',
          }}>
            <CountdownClock timeRemaining={countdownTime} isActive={countdownActive} phase={gamePhase} />
          </div>

          {/* Rank board */}
          <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.45)', padding: '6px', border: '3px solid #e8b84b', boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)' }}>
            <div className="flex-1 min-h-0 overflow-hidden">
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
                activeHandIds={activeHandIds}
                onAttemptLockedRank={() => {}}
                onHoverRankRow={onSetHoveredRankRow}
                rankLockThreshold={rankLockAt}
                fontScale={0.85}
                chipScale={0.42}
                compactHeader={true}
                matchCapRemaining={matchCapRemaining}
              />
            </div>
          </div>

          {/* Color + River board — River on bottom, popup anchored here */}
          <div className={`flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden ${luminosityClass}`} style={{ background: 'transparent', padding: '0px', position: 'relative' }}>
            {showUnlockFlash && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '38%',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.5rem',
                background: 'linear-gradient(160deg, rgba(0,0,0,0.97) 0%, rgba(25,12,0,0.98) 100%)',
                border: '2px solid #eab308',
                boxShadow: '0 0 20px rgba(234,179,8,0.5)',
                animation: 'rfUnlockFadeOut 8s ease forwards',
                pointerEvents: 'none',
                padding: '4px 6px',
                gap: 1,
              }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#eab308', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>🔓 Bonus Bets Unlocked</span>
                <span style={{ fontSize: 8, color: '#f87171', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>🔴 Color Board Open</span>
                <span style={{ fontSize: 8, color: '#60a5fa', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>🌊 River After Turn</span>
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
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
                playerCount={playerCount}
                totalInvestment={totalBet}
                hoveredRiverType={hoveredRiverType}
                onHoverRiver={onSetHoveredRiverType}
                riverWinFlash={riverWinFlash}
                selectedChip={selectedChip}
                hoveredRankRow={hoveredRankRow}
                isRankBetPlaced={isRankBetPlaced}
                activeColorSide={activeColorSide}
                onColorSideConflict={onCloseColorSideAlert}
                chipScale={0.42}
                compactHeader={true}
                colorCap={colorCap}
                riverCap={riverCap}
              />
            </div>
          </div>
        </div>

        {/* 10-hand grid — crypto-shuffled each round */}
        <div
          className="flex-shrink-0 relative grid gap-1"
          style={{
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            height: '36%',
            border: '3px solid #e8b84b',
            borderRadius: '0.75rem',
            boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)',
            background: 'rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            padding: '4px',
          }}
        >
          {displayOrder.map(hid => {
            const hand = FIXED_HANDS.find(h => h.id === hid);
            if (!hand) return null;
            return (
              <MobileHandCard
                key={hand.id}
                hand={hand}
                isLeading={leadingHandIds.includes(hand.id)}
                isWinner={winnerHandIds.includes(hand.id)}
                communityCards={communityCards}
                betAmount={pHandBets[hand.id] || 0}
                onBet={onHandBet}
                onRemoveBet={onRemoveHandBet}
                gamePhase={gamePhase}
                disabled={balance < selectedChip && !pHandBets[hand.id]}
                disabledByConstraint={!pHandBets[hand.id] && handBetCount >= maxHandBetsAllowed}
                onAttemptLockedBet={() => {}}
              />
            );
          })}
        </div>
      </div>

      {/* ── Community Cards ── */}
      <div className="flex-shrink-0 pt-2">
        <div className="rounded-xl bg-black/35 flex items-center justify-center" style={{ height: 96, padding: '4px 6px', margin: '2px', border: '3px solid #e8b84b', boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
          <div className="flex items-center justify-center gap-2 w-full h-full">
            <img src={LOGO_URLS[boardTheme] || LOGO_URLS.red} alt="logo" style={{ width: 34, height: 'auto', borderRadius: 5, flexShrink: 0 }} />
            <CommunityCards cards={communityCards} phase={gamePhase} cardW={42} cardH={60} gap={4} groupGap={8} labelH={14} labelTopGap={3} />
            <img src={LOGO_URLS[boardTheme] || LOGO_URLS.red} alt="logo" style={{ width: 34, height: 'auto', borderRadius: 5, flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* ── Win/No-Win Modal ── */}
      <div className="flex-shrink-0 px-2">
        <DetailedPayoutDisplay winInfo={lastWinInfo} playerCount={playerCount} onClose={onCloseWinDisplay} />
      </div>

              </>
      ) : mobileLayout === 'C' ? (
        <>
{/* ── Layout C: Rank/Color on top, Hands below, Community Cards at bottom ── */}
      <div className="flex-1 min-h-0 px-0.5 pt-1 pb-0 flex flex-col gap-1" style={{ touchAction: 'none' }}>

        {/* Rank + Color/River — at the top */}
        <div className="flex-1 min-h-0 flex gap-1.5" style={{ position: 'relative' }}>
          {/* Clock overlaps top of rank/color boards */}
          <div style={{
            position: 'absolute',
            top: -26,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            pointerEvents: 'none',
          }}>
            <CountdownClock timeRemaining={countdownTime} isActive={countdownActive} phase={gamePhase} />
          </div>

          {/* Rank board */}
          <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.45)', padding: '6px', border: '3px solid #e8b84b', boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)' }}>
            <div className="flex-1 min-h-0 overflow-hidden">
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
                activeHandIds={activeHandIds}
                onAttemptLockedRank={() => {}}
                onHoverRankRow={onSetHoveredRankRow}
                rankLockThreshold={rankLockAt}
                fontScale={0.85}
                chipScale={0.42}
                compactHeader={true}
                matchCapRemaining={matchCapRemaining}
              />
            </div>
          </div>

          {/* Color + River board — River on top in Layout C, popup anchored here */}
          <div className={`flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden ${luminosityClass}`} style={{ background: 'transparent', padding: '0px', position: 'relative' }}>
            {showUnlockFlash && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '38%',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.5rem',
                background: 'linear-gradient(160deg, rgba(0,0,0,0.97) 0%, rgba(25,12,0,0.98) 100%)',
                border: '2px solid #eab308',
                boxShadow: '0 0 20px rgba(234,179,8,0.5)',
                animation: 'rfUnlockFadeOut 8s ease forwards',
                pointerEvents: 'none',
                padding: '4px 6px',
                gap: 1,
              }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#eab308', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>🔓 Bonus Bets Unlocked</span>
                <span style={{ fontSize: 8, color: '#f87171', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>🔴 Color Board Open</span>
                <span style={{ fontSize: 8, color: '#60a5fa', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>🌊 River After Turn</span>
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
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
                playerCount={playerCount}
                totalInvestment={totalBet}
                hoveredRiverType={hoveredRiverType}
                onHoverRiver={onSetHoveredRiverType}
                riverWinFlash={riverWinFlash}
                selectedChip={selectedChip}
                hoveredRankRow={hoveredRankRow}
                isRankBetPlaced={isRankBetPlaced}
                activeColorSide={activeColorSide}
                onColorSideConflict={onCloseColorSideAlert}
                chipScale={0.42}
                compactHeader={true}
                riverFirst={true}
                colorCap={colorCap}
                riverCap={riverCap}
              />
            </div>
          </div>
        </div>

        {/* 10-hand grid — below Rank/Color */}
        <div
          className="flex-shrink-0 relative grid gap-1"
          style={{
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            height: '44%',
            border: '3px solid #e8b84b',
            borderRadius: '0.75rem',
            boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)',
            background: 'rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            padding: '4px',
          }}
        >
          {displayOrder.map(hid => {
            const hand = FIXED_HANDS.find(h => h.id === hid);
            if (!hand) return null;
            return (
              <MobileHandCard
                key={hand.id}
                hand={hand}
                isLeading={leadingHandIds.includes(hand.id)}
                isWinner={winnerHandIds.includes(hand.id)}
                communityCards={communityCards}
                betAmount={pHandBets[hand.id] || 0}
                onBet={onHandBet}
                onRemoveBet={onRemoveHandBet}
                gamePhase={gamePhase}
                disabled={balance < selectedChip && !pHandBets[hand.id]}
                disabledByConstraint={!pHandBets[hand.id] && handBetCount >= maxHandBetsAllowed}
                onAttemptLockedBet={() => {}}
              />
            );
          })}
        </div>
      </div>

      {/* ── Win/No-Win Modal ── */}
      <div className="flex-shrink-0 px-2">
        <DetailedPayoutDisplay winInfo={lastWinInfo} playerCount={playerCount} onClose={onCloseWinDisplay} />
      </div>

              </>
      ) : (
        <>
{/* ── Community Cards ── */}
      <div className="flex-shrink-0 pt-1">
        <div className="rounded-xl bg-black/35 flex items-center justify-center" style={{ height: 96, padding: '4px 6px', margin: '2px', border: '3px solid #e8b84b', boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
          <div className="flex items-center justify-center gap-2 w-full h-full">
            <img src={LOGO_URLS[boardTheme] || LOGO_URLS.red} alt="logo" style={{ width: 34, height: 'auto', borderRadius: 5, flexShrink: 0 }} />
            <CommunityCards cards={communityCards} phase={gamePhase} cardW={42} cardH={60} gap={4} groupGap={8} labelH={14} labelTopGap={3} />
            <img src={LOGO_URLS[boardTheme] || LOGO_URLS.red} alt="logo" style={{ width: 34, height: 'auto', borderRadius: 5, flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* ── Win/No-Win Modal ── */}
      <div className="flex-shrink-0 px-2">
        <DetailedPayoutDisplay winInfo={lastWinInfo} playerCount={playerCount} onClose={onCloseWinDisplay} />
      </div>

      {/* ── Main game area ── */}
      <div className="flex-1 min-h-0 px-0.5 pt-1 pb-0 flex flex-col gap-1.5" style={{ touchAction: 'none' }}>

        {/* 10-hand grid — crypto-shuffled each round */}
        <div
          className="flex-shrink-0 relative grid gap-1"
          style={{
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            height: '36%',
            border: '3px solid #e8b84b',
            borderRadius: '0.75rem',
            boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)',
            background: 'rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
            padding: '4px',
          }}
        >
          {displayOrder.map(hid => {
            const hand = FIXED_HANDS.find(h => h.id === hid);
            if (!hand) return null;
            return (
              <MobileHandCard
                key={hand.id}
                hand={hand}
                isLeading={leadingHandIds.includes(hand.id)}
                isWinner={winnerHandIds.includes(hand.id)}
                communityCards={communityCards}
                betAmount={pHandBets[hand.id] || 0}
                onBet={onHandBet}
                onRemoveBet={onRemoveHandBet}
                gamePhase={gamePhase}
                disabled={balance < selectedChip && !pHandBets[hand.id]}
                disabledByConstraint={!pHandBets[hand.id] && handBetCount >= maxHandBetsAllowed}
                onAttemptLockedBet={() => {}}
              />
            );
          })}
        </div>

        {/* Rank + Color/River — clock floats at the top boundary overlapping both */}
        <div className="flex-1 min-h-0 flex gap-1.5" style={{ position: 'relative' }}>
          {/* Clock overlaps bottom of hand grid and top of rank/color boards */}
          <div style={{
            position: 'absolute',
            top: -26,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            pointerEvents: 'none',
          }}>
            <CountdownClock timeRemaining={countdownTime} isActive={countdownActive} phase={gamePhase} />
          </div>

          {/* Rank board */}
          <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.45)', padding: '6px', border: '3px solid #e8b84b', boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)' }}>
            <div className="flex-1 min-h-0 overflow-hidden">
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
                activeHandIds={activeHandIds}
                onAttemptLockedRank={() => {}}
                onHoverRankRow={onSetHoveredRankRow}
                rankLockThreshold={rankLockAt}
                fontScale={0.85}
                chipScale={0.42}
                compactHeader={true}
                matchCapRemaining={matchCapRemaining}
              />
            </div>
          </div>

          {/* Color + River board — River on bottom, popup anchored here */}
          <div className={`flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden ${luminosityClass}`} style={{ background: 'transparent', padding: '0px', position: 'relative' }}>
            {showUnlockFlash && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '38%',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0.5rem',
                background: 'linear-gradient(160deg, rgba(0,0,0,0.97) 0%, rgba(25,12,0,0.98) 100%)',
                border: '2px solid #eab308',
                boxShadow: '0 0 20px rgba(234,179,8,0.5)',
                animation: 'rfUnlockFadeOut 8s ease forwards',
                pointerEvents: 'none',
                padding: '4px 6px',
                gap: 1,
              }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#eab308', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>🔓 Bonus Bets Unlocked</span>
                <span style={{ fontSize: 8, color: '#f87171', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>🔴 Color Board Open</span>
                <span style={{ fontSize: 8, color: '#60a5fa', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>🌊 River After Turn</span>
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-hidden">
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
                playerCount={playerCount}
                totalInvestment={totalBet}
                hoveredRiverType={hoveredRiverType}
                onHoverRiver={onSetHoveredRiverType}
                riverWinFlash={riverWinFlash}
                selectedChip={selectedChip}
                hoveredRankRow={hoveredRankRow}
                isRankBetPlaced={isRankBetPlaced}
                activeColorSide={activeColorSide}
                onColorSideConflict={onCloseColorSideAlert}
                chipScale={0.42}
                compactHeader={true}
                colorCap={colorCap}
                riverCap={riverCap}
              />
            </div>
          </div>
        </div>
      </div>

              </>
      )}{/* ── Bottom action bar — gold-bordered like desktop ── */}
      <div className="flex-shrink-0 px-2 py-1.5 flex items-center gap-1"
        style={{
          border: '3px solid #e8b84b',
          boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)',
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '0.75rem',
          margin: '2px',
        }}>

        {/* Chips */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {CHIP_VALUES.map(v => (
            <button
              key={v}
              onClick={() => onSelectChip(v)}
              className={`relative transition-all duration-150 rounded-full border-0 bg-transparent p-0
                ${selectedChip === v ? 'scale-125 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}
              style={{ lineHeight: 0 }}
            >
              <Chip amount={v} scale={0.58} />
            </button>
          ))}
        </div>

        {/* Clear button — fixed-width slot, visibility toggled to prevent layout shift */}
        <div style={{ flexShrink: 0, width: 44, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClearBets}
            className="px-2 py-1 rounded-lg border border-red-700/50 bg-red-900/30 text-red-300 font-semibold"
            style={{ fontSize: '0.65rem', visibility: (gamePhase === 'betting' && totalBet > 0) ? 'visible' : 'hidden' }}
          >
            Clear
          </button>
        </div>

        {/* Dealer button — fixed-width slot, visibility toggled to prevent layout shift */}
        <div style={{ flexShrink: 0, width: 52, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onDealerButton}
            disabled={gamePhase === 'betting' && Object.keys(pHandBets).length === 0}
            style={{
              padding: '4px 8px', borderRadius: 8, border: '2px solid #4ade80',
              background: '#15803d', color: '#fff', fontWeight: 900, fontSize: '0.65rem',
              cursor: 'pointer', letterSpacing: '0.04em',
              visibility: (gamePhase === 'betting' || gamePhase === 'flop' || gamePhase === 'lowHighBetting' || gamePhase === 'winner') && onDealerButton ? 'visible' : 'hidden',
              opacity: (gamePhase === 'betting' && Object.keys(pHandBets).length === 0) ? 0.4 : 1,
            }}
          >
            DEAL
          </button>
        </div>

        {/* Balance — no P1 label, compact */}
        <div className="flex items-center px-2 py-1 rounded-xl border-2 border-yellow-500 bg-black flex-shrink-0">
          <span className="text-yellow-400 font-black" style={{ fontSize: '0.85rem', textShadow: '0 0 8px rgba(251,191,36,0.7)' }}>
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Gear menu button + dropdown */}
        <div className="flex items-center gap-1 flex-shrink-0" style={{ position: 'relative' }}>

          {/* ⚙️ Gear button */}
          <button
            onClick={() => setGearMenuOpen(o => !o)}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(234,179,8,0.5)',
              background: gearMenuOpen ? 'rgba(234,179,8,0.2)' : 'rgba(0,0,0,0.5)',
              color: '#fde047', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: 16,
            }}
          >
            ⚙️
          </button>

          {/* Gear dropdown — scrollable, pops up above. Fixed to true viewport
              edges (not the small gear-button wrapper) with a width clamp so it
              can never render partially off-screen regardless of container width. */}
          {gearMenuOpen && (
            <>
            {/* Click-away backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'transparent' }}
              onClick={() => setGearMenuOpen(false)}
            />
            <div
              style={{
                position: 'fixed', bottom: 58, right: 8,
                width: 210,
                maxWidth: 'calc(100vw - 16px)',
                maxHeight: '75vh',
                overflowY: 'auto',
                background: 'linear-gradient(170deg, #1a0f00 0%, #0a0500 100%)',
                border: '3px solid #e8b84b',
                borderRadius: 14,
                boxShadow: '0 0 0 1px #000 inset, 0 -4px 24px rgba(0,0,0,0.7), 0 0 16px rgba(232,184,75,0.15)',
                zIndex: 300,
                padding: 0,
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* ═══ TITLE BAR ═══ */}
              <div style={{
                padding: '10px 14px 8px',
                background: 'linear-gradient(180deg, rgba(232,184,75,0.12) 0%, transparent 100%)',
                borderBottom: '2px solid #e8b84b',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#fde047', letterSpacing: '0.14em', fontFamily: "'Oswald', sans-serif" }}>
                  SETTINGS
                </span>
                <span style={{ fontSize: 13, opacity: 0.5 }}>⚙</span>
              </div>

              {/* ═══ ACTION BUTTONS ═══ */}
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>

                {/* Reset Bank */}
                {resetBankVisible && (
                  <button
                    onClick={() => { onResetBank(); setGearMenuOpen(false); }}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1.5px solid rgba(232,184,75,0.4)',
                      background: 'rgba(60,35,0,0.4)',
                      color: '#fde047', fontSize: 13, fontWeight: 700,
                      fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,55,0,0.6)'; e.currentTarget.style.border = '1.5px solid #e8b84b'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(60,35,0,0.4)'; e.currentTarget.style.border = '1.5px solid rgba(232,184,75,0.4)'; }}
                  >
                    <span style={{ fontSize: 14 }}>💰</span> Reset Bank
                  </button>
                )}

                {/* Game Rules */}
                <div style={{
                  borderRadius: 8, overflow: 'hidden',
                  border: '1.5px solid rgba(232,184,75,0.4)',
                  background: 'rgba(60,35,0,0.4)',
                }}>
                  <GameRulesModal asMenuItem />
                </div>

                {/* Hand History */}
                <button
                  onClick={() => { setShowHistory(true); setGearMenuOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1.5px solid rgba(232,184,75,0.4)',
                    background: 'rgba(60,35,0,0.4)',
                    color: '#fde047', fontSize: 13, fontWeight: 700,
                    fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,55,0,0.6)'; e.currentTarget.style.border = '1.5px solid #e8b84b'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(60,35,0,0.4)'; e.currentTarget.style.border = '1.5px solid rgba(232,184,75,0.4)'; }}
                >
                  <span style={{ fontSize: 14 }}>📜</span> Hand History
                </button>

                {/* How To Play */}
                <button
                  onClick={() => {
                    if (onOpenHelp) onOpenHelp();
                    else setShowHowToPlay(true);
                    setGearMenuOpen(false);
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1.5px solid rgba(232,184,75,0.4)',
                    background: 'rgba(60,35,0,0.4)',
                    color: '#fde047', fontSize: 13, fontWeight: 700,
                    fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,55,0,0.6)'; e.currentTarget.style.border = '1.5px solid #e8b84b'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(60,35,0,0.4)'; e.currentTarget.style.border = '1.5px solid rgba(232,184,75,0.4)'; }}
                >
                  <span style={{ fontSize: 14 }}>❓</span> How To Play
                </button>

                {/* Player Stats */}
                <button
                  onClick={() => { onOpenStats(); setGearMenuOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1.5px solid rgba(232,184,75,0.4)',
                    background: 'rgba(60,35,0,0.4)',
                    color: '#fde047', fontSize: 13, fontWeight: 700,
                    fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,55,0,0.6)'; e.currentTarget.style.border = '1.5px solid #e8b84b'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(60,35,0,0.4)'; e.currentTarget.style.border = '1.5px solid rgba(232,184,75,0.4)'; }}
                >
                  <span style={{ fontSize: 14 }}>📊</span> Player Stats
                </button>
              </div>

              <div style={{ height: 0, borderTop: '1px solid rgba(232,184,75,0.4)' }} />

              {/* ═══ BOARD COLOR ═══ */}
              <div style={{ padding: '10px 12px' }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: 'rgba(253,224,71,0.65)',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  fontFamily: "'Oswald', sans-serif", marginBottom: 7,
                }}>
                  Board Color
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  {[
                    { id: 'red',   label: 'Red',   dot: '#dc2626' },
                    { id: 'blue',  label: 'Blue',  dot: '#2563eb' },
                    { id: 'green', label: 'Green', dot: '#16a34a' },
                  ].map(t => {
                    const selected = boardTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { if (onSetTheme) onSetTheme(t.id); }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8,
                          border: selected ? '2.5px solid #e8b84b' : '1.5px solid rgba(232,184,75,0.4)',
                          background: selected ? 'rgba(100,60,0,0.5)' : 'rgba(0,0,0,0.3)',
                          color: selected ? '#fde047' : '#94a3b8',
                          fontSize: 11, fontWeight: 700,
                          fontFamily: "'Oswald', sans-serif",
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          transition: 'all 0.15s',
                          boxShadow: selected ? '0 0 8px rgba(232,184,75,0.2)' : 'none',
                        }}
                      >
                        <span style={{
                          width: 18, height: 18, borderRadius: '50%', background: t.dot,
                          display: 'block',
                          border: selected ? '2px solid #fde047' : '1.5px solid rgba(255,255,255,0.25)',
                          boxShadow: selected ? `0 0 6px ${t.dot}` : 'none',
                        }} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 0, borderTop: '1px solid rgba(232,184,75,0.4)' }} />

              {/* ═══ SOUND (Bottom section) ═══ */}
              <div style={{ padding: '10px 12px 12px' }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: 'rgba(253,224,71,0.65)',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  fontFamily: "'Oswald', sans-serif", marginBottom: 7,
                }}>
                  Sound
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8,
                  border: '1.5px solid rgba(232,184,75,0.4)',
                  background: 'rgba(0,0,0,0.35)',
                }}>
                  {/* Mute button */}
                  <button
                    onClick={() => setMuted(m => !m)}
                    title={muted ? 'Unmute' : 'Mute'}
                    style={{
                      width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                      border: `1.5px solid ${muted ? '#dc2626' : '#e8b84b'}`,
                      background: muted ? 'rgba(220,38,38,0.15)' : 'rgba(232,184,75,0.1)',
                      color: muted ? '#f87171' : '#fde047',
                      fontSize: 15, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {muted ? '🔇' : '🔊'}
                  </button>

                  {/* Volume slider — inline */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.06em',
                        color: muted ? '#6b7280' : 'rgba(253,224,71,0.7)',
                      }}>
                        VOL
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, fontFamily: "'Oswald', sans-serif",
                        color: muted ? '#6b7280' : '#fde047',
                      }}>
                        {muted ? 'MUTED' : `${Math.round(volume * 100)}%`}
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={muted ? 0 : volume}
                      onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                      style={{ width: '100%', height: 5, cursor: 'pointer', accentColor: '#e8b84b' }}
                    />
                  </div>
                </div>
              </div>

            </div>
            </>
          )}
        </div>
      </div>

      {/* ── Community Cards (Layout C only — below footer) ── */}
      {mobileLayout === 'C' && (
        <div className="flex-shrink-0 pt-0 pb-1">
          <div className="bg-black/35 flex items-center justify-center" style={{ height: 88, padding: '4px 6px', margin: '2px', border: '3px solid #e8b84b', borderRadius: '0.75rem', boxShadow: '0 0 0 1px #000 inset, 0 0 8px rgba(232,184,75,0.3), 0 2px 8px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
            <div className="flex items-center justify-center gap-2 w-full h-full">
              <img src={LOGO_URLS[boardTheme] || LOGO_URLS.red} alt="logo" style={{ width: 34, height: 'auto', borderRadius: 5, flexShrink: 0 }} />
              <CommunityCards cards={communityCards} phase={gamePhase} cardW={42} cardH={60} gap={4} groupGap={8} labelH={14} labelTopGap={3} />
              <img src={LOGO_URLS[boardTheme] || LOGO_URLS.red} alt="logo" style={{ width: 34, height: 'auto', borderRadius: 5, flexShrink: 0 }} />
            </div>
          </div>
        </div>
      )}

      {/* ── How To Play Overlay ── */}
          <HowToPlayOverlay
            versions={versions}
            versionsReady={versionsReady}
            forceOpen={showHowToPlay}
            onClose={() => setShowHowToPlay(false)}
            suppress={suppressHowToPlay}
          />

          {/* ── History Rail Overlay ── */}
          {showHistory && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Header bar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid rgba(234,179,8,0.3)',
                background: 'rgba(20,8,0,0.95)',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fde047', fontWeight: 800, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  📜 Hand History
                </span>
                <button
                  onClick={() => setShowHistory(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: '1px solid rgba(234,179,8,0.5)',
                    background: 'rgba(234,179,8,0.15)',
                    color: '#fde047', fontSize: 18, fontWeight: 900,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Rail content */}
              <div style={{ flex: 1, minHeight: 0, padding: '12px 12px', overflowY: 'auto' }}>
                <HistoryRail history={history} />
              </div>
            </div>
          )}
    </div>
  );
}