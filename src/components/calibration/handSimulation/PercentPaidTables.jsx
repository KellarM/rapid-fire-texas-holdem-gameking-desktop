function PercentPaidGrid({ title, values, onChange, countLabel }) {
  return (
    <div>
      <p className="text-yellow-400 text-xs font-bold uppercase tracking-wide mb-1.5">{title}</p>
      <div className="grid grid-cols-4 gap-1">
        {values.map((pct, count) => (
          <div key={count} className="flex flex-col items-center bg-slate-800/60 border border-slate-700 rounded px-1 py-1">
            <span className="text-gray-400 text-[10px]">{count} {countLabel}{count === 1 ? '' : 's'}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={pct}
              onChange={e => onChange(count, Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
              className="w-12 bg-yellow-100 text-black text-center rounded px-0.5 font-bold text-xs outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PercentPaidTables({ handPercentPaid, rankPercentPaid, onHandChange, onRankChange }) {
  return (
    <div className="space-y-3">
      <PercentPaidGrid title="Hand Count % Paid" values={handPercentPaid} onChange={onHandChange} countLabel="hand" />
      <PercentPaidGrid title="Rank Count % Paid" values={rankPercentPaid} onChange={onRankChange} countLabel="rank" />
    </div>
  );
}