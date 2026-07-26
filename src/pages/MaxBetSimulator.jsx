import { useState, useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Calculator, TrendingDown, Info, FlaskConical } from 'lucide-react';

const TOTAL = 201376;
const THRESHOLD = 1200;
const TARGET_PROB = 0.0001;

const HAND_DATA = {
  1: { maxBet: 10.34, topCoeff: 116.77, lockups: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,471,1300,2380,3288,8429,8735,8832,8832,8917,9221,9248,9311,9311,9311,9626,9626,9626,9666,9666,9666,9666,9742,10013,10047,10134,10194,10194,10555,10812,10812] },
  2: { maxBet: 5.66,  topCoeff: 213.24, lockups: [0,0,0,0,0,0,0,0,0,0,2419,8735,8832,9221,9221,9311,9311,9626,9626,9626,9626,9666,9875,9938,10218,10499,10996,11439,11439,12027,12235,12813,12841,12985,13155,13287,13722,15472,17233,19070,19924,21741,22728,23635,24834,26248,27665,28956,32903] },
  3: { maxBet: 3.83,  topCoeff: 315.12, lockups: [0,0,0,0,0,0,1797,8736,8917,9221,9311,9626,9626,9626,9680,9923,10120,10947,11175,11536,12235,12813,12841,13089,13455,15237,16763,18593,19488,19714,22479,25218,26771,30759,33520,35907,38452,43931,46653,49385,57000,62492,76758,81665,90185,92613,93768,95455,97085] },
  4: { maxBet: 2.88,  topCoeff: 418.71, lockups: [0,0,0,0,1766,8832,9221,9311,9626,9626,9660,9875,10120,11126,11536,12235,12813,13089,13453,16477,17436,18834,19566,22330,25746,30183,34247,36523,42260,46653,49391,58871,75836,81175,83234,89154,92424,95655,97147,104989,107555,110386,114155,115461,117984,119762,127368,131627,134132] },
  5: { maxBet: 2.31,  topCoeff: 522.30, lockups: [0,0,0,2738,8832,9311,9626,9626,9807,10120,10998,11432,12813,12841,13453,16413,17436,18631,21030,24433,29899,34348,38065,44378,49391,58871,77944,81185,84270,89267,93269,97699,104819,108848,113129,115036,119256,124810,127916,131947,132975,142936,145123,152120,162809,162809,169964,194174,194174] },
  6: { maxBet: 1.93,  topCoeff: 625.89, lockups: [0,0,976,8832,9311,9626,9626,9979,10870,12027,12813,13089,14713,17215,18631,21359,26282,31245,37054,42828,49083,63787,81165,83619,86240,90471,94667,104436,109011,112037,116533,119337,127738,129389,133067,140793,151022,158659,166369,169964,194174,200488,200533,200533,200533,200620,200620,200620,201376] },
  7: { maxBet: 1.66,  topCoeff: 729.48, lockups: [0,0,8832,9311,9626,9660,10120,11126,12235,12983,14713,17250,18709,22493,28621,34163,41298,48535,65825,81175,84999,86240,92363,102387,107399,111622,118230,124385,127916,130509,138550,148837,158659,166369,182995,200488,200533,200533,200545,200620,200620,201376,201376,201376,201376,201376,201376,201376,201376] },
  8: { maxBet: 1.45,  topCoeff: 833.07, lockups: [0,853,9221,9626,9626,10120,11126,12813,13097,16507,17887,21749,27390,34288,42267,51248,80110,83593,85488,90682,101149,107399,111622,118230,127313,129069,130645,143528,155754,166369,190506,200488,200533,200545,200545,200620,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376] },
  9: { maxBet: 1.29,  topCoeff: 936.66, lockups: [0,8736,9311,9626,9847,10998,12813,13453,16683,18864,22655,31690,40154,49331,76587,83593,85488,90682,101701,108886,115415,123359,127916,130551,143528,156474,169964,190506,200488,200545,200545,200620,200620,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376,201376] },
};

function getLockupCount(hands, betIdx) {
  const arr = HAND_DATA[hands]?.lockups;
  if (!arr || betIdx < 0 || betIdx >= arr.length) return 0;
  return arr[betIdx];
}

// Round to nearest $0.50
function snapToHalf(val) {
  return Math.round(val * 2) / 2;
}

