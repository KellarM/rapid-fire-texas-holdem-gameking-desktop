import { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const DEFAULT_TIMING = {
  bettingClose: 14,
  flopReveal: 8,
  turnReveal: 2,
  riverBetting: 14,
  riverReveal: 5,
  endOfRound: 14,
  dealerMode: true, // default: Dealer Button mode (safe)
};

const DEALER_MODE_KEY = 'rfth_dealerMode';

function readLocalDealerMode() {
  try {
    const v = localStorage.getItem(DEALER_MODE_KEY);
    return v === null ? true : v === 'true';
  } catch { return true; }
}

function writeLocalDealerMode(v) {
  try { localStorage.setItem(DEALER_MODE_KEY, String(v)); } catch {}
}

export function useGameTiming() {
  const [timing, setTiming] = useState(DEFAULT_TIMING);
  const [recordId, setRecordId] = useState(null);
  const timerRef = useRef(null);
  const [dealerMode, setDealerModeState] = useState(() => readLocalDealerMode());

  // Load timing from DB on mount
  useEffect(() => {
    base44.entities.GameTiming.list().then(records => {
      if (records && records.length > 0) {
        const rec = records[0];
        setRecordId(rec.id);
        setTiming({ ...DEFAULT_TIMING, ...rec });
        // If DB has dealerMode, use it; otherwise keep localStorage value
        if (rec.dealerMode !== undefined && rec.dealerMode !== null) {
          setDealerModeState(!!rec.dealerMode);
          writeLocalDealerMode(!!rec.dealerMode);
        }
      }
    }).catch(() => {});
  }, []);

  // Listen for timing updates saved from GameTimingModal
  const reloadTiming = useCallback(() => {
    base44.entities.GameTiming.list().then(records => {
      if (records && records.length > 0) {
        const rec = records[0];
        setRecordId(rec.id);
        setTiming({ ...DEFAULT_TIMING, ...rec });
        if (rec.dealerMode !== undefined && rec.dealerMode !== null) {
          setDealerModeState(!!rec.dealerMode);
          writeLocalDealerMode(!!rec.dealerMode);
        }
      }
    }).catch(() => {});
  }, []);

  const startTimer = useCallback((duration, onTick, onComplete) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let remaining = duration;
    onTick(remaining);

    timerRef.current = setInterval(() => {
      remaining -= 0.1;
      onTick(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        onComplete?.();
      }
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setDealerMode = useCallback((v) => {
    setDealerModeState(v);
    writeLocalDealerMode(v);
  }, []);

  return { timing, recordId, dealerMode, setDealerMode, startTimer, stopTimer, reloadTiming };
}