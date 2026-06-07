import { motion } from 'framer-motion';
import { getDealButtonState } from '@/hooks/useDealerButton';

/**
 * DealerButton — replaces the countdown clock.
 * Player presses this to advance the game through each phase.
 */
export default function DealerButton({ gamePhase, totalBet, onDeal }) {
  const { label, sublabel, enabled, disabledReason } = getDealButtonState(gamePhase, totalBet);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <motion.button
        onClick={enabled ? onDeal : undefined}
        disabled={!enabled}
        whileTap={enabled ? { scale: 0.93 } : {}}
        whileHover={enabled ? { scale: 1.06 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`
          relative px-8 py-3 rounded-full font-black text-sm tracking-widest uppercase
          border-2 transition-all duration-200 select-none
          ${enabled
            ? gamePhase === 'winner'
              ? 'border-green-400 bg-gradient-to-b from-green-500 to-green-700 text-white shadow-[0_0_18px_rgba(74,222,128,0.6)] hover:shadow-[0_0_28px_rgba(74,222,128,0.8)]'
              : 'border-yellow-400 bg-gradient-to-b from-yellow-500 to-yellow-700 text-black shadow-[0_0_18px_rgba(234,179,8,0.55)] hover:shadow-[0_0_28px_rgba(234,179,8,0.8)] cursor-pointer'
            : 'border-yellow-900/40 bg-yellow-900/15 text-yellow-700/50 cursor-not-allowed'
          }
        `}
        style={{
          minWidth: 120,
          letterSpacing: '0.15em',
        }}
      >
        {/* Shimmer when enabled */}
        {enabled && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
              animation: 'dealerShimmer 2.4s ease infinite',
            }}
          />
        )}
        <span className="relative z-10">{label}</span>
      </motion.button>

      {/* Sub-label */}
      <span className={`text-[10px] font-semibold tracking-wide uppercase transition-colors ${
        enabled ? 'text-yellow-400/80' : 'text-yellow-900/50'
      }`}>
        {disabledReason || sublabel}
      </span>

      <style>{`
        @keyframes dealerShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}