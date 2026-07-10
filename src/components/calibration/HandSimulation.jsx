import { useState } from 'react';
import { Play, Trash2, FlaskConical } from 'lucide-react';
import { CARDED_HAND_PAYOUTS } from '@/lib/payoutConstants';
import { PER_HAND_RANK_PAYOUTS } from '@/lib/perHandRankPayouts';
import { runHandSimulation } from '@/lib/handSimulationBridge';
import HandBetsTable from './handSimulation/HandBetsTable';
import RankBetsTable, { RANK_KEYS } from './handSimulation/RankBetsTable';
import PercentPaidTables from './handSimulation/PercentPaidTables';
import ResultsSummary from './handSimulation/ResultsSummary';

const DEFAULT_HAND_BETS = Array(10).fill(0);
const DEFAULT_RANK_BETS = Object.fromEntries(RANK_KEYS.map(r => [r, 0]));
const DEFAULT_HAND_PCT = Array(11).fill(100); // index 0-10 (hand count)
const DEFAULT_RANK_PCT = Array(8).fill(100);  // index 0-7 (rank count)
const DEFAULT_ROUNDS = 10000;

export default function HandSimulation() {
  const [handBets, setHandBets] = useState(DEFAULT_HAND_BETS);
  const [rankBets, setRankBets] = useState(DEFAULT_RANK_BETS);
  const [handPercentPaid, setHandPercentPaid] = useState(DEFAULT_HAND_PCT);
  const [rankPercentPaid, setRankPercentPaid] = useState(DEFAULT_RANK_PCT);
  const [targetRTP, setTargetRTP] = useState(96.5);
  const [warningBuffer, setWarningBuffer] = useState(0.5);
  const [numberOfRounds, setNumberOfRounds] = useState(DEFAULT_ROUNDS);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);

  const handBetCount = handBets.filter(b => b > 0).length;
  const rankBetCount = Object.values(rankBets).filter(v => v > 0).length;

  const handleCalculate = async () => {
    setRunning(true);
    setProgress({ done: 0, total: numberOfRounds });
    try {
      const data = await runHandSimulation(
        {
          rounds: numberOfRounds,
          handBets,
          rankBets,
          handPayouts: CARDED_HAND_PAYOUTS,
          perHandRankPayouts: PER_HAND_RANK_PAYOUTS,
          handPercentPaid,
          rankPercentPaid,
        },
        (done, total) => setProgress({ done, total })
      );
      setResults(data);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  };

  const handleClear = () => {
    setHandBets(DEFAULT_HAND_BETS);
    setRankBets(DEFAULT_RANK_BETS);
    setHandPercentPaid(DEFAULT_HAND_PCT);
    setRankPercentPaid(DEFAULT_RANK_PCT);
    setTargetRTP(96.5);
    setWarningBuffer(0.5);
    setNumberOfRounds(DEFAULT_ROUNDS);
    setResults(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FlaskConical className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-white mb-1">Hand Simulations</h3>
            <p className="text-gray-400 text-sm">
              Enter Card Hand and Rank bet amounts, adjust the % Paid tables if needed, choose a round count, then click Calculate.
              This is a sandboxed simulation only — it never affects live game payouts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          <HandBetsTable handBets={handBets} onChange={(i, v) => setHandBets(prev => prev.map((b, idx) => idx === i ? v : b))} />
          <RankBetsTable rankBets={rankBets} onChange={(rank, v) => setRankBets(prev => ({ ...prev, [rank]: v }))} />
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Target RTP</span>
              <input type="number" step="0.1" value={targetRTP} onChange={e => setTargetRTP(parseFloat(e.target.value) || 0)}
                className="w-20 bg-yellow-100 text-black text-right rounded px-1.5 py-0.5 font-bold text-xs outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Warning Buffer</span>
              <input type="number" step="0.1" value={warningBuffer} onChange={e => setWarningBuffer(parseFloat(e.target.value) || 0)}
                className="w-20 bg-yellow-100 text-black text-right rounded px-1.5 py-0.5 font-bold text-xs outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Number of Rounds</span>
              <input type="number" min="10" max="2000000" value={numberOfRounds}
                onChange={e => setNumberOfRounds(Math.min(2000000, Math.max(10, parseInt(e.target.value) || 10)))}
                className="w-24 bg-yellow-100 text-black text-right rounded px-1.5 py-0.5 font-bold text-xs outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>

          <ResultsSummary results={results} targetRTP={targetRTP} warningBuffer={warningBuffer} />

          <div className="flex gap-2">
            <button
              onClick={handleCalculate}
              disabled={running}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold text-sm transition-all"
            >
              <Play className="w-3.5 h-3.5" /> {running ? 'Calculating…' : 'Calculate'}
            </button>
            <button
              onClick={handleClear}
              disabled={running}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-600 text-gray-400 hover:text-red-400 hover:border-red-700 disabled:opacity-50 text-sm transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Data
            </button>
          </div>

          {running && progress && (
            <div className="text-xs text-gray-400 text-center">
              {progress.done.toLocaleString()} / {progress.total.toLocaleString()} rounds
            </div>
          )}
        </div>

        <div>
          <PercentPaidTables
            handPercentPaid={handPercentPaid}
            rankPercentPaid={rankPercentPaid}
            onHandChange={(count, v) => setHandPercentPaid(prev => prev.map((p, idx) => idx === count ? v : p))}
            onRankChange={(count, v) => setRankPercentPaid(prev => prev.map((p, idx) => idx === count ? v : p))}
          />
        </div>
      </div>
    </div>
  );
}