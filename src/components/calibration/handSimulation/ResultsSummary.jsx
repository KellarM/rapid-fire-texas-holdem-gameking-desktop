function StatBox({ label, value }) {
  return (
    <div className="bg-amber-900/20 border border-amber-700/40 rounded px-2 py-1.5 flex justify-between items-center">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className="text-amber-300 font-bold text-sm">{value}</span>
    </div>
  );
}

export default function ResultsSummary({ results, targetRTP, warningBuffer, handBetCount, rankBetCount }) {
  const scenario = (() => {
    if (!results) return 'NO SIMULATION RUN';
    if (results.noBets) return 'NO BETS SELECTED';
    const low = targetRTP - warningBuffer;
    const high = targetRTP + warningBuffer;
    if (results.rtp >= low && results.rtp <= high) return 'WITHIN TARGET RANGE';
    return 'OUT OF TARGET RANGE';
  })();

  const r = results && !results.noBets ? results : null;

  return (
    <div className="space-y-2">
      <StatBox label="Rounds Tested" value={r ? r.roundsTested.toLocaleString() : '0'} />
      <StatBox label="Total Bet" value={r ? `$${r.totalBet.toFixed(2)}` : '$0.00'} />
      <StatBox label="Total Won" value={r ? `$${r.totalWon.toFixed(2)}` : '$0.00'} />
      <StatBox label="Total Net" value={r ? `$${r.totalNet.toFixed(2)}` : '$0.00'} />
      <StatBox label="RTP" value={r ? `${r.rtp.toFixed(2)}%` : '0.00%'} />
      <StatBox label="House Edge" value={r ? `${r.houseEdge.toFixed(2)}%` : '0.00%'} />
      <StatBox label="Hit Frequency" value={r ? `${r.hitFrequency.toFixed(3)}%` : '0.000%'} />
      <StatBox label="Net-Win Frequency" value={r ? `${r.netWinFrequency.toFixed(3)}%` : '0.000%'} />
      <StatBox label="Best Run-Up" value={r ? `$${r.bestRunUp.toFixed(2)}` : '$0.00'} />
      <StatBox label="Worst Run" value={r ? `$${r.worstRun.toFixed(2)}` : '$0.00'} />
      <div className={`rounded px-2 py-2 text-center font-bold text-xs
        ${scenario === 'NO BETS SELECTED' ? 'bg-red-900/30 border border-red-700 text-red-300'
          : scenario === 'WITHIN TARGET RANGE' ? 'bg-green-900/30 border border-green-700 text-green-300'
          : scenario === 'OUT OF TARGET RANGE' ? 'bg-red-900/30 border border-red-700 text-red-300'
          : 'bg-slate-800 border border-slate-700 text-gray-400'}`}>
        {scenario}
      </div>
    </div>
  );
}