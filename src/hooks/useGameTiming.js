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
  mobileLayout: 'A', // default: Layout A (current mobile portrait arrangement)
};

const DEALER_MODE_KEY = 'rfth_dealerMode';
const MOBILE_LAYOUT_KEY = 'rfth_mobileLayout';

function readLocalDealerMode() {
  try {
    const v = localStorage.getItem(DEALER_MODE_KEY);
    return v === null ? true : v === 'true';
  } catch { return true; }
}

function writeLocalDealerMode(v) {
  try { localStorage.setItem(DEALER_MODE_KEY, String(v)); } catch {}
}

function readLocalMobileLayout() {
  try {
    const v = localStorage.getItem(MOBILE_LAYOUT_KEY);
    return v || null;
  } catch { return null; }
}

function writeLocalMobileLayout(v) {
  try { localStorage.setItem(MOBILE_LAYOUT_KEY, String(v)); } catch {}
}

export function useGameTiming() {
  const [timing, setTiming] = useState(DEFAULT_TIMING);
  const [recordId, setRecordId] = useState(null);
  const timerRef = useRef(null);
  const [dealerMode, setDealerModeState] = useState(() => readLocalDealerMode());
  const [mobileLayout, setMobileLayoutState] = useState(() => {
    // Start from localStorage so there's no flash of wrong layout on mobile
    return readLocalMobileLayout() || 'A';
  });
  const pendingLayoutRef = useRef(null); // stores layout value if set before recordId is ready

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
        // DB is the source of truth for mobileLayout — but don't overwrite
        // if the user already set a new value while we were loading
        if (rec.mobileLayout && !pendingLayoutRef.current) {
          setMobileLayoutState(rec.mobileLayout);
          writeLocalMobileLayout(rec.mobileLayout);
        }
        // If user set a layout before recordId was ready, persist it now
        if (pendingLayoutRef.current && rec.id) {
          const v = pendingLayoutRef.current;
          pendingLayoutRef.current = null;
          base44.entities.GameTiming.update(rec.id, { mobileLayout: v }).catch(() => {});
        }
      }
    }).catch(() => {});
  }, []);

  // Listen for timing updates saved from GameTimingModal
  // NOTE: This reloads TIMING fields only. It must NOT overwrite mobileLayout,
  // because the layout is managed independently and a timing save could race
  // with a layout change, reverting it to the stale DB value.
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
        // Deliberately NOT touching mobileLayout here — it has its own
        // persistence path and reloading timing shouldn't clobber it.
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

  const setMobileLayout = useCallback(async (v) => {
    // Update in-memory state immediately so the modal reflects the choice
    setMobileLayoutState(v);
    // Cache to localStorage so mobile doesn't flash the wrong layout on load
    writeLocalMobileLayout(v);

    try {
      if (recordId) {
        await base44.entities.GameTiming.update(recordId, { mobileLayout: v });
      } else {
        // recordId not loaded yet — stash the value and persist when DB loads
        pendingLayoutRef.current = v;
      }
    } catch (e) {
      // DB write failed — localStorage still has the value, and in-memory
      // state is correct. Next page load will try DB first, then localStorage.
      console.warn('mobileLayout not persisted to DB:', e.message);
    }
  }, [recordId]);

  return { timing, recordId, dealerMode, setDealerMode, mobileLayout, setMobileLayout, startTimer, stopTimer, reloadTiming };
}
