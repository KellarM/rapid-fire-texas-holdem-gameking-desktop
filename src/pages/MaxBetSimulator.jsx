import { useState, useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Calculator, TrendingDown, Info } from 'lucide-react';

// ============================================================
// SIMULATION DATA — Full enumeration of C(32,5) = 201,376
// community card combinations from the 32-card stock.
// lockups array: index 0 = $1.00, index 1 = $1.50, ..., index 48 = $25.00
// step = $0.50 per index. Lookup: index = (bet * 2) - 2
// ============================================================
const TOTAL = 201376;
const THRESHOLD = 1200;
const TARGET_PROB = 0.0001; // 1 in 10,000

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

// Slider step: $0.50. Range $1.00–$25.00 → 49 values
// betLevel = slider value (integer 2–50 representing $1.00–$25.00 in $0.50 steps)
// actual $ = betLevel / 2
// array index = betLevel - 2

function getLockupCount(hands, betIdx) {
  const arr = HAND_DATA[hands]?.lockups;
  if (!arr || betIdx < 0 || betIdx >= arr.length) return 0;
  return arr[betIdx];
}

const BET_DISPLAY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 25];

export default function MaxBetSimulator() {
  const [selectedHands, setSelectedHands] = useState(2);
  // Slider value = betLevel (int, 2–50) → actual bet = betLevel/2
  const [betSlider, setBetSlider] = useState(10); // = $5.00

  const betDollars = betSlider / 2; // e.g. slider=10 → $5.00, slider=22 → $11.00
  const betIdx = betSlider - 2;     // array index
  const currentData = HAND_DATA[selectedHands];
  const lockupCount = getLockupCount(selectedHands, betIdx);
  const lockupProb = lockupCount / TOTAL;
  const worstPayout = betDollars * currentData.topCoeff;
  const isSafe = lockupProb < TARGET_PROB;

  // Build bar chart data
  const chartData = useMemo(() => {
    return BET_DISPLAY_LEVELS.map(b => {
      const idx = Math.round(b * 2) - 2;
      const count = getLockupCount(selectedHands, idx);
      return { b, count, prob: count / TOTAL };
    });
  }, [selectedHands]);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-200 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-yellow-900/30 border border-yellow-700/40 flex items-center justify-center">
          <Shield className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-yellow-300">Max Bet Simulator</h1>
          <p className="text-sm text-gray-500">Lockup threshold analysis for Rapid Fire Texas Hold'em</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 rounded-lg bg-slate-900/60 border border-slate-700/50 flex gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-400">
          Full enumeration of all <span className="text-gray-300 font-semibold">C(32,5) = 201,376</span> community card
          combinations from the 32-card stock. Every possible game outcome evaluated exactly — not a Monte Carlo estimate.
          Target: <span className="text-yellow-300 font-semibold">P(lockup) &lt; 1 in 10,000</span> (0.01%) at the
          <span className="text-gray-300 font-semibold"> ${THRESHOLD.toLocaleString()}</span> W-2G threshold.
          Lockup data sampled every <span className="text-gray-300 font-semibold">$0.50</span>.
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <label className="text-sm font-semibold text-gray-400 mb-2 block">Number of Card Hands Bet</label>
          <div className="flex gap-1.5 flex-wrap">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => setSelectedHands(n)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all
                  ${selectedHands === n
                    ? 'bg-yellow-600 text-slate-950 scale-110'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'}`}>
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Rank Board ENABLED for 1–9 hands</p>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <label className="text-sm font-semibold text-gray-400 mb-2 block">
            Card Hand Bet: <span className="text-yellow-300 text-2xl font-bold">${betDollars.toFixed(2)}</span>
            <span className="text-gray-600 text-xs ml-2">(steps of $0.50)</span>
          </label>
          <input
            type="range" min="2" max="50" step="1" value={betSlider}
            onChange={e => setBetSlider(Number(e.target.value))}
            className="w-full accent-yellow-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>$1.00</span><span>$25.00</span>
          </div>
        </div>
      </div>

      {/* Live result card */}
      <div className={`mb-6 p-5 rounded-xl border-2 transition-all
        ${isSafe ? 'bg-green-950/30 border-green-700/40' : 'bg-red-950/30 border-red-700/40'}`}>
        <div className="flex items-center gap-3 mb-4">
          {isSafe
            ? <CheckCircle2 className="w-7 h-7 text-green-400" />
            : <AlertTriangle className="w-7 h-7 text-red-400" />}
          <h2 className="text-lg font-bold">
            {isSafe ? 'WITHIN SAFE THRESHOLD' : 'LOCKUP THRESHOLD EXCEEDED'}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Lockup Probability</p>
            <p className={`text-2xl font-bold ${isSafe ? 'text-green-300' : 'text-red-300'}`}>
              {lockupProb > 0 ? `${(lockupProb * 100).toFixed(4)}%` : '0.0000%'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {lockupCount > 0 ? `1 in ${Math.round(TOTAL / lockupCount).toLocaleString()} rounds` : 'No lockups possible'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Lockup Count</p>
            <p className="text-2xl font-bold text-gray-300">{lockupCount.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-0.5">of {TOTAL.toLocaleString()} combinations</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Worst-Case Payout</p>
            <p className={`text-2xl font-bold ${worstPayout >= THRESHOLD ? 'text-red-300' : 'text-gray-300'}`}>
              ${worstPayout.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">All 4 boards win at max odds</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Max Safe Bet</p>
            <p className="text-2xl font-bold text-yellow-300">${currentData.maxBet}</p>
            <p className="text-xs text-gray-600 mt-0.5">at &lt;1/10,000 threshold</p>
          </div>
        </div>
      </div>

      {/* Max bet summary table */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-300 mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-yellow-500" />
          Max Bet by Hand Count — $1,200 W-2G Threshold
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Hands</th>
                <th className="px-4 py-3 text-right">Max Safe Bet</th>
                <th className="px-4 py-3 text-right">Worst Coeff</th>
                <th className="px-4 py-3 text-right">$5 Lockups</th>
                <th className="px-4 py-3 text-right">$10 Lockups</th>
                <th className="px-4 py-3 text-center">Rating</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(HAND_DATA).map(([n, d]) => {
                const n_num = Number(n);
                // $5 = slider 10, idx 8. $10 = slider 20, idx 18
                const lock5  = d.lockups[8]  || 0;
                const lock10 = d.lockups[18] || 0;
                const safe5  = lock5  / TOTAL < TARGET_PROB;
                const safe10 = lock10 / TOTAL < TARGET_PROB;
                const isSelected = n_num === selectedHands;
                return (
                  <tr key={n}
                    onClick={() => setSelectedHands(n_num)}
                    className={`border-t border-slate-800 cursor-pointer transition-colors
                      ${isSelected ? 'bg-yellow-900/20' : 'hover:bg-slate-900/40'}`}>
                    <td className="px-4 py-3 font-bold text-gray-300">{n_num}</td>
                    <td className="px-4 py-3 text-right font-bold text-yellow-300">${d.maxBet}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{d.topCoeff.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-mono ${safe5 ? 'text-green-400' : 'text-red-400'}`}>
                      {lock5.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono ${safe10 ? 'text-green-400' : 'text-red-400'}`}>
                      {lock10.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {n_num <= 2
                        ? <span className="text-xs px-2 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-700/30">SAFE</span>
                        : n_num <= 4
                        ? <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/40 text-yellow-400 border border-yellow-700/30">CAUTION</span>
                        : <span className="text-xs px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-700/30">HIGH RISK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-2">Click a row to set the hand count on the simulator above.</p>
      </div>

      {/* Lockup probability bar chart */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-300 mb-3 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-yellow-500" />
          Lockup Probability by Bet Level — {selectedHands} Hand(s)
        </h2>
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <div className="space-y-1.5">
            {chartData.map(({ b, count, prob }) => {
              const pct = prob * 100;
              const barWidth = Math.min(pct * 2, 100);
              const safe = prob < TARGET_PROB;
              const isActive = Math.abs(betDollars - b) < 0.26;
              return (
                <div key={b} className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  <span className={`w-10 text-sm font-mono ${isActive ? 'text-yellow-300 font-bold' : 'text-gray-500'}`}>${b}</span>
                  <div className={`flex-1 h-7 bg-slate-800/60 rounded relative overflow-hidden ${isActive ? 'ring-1 ring-yellow-500/40' : ''}`}>
                    <div className={`h-full rounded transition-all ${safe ? 'bg-green-700/70' : 'bg-red-700/70'}`}
                      style={{ width: `${barWidth}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-xs text-gray-300 font-mono">
                      {count > 0
                        ? `${count.toLocaleString()} (${pct.toFixed(3)}%) — 1 in ${Math.round(TOTAL / count).toLocaleString()}`
                        : '0 lockups'}
                    </span>
                  </div>
                  <span className={`w-4 text-xs ${safe ? 'text-green-400' : 'text-red-400'}`}>{safe ? '✓' : '✗'}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Target line: P(lockup) &lt; 0.0100% (1 in 10,000). Green = safe. Red = exceeds threshold.
          </p>
        </div>
      </div>

      {/* Cascade structure */}
      <div className="mb-6 p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
        <h2 className="text-base font-bold text-gray-300 mb-3">Snowball Cascade — {selectedHands} Hand(s) at ${betDollars.toFixed(2)}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Card Hand Total (H)', mult: selectedHands, color: 'text-blue-300', desc: `${selectedHands} × $${betDollars.toFixed(2)}` },
            { label: 'Rank Total (R)', mult: selectedHands, color: 'text-purple-300', desc: 'Max = H' },
            { label: 'Color Total (C)', mult: 2*selectedHands, color: 'text-pink-300', desc: 'Max = H + R' },
            { label: 'River Total (V)', mult: 4*selectedHands, color: 'text-amber-300', desc: 'Max = H + R + C' },
          ].map(({ label, mult, color, desc }) => (
            <div key={label} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>${(mult * betDollars).toFixed(2)}</p>
              <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Total max wagered:</span>
          <span className="text-sm font-bold text-gray-300">${(8 * selectedHands * betDollars).toFixed(2)}</span>
          <span className="text-xs text-gray-600">(8 × {selectedHands} hands × ${betDollars.toFixed(2)})</span>
        </div>
      </div>

      {/* Methodology */}
      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-700/30">
        <h2 className="text-sm font-bold text-gray-400 mb-2">Methodology</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          The 32-card community stock is derived from the 52-card deck with the 20 cards from the 10 fixed player hands
          removed. All C(32,5) = 201,376 five-card combinations are enumerated exactly. For each combination, all 10
          player hands are evaluated using standard Texas Hold'em best-5-of-7 rules. The aggregate payout assumes
          worst-case player strategy: all rank bets on the winning rank position, all color bets on the highest-paying
          color position, river bet on the underdog (highest odds) side. Lockup counts are pre-computed at $0.50
          increments from $1.00 to $25.00. Lockup probability = (combinations where aggregate payout exceeds
          ${THRESHOLD.toLocaleString()}) / 201,376.
        </p>
      </div>
    </div>
  );
}
