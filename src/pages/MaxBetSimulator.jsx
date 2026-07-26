import { useState, useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Calculator, TrendingDown, Info } from 'lucide-react';

// Simulation results — full enumeration of C(32,5) = 201,376 community card combinations
const SIM_DATA = {
  total: 201376,
  threshold: 1200,
  targetProb: 0.0001,
  hands: {
    1: { maxBet: 10.34, topCoeff: 116.77, lockups: { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,15:9221,20:9666,25:10812 } },
    2: { maxBet: 5.66, topCoeff: 213.24, lockups: { 1:0,2:0,3:0,4:0,5:0,6:2419,7:8832,8:9221,9:9311,10:9626,15:11439,20:17233,25:32903 } },
    3: { maxBet: 3.83, topCoeff: 315.12, lockups: { 1:0,2:0,3:0,4:1797,5:8917,6:9311,7:9626,8:9680,9:10120,10:11175,15:19488,20:46653,25:97085 } },
    4: { maxBet: 2.88, topCoeff: 418.71, lockups: { 1:0,2:0,3:1766,4:9221,5:9626,6:9660,7:10120,8:11536,9:12813,10:13453,15:42260,20:97147,25:134132 } },
    5: { maxBet: 2.31, topCoeff: 522.30, lockups: { 1:0,2:0,3:8832,4:9626,5:9807,6:10998,7:12813,8:13453,9:17436,10:21030,15:84270,20:127916,25:194174 } },
    6: { maxBet: 1.93, topCoeff: 625.89, lockups: { 1:0,2:976,3:9311,4:9626,5:10870,6:12813,7:14713,8:18631,9:26282,10:37054,15:109011,20:166369,25:201376 } },
    7: { maxBet: 1.66, topCoeff: 729.48, lockups: { 1:0,2:8832,3:9626,4:10120,5:12235,6:14713,7:18709,8:28621,9:41298,10:65825,15:127916,20:200545,25:201376 } },
    8: { maxBet: 1.45, topCoeff: 833.07, lockups: { 1:0,2:9221,3:9626,4:11126,5:13097,6:17887,7:27390,8:42267,9:80110,10:85488,15:155754,20:201376,25:201376 } },
    9: { maxBet: 1.29, topCoeff: 936.66, lockups: { 1:0,2:9311,3:9847,4:12813,5:16683,6:22655,7:40154,8:76587,9:85488,10:101701,15:200488,20:201376,25:201376 } },
  },
};

const BET_LEVELS = [1,2,3,4,5,6,7,8,9,10,15,20,25];

