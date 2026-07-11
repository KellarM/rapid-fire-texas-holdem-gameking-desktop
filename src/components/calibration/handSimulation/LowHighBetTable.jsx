const OPTIONS = [
  { key: 'none', label: 'No Bet' },
  { key: '3_1', label: '3 / 1' },
  { key: '4_0', label: '4 / 0' },
];

export default function LowHighBetTable({ mode, onChange }) {
  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-800 text-gray-400">
            <th className="px-2 py-1.5 text-left">Low / High Strategy</th>
            <th className="px-2 py-1.5 text-right">Select</th>
          </tr>
        </thead>
        <tbody>
          {OPTIONS.map((opt, i) => (
            <tr key={opt.key} className={i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/30'}>
              <td className="px-2 py-1.5 text-white font-bold">{opt.label}</td>
              <td className="px-2 py-1.5 text-right">
                <input
                  type="checkbox"
                  checked={mode === opt.key}
                  onChange={() => onChange(opt.key)}
                  className="w-4 h-4 accent-yellow-400 cursor-pointer"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-gray-500 text-[10px] px-2 py-1.5 border-t border-slate-700 leading-snug">
        3/1: wagers half of the total (Hand+Rank+Color) bets on the likely side whenever the board shows a 3-1 Low/High split. 4/0: wagers the full total whenever the board shows a 4-0 split.
      </p>
    </div>
  );
}