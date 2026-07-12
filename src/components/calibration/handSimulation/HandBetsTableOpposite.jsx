import { CARDED_HAND_PAYOUTS } from '@/lib/payoutConstants';

export const HAND_LABELS = [
  'A♣ / 10♠', 'K♦ / K♥', 'Q♦ / J♥', 'Q♥ / 10♥', 'J♦ / 9♦',
  '8♣ / 6♣', '7♣ / 7♥', '4♠ / 2♠', '3♦ / 3♠', 'A♠ / 5♣',
];

export default function HandBetsTableOpposite({ handBets, onChange }) {
  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-800 text-gray-400">
            <th className="px-2 py-1.5 text-left">Odds</th>
            <th className="px-2 py-1.5 text-left">Carded Hand</th>
            <th className="px-2 py-1.5 text-right">Amount to Bet</th>
          </tr>
        </thead>
        <tbody>
          {HAND_LABELS.map((label, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/30'}>
              <td className="px-2 py-1 text-blue-300 font-semibold">{CARDED_HAND_PAYOUTS[i]}</td>
              <td className="px-2 py-1 text-white font-bold whitespace-nowrap">{label}</td>
              <td className="px-2 py-1 text-right">
                <input
                  type="number"
                  min="0"
                  value={handBets[i] || ''}
                  onChange={e => onChange(i, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 bg-yellow-100 text-black text-right rounded px-1.5 py-0.5 font-bold outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}