// Card/Rank payouts for live validation
const CARD_ODDS = { 'A♦/10♥': 20.3, 'K♣/K♠': 4.35, 'Q♣/J♠': 15.8, 'Q♠/10♠': 9.0, 'J♣/9♣': 7.4, '8♦/6♦': 5.9, '7♦/7♠': 6.8, '4♥/2♥': 7.3, '3♣/3♥': 9.1, 'A♥/5♦': 15.8 };
const RANK_ODDS = {
  'A♦/10♥':  { 'One Pair': 28.2, 'Two Pair': 3.3, '3 Kind': 8.16, 'Straight': 3.31, 'Flush': 5.55, 'Full House': 2.86 },
  'K♣/K♠':   { 'Two Pair': 3.3, '3 Kind': 1.63, 'Straight': 70, 'Flush': 12.67, 'Full House': 1.34, '4 Kind': 7.63 },
  'Q♣/J♠':   { 'Two Pair': 5.17, '3 Kind': 8.15, 'Straight': 0.74, 'Full House': 4.29 },
  'Q♠/10♠':  { 'Two Pair': 25.45, 'Straight': 2.02, 'Flush': 0.75, 'Full House': 8.94 },
  'J♣/9♣':   { 'Two Pair': 20.25, '3 Kind': 10.81, 'Straight': 3.53, 'Flush': 1.11, 'Full House': 4.74, '4 Kind': 54 },
  '8♦/6♦':   { 'Two Pair': 14.13, '3 Kind': 7.73, 'Straight': 3.51, 'Flush': 1.56, 'Full House': 3.78, '4 Kind': 32.48 },
  '7♦/7♠':   { '3 Kind': 2.11, 'Straight': 10.69, 'Full House': 1.17, '4 Kind': 5.04 },
  '4♥/2♥':   { 'Two Pair': 12.43, '3 Kind': 5.7, 'Straight': 5.57, 'Flush': 1.17, 'Full House': 5.16, '4 Kind': 27.3 },
  '3♣/3♥':   { '3 Kind': 2.21, 'Straight': 14.6, 'Full House': 1.28, '4 Kind': 3.63 },
  'A♥/5♦':   { 'Two Pair': 4.97, '3 Kind': 4.79, 'Straight': 2.84, 'Flush': 7.71, 'Full House': 2.46, '4 Kind': 26.4 },
};
const COLOR_ODDS = { 3: 1.87, 4: 5.65, 5: 43.0 };
const RIVER_ODDS = { '2L2H': [0.904, 0.904], '3L1H': [1.06, 0.79], '1L3H': [0.79, 1.06], '4L0H': [1.23, 0.68], '0L4H': [0.68, 1.23] };
const BET_DISPLAY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 25];