export default function MaxBetSimulator() {
  const [selectedHands, setSelectedHands] = useState(2);
  const [betLevel, setBetLevel] = useState(5);

  const currentData = SIM_DATA.hands[selectedHands];
  const lockupCount = currentData.lockups[betLevel] || 0;
  const lockupProb = lockupCount / SIM_DATA.total;
  const oddsAgainst = lockupCount > 0 ? (SIM_DATA.total / lockupCount).toFixed(0) : '∞';
  const worstPayout = betLevel * currentData.topCoeff;
  const isSafe = lockupProb < SIM_DATA.targetProb;

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
          <span className="text-gray-300 font-semibold"> ${SIM_DATA.threshold.toLocaleString()}</span> W-2G threshold.
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
          <p className="text-xs text-gray-500 mt-2">
            {selectedHands < 3 ? 'Rank Board ENABLED' : 'Rank Board ENABLED (1-9 hands keep Rank open)'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <label className="text-sm font-semibold text-gray-400 mb-2 block">
            Card Hand Bet: <span className="text-yellow-300 text-lg font-bold">${betLevel}</span>
          </label>
          <input type="range" min="1" max="25" value={betLevel}
            onChange={e => setBetLevel(Number(e.target.value))}
            className="w-full accent-yellow-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>$1</span><span>$25</span>
          </div>
        </div>
      </div>

      {/* Live result card */}
      <div className={`mb-6 p-5 rounded-xl border-2 transition-all
        ${isSafe
          ? 'bg-green-950/30 border-green-700/40'
          : 'bg-red-950/30 border-red-700/40'}`}>
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
            <p className={`text-xl font-bold ${isSafe ? 'text-green-300' : 'text-red-300'}`}>
              {lockupProb > 0 ? `${(lockupProb * 100).toFixed(4)}%` : '0.0000%'}
            </p>
            <p className="text-xs text-gray-600">
              {lockupCount > 0 ? `1 in ${oddsAgainst} rounds` : 'No lockups possible'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Lockup Count</p>
            <p className="text-xl font-bold text-gray-300">{lockupCount.toLocaleString()}</p>
            <p className="text-xs text-gray-600">of {SIM_DATA.total.toLocaleString()} combinations</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Worst-Case Payout</p>
            <p className={`text-xl font-bold ${worstPayout >= SIM_DATA.threshold ? 'text-red-300' : 'text-gray-300'}`}>
              ${worstPayout.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">All 4 boards win at max odds</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Max Safe Bet</p>
            <p className="text-xl font-bold text-yellow-300">${currentData.maxBet}</p>
            <p className="text-xs text-gray-600">at &lt;1/10,000 threshold</p>
          </div>
        </div>
      </div>

      {/* Max bet table */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-300 mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-yellow-500" />
          Max Bet by Hand Count
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 text-gray-400">
                <th className="px-4 py-3 text-left font-semibold">Hands</th>
                <th className="px-4 py-3 text-right font-semibold">Max Safe Bet</th>
                <th className="px-4 py-3 text-right font-semibold">Worst Coeff</th>
                <th className="px-4 py-3 text-right font-semibold">$5 Lockups</th>
                <th className="px-4 py-3 text-right font-semibold">$10 Lockups</th>
                <th className="px-4 py-3 text-right font-semibold">$15 Lockups</th>
                <th className="px-4 py-3 text-right font-semibold">$20 Lockups</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SIM_DATA.hands).map(([n, d]) => {
                const safe5 = (d.lockups[5] || 0) / SIM_DATA.total < SIM_DATA.targetProb;
                const safe10 = (d.lockups[10] || 0) / SIM_DATA.total < SIM_DATA.targetProb;
                return (
                  <tr key={n} className="border-t border-slate-800 hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-semibold text-gray-300">{n}</td>
                    <td className="px-4 py-3 text-right text-yellow-300 font-bold">${d.maxBet}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{d.topCoeff.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right ${safe5 ? 'text-green-400' : 'text-red-400'}`}>
                      {(d.lockups[5] || 0).toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right ${safe10 ? 'text-green-400' : 'text-red-400'}`}>
                      {(d.lockups[10] || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">{(d.lockups[15] || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{(d.lockups[20] || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      {Number(n) <= 2
                        ? <span className="text-xs px-2 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-700/30">SAFE</span>
                        : Number(n) <= 4
                        ? <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/40 text-yellow-400 border border-yellow-700/30">CAUTION</span>
                        : <span className="text-xs px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-700/30">RISK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lockup probability chart */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-300 mb-3 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-yellow-500" />
          Lockup Probability by Bet Level — {selectedHands} Hand(s)
        </h2>
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
          <div className="space-y-1.5">
            {BET_LEVELS.map(b => {
              const count = currentData.lockups[b] || 0;
              const prob = count / SIM_DATA.total;
              const pct = prob * 100;
              const barWidth = Math.min(pct * 10, 100); // Scale for visibility
              const safe = prob < SIM_DATA.targetProb;
              return (
                <div key={b} className="flex items-center gap-3">
                  <span className="w-8 text-sm text-gray-500 font-mono">${b}</span>
                  <div className="flex-1 h-6 bg-slate-800/60 rounded relative overflow-hidden">
                    <div className={`h-full rounded ${safe ? 'bg-green-700/60' : 'bg-red-700/60'}`}
                      style={{ width: `${barWidth}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-xs text-gray-300">
                      {count > 0 ? `${count.toLocaleString()} (${pct.toFixed(3)}%) — 1 in ${(SIM_DATA.total/count).toFixed(0)}` : '0 lockups'}
                    </span>
                  </div>
                  <span className={`w-8 text-xs ${safe ? 'text-green-400' : 'text-red-400'}`}>
                    {safe ? '✓' : '✗'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cascade explanation */}
      <div className="mb-6 p-4 rounded-lg bg-slate-900/60 border border-slate-700/50">
        <h2 className="text-lg font-bold text-gray-300 mb-3">Snowball Cascade Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-gray-500 uppercase mb-1">Card Hand Total (H)</p>
            <p className="text-lg font-bold text-blue-300">{selectedHands}b</p>
            <p className="text-xs text-gray-600">Player bets $b on each of {selectedHands} hands</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-gray-500 uppercase mb-1">Rank Total (R)</p>
            <p className="text-lg font-bold text-purple-300">{selectedHands}b</p>
            <p className="text-xs text-gray-600">Max = H (must equal to unlock)</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-gray-500 uppercase mb-1">Color Total (C)</p>
            <p className="text-lg font-bold text-pink-300">{2*selectedHands}b</p>
            <p className="text-xs text-gray-600">Max = H + R = 2H</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-gray-500 uppercase mb-1">River Total (V)</p>
            <p className="text-lg font-bold text-amber-300">{4*selectedHands}b</p>
            <p className="text-xs text-gray-600">Max = H + R + C = 4H</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Total max wagered: <span className="text-gray-300 font-semibold">8H = {8*selectedHands}b</span>.
          Only ONE card hand wins per round — the cascade amplifies Rank, Color, and River bets by N (number of hands).
        </p>
      </div>

      {/* Methodology */}
      <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-700/30">
        <h2 className="text-sm font-bold text-gray-400 mb-2">Methodology</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          The 32-card community stock is derived from the standard 52-card deck with the 20 cards
          from the 10 fixed player hands removed. All C(32,5) = 201,376 five-card combinations are enumerated.
          For each combination, all 10 player hands are evaluated against the board using standard Texas
          Hold'em best-5-of-7 rules. The winning hand, winning rank, color distribution (black/red count
          of 5 community cards), and river odds (based on High/Low split of all 5 cards) are determined.
          Aggregate payout assumes worst-case player strategy: all rank bets on the winning rank position,
          all color bets on the highest-paying color position, river bet on the underdog (highest odds) side.
          Lockup probability = (combinations where aggregate payout exceeds ${SIM_DATA.threshold.toLocaleString()}) / total combinations.
        </p>
      </div>
    </div>
  );
}
