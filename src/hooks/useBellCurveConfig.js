import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { HAND_BET_REDUCTIONS, RANK_BET_REDUCTIONS } from '@/lib/bellCurveConfig';

const STORAGE_KEY = 'rapidfire_bell_curve_config';

const DEFAULT_CONFIG = {
  handReductions: HAND_BET_REDUCTIONS,
  rankReductions: RANK_BET_REDUCTIONS,
};

/**
 * Loads Bell Curve config from DB (single shared record).
 * Falls back to localStorage then defaults while loading.
 * Returns { config, saveConfig, loading }
 */
export function useBellCurveConfig() {
  const [config, setConfig] = useState(() => {
    // Instant read from localStorage while DB loads
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.handReductions && parsed.rankReductions) return parsed;
      }
    } catch {}
    return DEFAULT_CONFIG;
  });

  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    base44.entities.BellCurveConfig.list().then((records) => {
      if (cancelled) return;
      if (records && records.length > 0) {
        const rec = records[0];
        setRecordId(rec.id);
        const loaded = {
          handReductions: rec.handReductions || DEFAULT_CONFIG.handReductions,
          rankReductions: rec.rankReductions || DEFAULT_CONFIG.rankReductions,
        };
        setConfig(loaded);
        // Keep localStorage in sync for instant next load
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded)); } catch {}
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const saveConfig = async (newConfig) => {
    setConfig(newConfig);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig)); } catch {}
    if (recordId) {
      await base44.entities.BellCurveConfig.update(recordId, newConfig);
    } else {
      const rec = await base44.entities.BellCurveConfig.create(newConfig);
      setRecordId(rec.id);
    }
  };

  return { config, saveConfig, loading };
}