export default function MaxBetSimulator() {
  const [selectedHands, setSelectedHands] = useState(2);
  const [betSlider, setBetSlider] = useState(10);
  const [betInputStr, setBetInputStr] = useState('5.00');

  // Validate tab state
  const [vHands, setVHands] = useState(9);
  const [vBetPerHand, setVBetPerHand] = useState('20');
  const [vWinHand, setVWinHand] = useState('8♦/6♦');
  const [vWinRank, setVWinRank] = useState('4 Kind');
  const [vColorCount, setVColorCount] = useState('0');
  const [vColorOdds, setVColorOdds] = useState('43');
  const [vRiverWon, setVRiverWon] = useState(false);
  const [vRiverOdds, setVRiverOdds] = useState('1.23');
  const [activeTab, setActiveTab] = useState('simulator');

  const betDollars = betSlider / 2;
  const betIdx = betSlider - 2;
  const currentData = HAND_DATA[selectedHands];
  const lockupCount = getLockupCount(selectedHands, betIdx);
  const lockupProb = lockupCount / TOTAL;
  const worstPayout = betDollars * currentData.topCoeff;
  const isSafe = lockupProb < TARGET_PROB;

  function handleSliderChange(e) {
    const v = Number(e.target.value);
    setBetSlider(v);
    setBetInputStr((v / 2).toFixed(2));
  }

  function handleBetInput(e) {
    setBetInputStr(e.target.value);
  }

  function handleBetInputBlur() {
    const val = parseFloat(betInputStr);
    if (!isNaN(val) && val >= 1 && val <= 25) {
      const snapped = snapToHalf(val);
      const sliderVal = Math.round(snapped * 2);
      setBetSlider(sliderVal);
      setBetInputStr(snapped.toFixed(2));
    } else {
      setBetInputStr((betSlider / 2).toFixed(2));
    }
  }

  function handleBetInputKey(e) {
    if (e.key === 'Enter') handleBetInputBlur();
  }

  // Live validation calculations
  const vBet = parseFloat(vBetPerHand) || 0;
  const vH = vHands * vBet;
  const vR = vH;
  const vC = 2 * vH;
  const vV = 4 * vH;
  const vTotal = vH + vR + vC + vV;
  const cardOdds = CARD_ODDS[vWinHand] || 0;
  const rankOdds = RANK_ODDS[vWinHand]?.[vWinRank] || 0;
  const colorOdds = parseFloat(vColorOdds) || 0;
  const riverOdds = parseFloat(vRiverOdds) || 0;
  const cardWin = vBet * cardOdds + vBet;
  const rankWin = vR * rankOdds + vR;
  const colorWin = vColorCount !== '0' ? (vC * colorOdds + vC) : 0;
  const riverWin = vRiverWon ? (vV * riverOdds + vV) : 0;
  const vTotalWin = cardWin + rankWin + colorWin + riverWin;
  const vNetWin = vTotalWin - vTotal;
  const vIsLockup = vTotalWin > THRESHOLD;
  const vBetIdx = Math.round(snapToHalf(vBet) * 2) - 2;
  const vLockupCount = getLockupCount(vHands, vBetIdx);
  const vLockupProb = vLockupCount / TOTAL;

  const chartData = useMemo(() => {
    return BET_DISPLAY_LEVELS.map(b => {
      const idx = Math.round(b * 2) - 2;
      const count = getLockupCount(selectedHands, idx);
      return { b, count, prob: count / TOTAL };
    });
  }, [selectedHands]);

  const tabClass = (t) => `px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === t ? 'bg-yellow-700/40 text-yellow-300 border border-yellow-600/50' : 'text-gray-500 hover:text-gray-300'}`;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-200 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-900/30 border border-yellow-700/40 flex items-center justify-center">
          <Shield className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-yellow-300">Max Bet Simulator</h1>
          <p className="text-sm text-gray-500">Lockup threshold analysis — Rapid Fire Texas Hold'em</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={tabClass('simulator')} onClick={() => setActiveTab('simulator')}>Simulator</button>
        <button className={tabClass('validate')} onClick={() => setActiveTab('validate')}>
          <span className="flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5" />Validate a Round</span>
        </button>
        <button className={tabClass('table')} onClick={() => setActiveTab('table')}>Max Bet Table</button>
      </div>

      {/* ── SIMULATOR TAB ── */}
      {activeTab === 'simulator' && (
        <>
          <div className="mb-5 p-4 rounded-lg bg-slate-900/60 border border-slate-700/50 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              Full enumeration of all <span className="text-gray-300 font-semibold">C(32,5) = 201,376</span> community card combinations from the 32-card stock. Every possible outcome evaluated exactly — not Monte Carlo.
              Target: <span className="text-yellow-300 font-semibold">P(lockup) &lt; 1 in 10,000</span> at the <span className="text-gray-300 font-semibold">$1,200</span> W-2G threshold. Data sampled every $0.50.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hand selector */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Card Hands Bet</label>
              <div className="flex gap-1.5 flex-wrap">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} onClick={() => setSelectedHands(n)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${selectedHands === n ? 'bg-yellow-600 text-slate-950 scale-110' : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'}`}>{n}</button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Rank Board ENABLED for 1–9 hands</p>
            </div>

            {/* Bet input */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Card Hand Bet (per hand)</label>
              {/* Direct input box */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number" min="1" max="25" step="0.5"
                  value={betInputStr}
                  onChange={handleBetInput}
                  onBlur={handleBetInputBlur}
                  onKeyDown={handleBetInputKey}
                  className="w-24 px-3 py-1.5 rounded-lg bg-slate-800 border border-yellow-700/40 text-yellow-300 font-bold text-lg text-center focus:outline-none focus:border-yellow-500"
                />
                <span className="text-gray-600 text-xs">per hand (snaps to $0.50)</span>
              </div>
              <input type="range" min="2" max="50" step="1" value={betSlider}
                onChange={handleSliderChange} className="w-full accent-yellow-500" />
              <div className="flex justify-between text-xs text-gray-600 mt-1"><span>$1.00</span><span>$25.00</span></div>
            </div>
          </div>

          {/* Result card */}
          <div className={`mb-5 p-5 rounded-xl border-2 transition-all ${isSafe ? 'bg-green-950/30 border-green-700/40' : 'bg-red-950/30 border-red-700/40'}`}>
            <div className="flex items-center gap-3 mb-4">
              {isSafe ? <CheckCircle2 className="w-7 h-7 text-green-400" /> : <AlertTriangle className="w-7 h-7 text-red-400" />}
              <h2 className="text-lg font-bold">{isSafe ? 'WITHIN SAFE THRESHOLD' : 'LOCKUP THRESHOLD EXCEEDED'}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Lockup Probability</p>
                <p className={`text-2xl font-bold ${isSafe ? 'text-green-300' : 'text-red-300'}`}>{lockupProb > 0 ? `${(lockupProb * 100).toFixed(4)}%` : '0.0000%'}</p>
                <p className="text-xs text-gray-600 mt-0.5">{lockupCount > 0 ? `1 in ${Math.round(TOTAL / lockupCount).toLocaleString()} rounds` : 'No lockups possible'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Lockup Count</p>
                <p className="text-2xl font-bold text-gray-300">{lockupCount.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-0.5">of {TOTAL.toLocaleString()} combinations</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Worst-Case Payout</p>
                <p className={`text-2xl font-bold ${worstPayout >= THRESHOLD ? 'text-red-300' : 'text-gray-300'}`}>${worstPayout.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-0.5">All 4 boards win at max odds</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Max Safe Bet</p>
                <p className="text-2xl font-bold text-yellow-300">${currentData.maxBet}</p>
                <p className="text-xs text-gray-600 mt-0.5">at &lt;1/10,000 threshold</p>
              </div>
            </div>
          </div>

          {/* Cascade breakdown */}
          <div className="mb-5 p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
            <h2 className="text-base font-bold text-gray-300 mb-3">Snowball Cascade — {selectedHands} hand(s) × ${betDollars.toFixed(2)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Card Hands (H)', val: selectedHands * betDollars, color: 'text-blue-300', sub: `${selectedHands} × $${betDollars.toFixed(2)}` },
                { label: 'Rank (R = H)', val: selectedHands * betDollars, color: 'text-purple-300', sub: 'Max = H' },
                { label: 'Color (C = 2H)', val: 2 * selectedHands * betDollars, color: 'text-pink-300', sub: 'Max = H + R' },
                { label: 'River (V = 4H)', val: 4 * selectedHands * betDollars, color: 'text-amber-300', sub: 'Max = H+R+C' },
              ].map(({ label, val, color, sub }) => (
                <div key={label} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-xl font-bold ${color}`}>${val.toFixed(2)}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">Total max wagered: <span className="text-gray-300 font-semibold">${(8 * selectedHands * betDollars).toFixed(2)}</span> (8H)</p>
          </div>

          {/* Bar chart */}
          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-300 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-yellow-500" />Lockup Probability by Bet Level — {selectedHands} hand(s)
            </h2>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50 space-y-1.5">
              {chartData.map(({ b, count, prob }) => {
                const pct = prob * 100;
                const barW = Math.min(pct * 2, 100);
                const safe = prob < TARGET_PROB;
                const active = Math.abs(betDollars - b) < 0.26;
                return (
                  <div key={b} className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-60'}`}>
                    <span className={`w-10 text-sm font-mono ${active ? 'text-yellow-300 font-bold' : 'text-gray-500'}`}>${b}</span>
                    <div className={`flex-1 h-6 bg-slate-800/60 rounded relative overflow-hidden ${active ? 'ring-1 ring-yellow-500/40' : ''}`}>
                      <div className={`h-full rounded ${safe ? 'bg-green-700/70' : 'bg-red-700/70'}`} style={{ width: `${barW}%` }} />
                      <span className="absolute inset-0 flex items-center px-2 text-xs text-gray-300 font-mono">
                        {count > 0 ? `${count.toLocaleString()} (${pct.toFixed(3)}%) — 1 in ${Math.round(TOTAL / count).toLocaleString()}` : '0 lockups'}
                      </span>
                    </div>
                    <span className={`w-4 text-xs ${safe ? 'text-green-400' : 'text-red-400'}`}>{safe ? '✓' : '✗'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── VALIDATE A ROUND TAB ── */}
      {activeTab === 'validate' && (
        <>
          <div className="mb-5 p-4 rounded-lg bg-slate-900/60 border border-blue-700/30 flex gap-3">
            <FlaskConical className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              Enter a round's actual bets and results. The calculator verifies every payout against the official odds tables and checks whether the round would trigger a lockup — confirming the simulator's accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50 space-y-3">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Round Setup</h3>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Hands Bet</label>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button key={n} onClick={() => setVHands(n)}
                      className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${vHands === n ? 'bg-yellow-600 text-slate-950' : 'bg-slate-800 text-gray-400 border border-slate-700'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Bet Per Hand ($)</label>
                <input type="number" value={vBetPerHand} onChange={e => setVBetPerHand(e.target.value)}
                  className="w-28 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-yellow-300 font-bold focus:outline-none focus:border-yellow-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50">
                {[['H', vH, 'blue'], ['R', vR, 'purple'], ['C', vC, 'pink'], ['V', vV, 'amber']].map(([lbl, val, c]) => (
                  <div key={lbl} className="text-center p-2 rounded bg-slate-800/50">
                    <p className="text-xs text-gray-500">{lbl}</p>
                    <p className={`font-bold text-${c}-300`}>${val.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Total wagered: <span className="text-gray-300 font-bold">${vTotal.toFixed(2)}</span></p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50 space-y-3">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Winning Boards</h3>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Winning Card Hand</label>
                <select value={vWinHand} onChange={e => { setVWinHand(e.target.value); setVWinRank(Object.keys(RANK_ODDS[e.target.value]||{})[0]||''); }}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-gray-300 text-sm focus:outline-none">
                  {Object.keys(CARD_ODDS).map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Winning Rank (on Rank Board)</label>
                <select value={vWinRank} onChange={e => setVWinRank(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-gray-300 text-sm focus:outline-none">
                  <option value="">— Rank bet lost —</option>
                  {Object.keys(RANK_ODDS[vWinHand] || {}).map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Color Board (cards same color)</label>
                  <select value={vColorCount} onChange={e => setVColorCount(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-gray-300 text-sm focus:outline-none">
                    <option value="0">Lost / did not bet</option>
                    <option value="3">3 same (1.87:1)</option>
                    <option value="4">4 same (5.65:1)</option>
                    <option value="5">5 same (43:1)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">River Won?</label>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setVRiverWon(true)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold border ${vRiverWon ? 'bg-green-700/40 border-green-600 text-green-300' : 'bg-slate-800 border-slate-600 text-gray-400'}`}>Yes</button>
                    <button onClick={() => setVRiverWon(false)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold border ${!vRiverWon ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-slate-800 border-slate-600 text-gray-400'}`}>No</button>
                  </div>
                </div>
              </div>
              {vRiverWon && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">River Odds (winning side)</label>
                  <select value={vRiverOdds} onChange={e => setVRiverOdds(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-gray-300 text-sm focus:outline-none">
                    <option value="0.904">0.904 (2L2H — even)</option>
                    <option value="0.79">0.79 (favourite, 3L1H or 1L3H)</option>
                    <option value="1.06">1.06 (underdog, 3L1H or 1L3H)</option>
                    <option value="0.68">0.68 (favourite, 4-of-one)</option>
                    <option value="1.23">1.23 (underdog, 4-of-one)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Validation result */}
          <div className={`mb-5 rounded-xl border-2 overflow-hidden ${vIsLockup ? 'border-red-700/60' : 'border-green-700/50'}`}>
            <div className={`px-5 py-3 flex items-center gap-3 ${vIsLockup ? 'bg-red-950/40' : 'bg-green-950/30'}`}>
              {vIsLockup ? <AlertTriangle className="w-6 h-6 text-red-400" /> : <CheckCircle2 className="w-6 h-6 text-green-400" />}
              <h2 className="font-bold text-lg">{vIsLockup ? `LOCKUP — Total win $${vTotalWin.toFixed(2)} exceeds $${THRESHOLD.toLocaleString()} threshold` : `NO LOCKUP — Total win $${vTotalWin.toFixed(2)} is under $${THRESHOLD.toLocaleString()}`}</h2>
            </div>
            <div className="p-5 bg-slate-900/40">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Card Board', val: cardWin, base: vBet, odds: cardOdds, color: 'text-blue-300' },
                  { label: 'Rank Board', val: rankWin, base: vR, odds: rankOdds || 0, color: 'text-purple-300' },
                  { label: 'Color Board', val: colorWin, base: vC, odds: colorOdds, color: 'text-pink-300' },
                  { label: 'River Board', val: riverWin, base: vV, odds: parseFloat(vRiverOdds)||0, color: 'text-amber-300' },
                ].map(({ label, val, base, odds, color }) => (
                  <div key={label} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className={`text-lg font-bold ${color}`}>{val > 0 ? `$${val.toFixed(2)}` : <span className="text-gray-600">$0 (lost)</span>}</p>
                    {odds > 0 && val > 0 && <p className="text-xs text-gray-600">${base.toFixed(2)} × {odds}:1</p>}
                  </div>
                ))}
              </div>
              <div className="flex gap-6 pt-3 border-t border-slate-700/50">
                <div><p className="text-xs text-gray-500">Total Wagered</p><p className="text-xl font-bold text-gray-300">${vTotal.toFixed(2)}</p></div>
                <div><p className="text-xs text-gray-500">Total Win</p><p className="text-xl font-bold text-yellow-300">${vTotalWin.toFixed(2)}</p></div>
                <div><p className="text-xs text-gray-500">Net Win</p><p className={`text-xl font-bold ${vNetWin >= 0 ? 'text-green-300' : 'text-red-300'}`}>{vNetWin >= 0 ? '+' : ''}${vNetWin.toFixed(2)}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <p className="text-xs text-gray-500">
                  Simulator says at ${snapToHalf(vBet).toFixed(2)}/hand × {vHands} hands: <span className={vLockupProb < TARGET_PROB ? 'text-green-400' : 'text-red-400'}>
                    {vLockupCount.toLocaleString()} lockup scenarios ({(vLockupProb * 100).toFixed(4)}% — 1 in {vLockupCount > 0 ? Math.round(TOTAL / vLockupCount).toLocaleString() : '∞'} rounds)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MAX BET TABLE TAB ── */}
      {activeTab === 'table' && (
        <>
          <div className="mb-4 p-3 rounded-lg bg-slate-900/40 border border-slate-700/30">
            <p className="text-xs text-gray-500">Max bet per card hand where P(lockup) &lt; 1 in 10,000 at the $1,200 W-2G threshold. Click any row to load it into the Simulator.</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-700/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/80 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Hands</th>
                  <th className="px-4 py-3 text-right">Max Safe Bet</th>
                  <th className="px-4 py-3 text-right">Worst Coeff</th>
                  <th className="px-4 py-3 text-right">$5 / hand</th>
                  <th className="px-4 py-3 text-right">$10 / hand</th>
                  <th className="px-4 py-3 text-right">$20 / hand</th>
                  <th className="px-4 py-3 text-center">Rating</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(HAND_DATA).map(([n, d]) => {
                  const n_num = Number(n);
                  const l5 = d.lockups[8] || 0;   // $5 = idx 8
                  const l10 = d.lockups[18] || 0;  // $10 = idx 18
                  const l20 = d.lockups[38] || 0;  // $20 = idx 38
                  return (
                    <tr key={n} onClick={() => { setSelectedHands(n_num); setActiveTab('simulator'); }}
                      className="border-t border-slate-800 cursor-pointer hover:bg-yellow-900/10 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-300">{n_num}</td>
                      <td className="px-4 py-3 text-right font-bold text-yellow-300">${d.maxBet}</td>
                      <td className="px-4 py-3 text-right text-gray-400">{d.topCoeff.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-mono text-xs ${l5 / TOTAL < TARGET_PROB ? 'text-green-400' : 'text-red-400'}`}>{l5.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-mono text-xs ${l10 / TOTAL < TARGET_PROB ? 'text-green-400' : 'text-red-400'}`}>{l10.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-mono text-xs ${l20 / TOTAL < TARGET_PROB ? 'text-green-400' : 'text-red-400'}`}>{l20.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        {n_num <= 2 ? <span className="text-xs px-2 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-700/30">SAFE</span>
                          : n_num <= 4 ? <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/40 text-yellow-400 border border-yellow-700/30">CAUTION</span>
                          : <span className="text-xs px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-700/30">HIGH RISK</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-slate-900/40 border border-slate-700/30">
            <h3 className="text-sm font-bold text-gray-400 mb-2">Methodology</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              The 32-card community stock is the 52-card deck minus the 20 cards from the 10 fixed player hands.
              All C(32,5) = 201,376 five-card combinations are enumerated. For each, all 10 hands are evaluated
              using best-5-of-7 Texas Hold'em rules. Aggregate payout assumes worst-case strategy: rank bets on
              the winning rank, color bets on the highest-paying position, river bet on the underdog side.
              Lockup counts are pre-computed at $0.50 increments from $1.00–$25.00. Lockup probability =
              combinations exceeding $1,200 / 201,376.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
