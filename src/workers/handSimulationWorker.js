// ============================================================
// HAND SIMULATION WORKER
// RUN generates a fresh set of random rounds and stores the raw
// outcomes (winners mask + winning rank category) in a persistent
// buffer. RECALCULATE re-scans that SAME buffer with new bet
// amounts / % Paid tables — no new randomness — so "Calculate"
// reflects the exact same simulated rounds until "Run Test" is
// clicked again (or the buffer is cleared).
// ============================================================

const RANK_LABELS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUIT_LABELS = ['clubs','diamonds','hearts','spades'];

function enc(rankLabel, suitLabel) {
  return RANK_LABELS.indexOf(rankLabel) * 4 + SUIT_LABELS.indexOf(suitLabel);
}

const HANDS = [
  [enc('A','diamonds'), enc('10','hearts')],
  [enc('K','clubs'),    enc('K','spades')],
  [enc('Q','clubs'),    enc('J','spades')],
  [enc('Q','spades'),   enc('10','spades')],
  [enc('J','clubs'),    enc('9','clubs')],
  [enc('8','diamonds'), enc('6','diamonds')],
  [enc('7','diamonds'), enc('7','spades')],
  [enc('4','hearts'),   enc('2','hearts')],
  [enc('3','clubs'),    enc('3','hearts')],
  [enc('A','hearts'),   enc('5','diamonds')],
];

const PLAYER_SET = new Set(HANDS.flat());
const DECK32_MASTER = [];
for (let r = 0; r < 13; r++) {
  for (let s = 0; s < 4; s++) {
    const c = r * 4 + s;
    if (!PLAYER_SET.has(c)) DECK32_MASTER.push(c);
  }
}
Object.freeze(DECK32_MASTER);

let _workDeck = new Int16Array(32);

function _secureRandInt(max) {
  if (max === 0) return 0;
  let mask = 1;
  while (mask <= max) mask = (mask << 1) | 1;
  const arr = new Uint32Array(1);
  let val;
  do {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
      val = arr[0] & mask;
    } else {
      return (Math.random() * (max + 1)) | 0;
    }
  } while (val > max);
  return val;
}

function shuffleAndDeal() {
  for (let i = 0; i < 32; i++) _workDeck[i] = DECK32_MASTER[i];
  for (let i = 31; i > 0; i--) {
    const j = _secureRandInt(i);
    const tmp = _workDeck[i]; _workDeck[i] = _workDeck[j]; _workDeck[j] = tmp;
  }
  return [_workDeck[1], _workDeck[2], _workDeck[3], _workDeck[5], _workDeck[7]];
}

const BASE = 14;
const B1 = BASE, B2 = BASE*BASE, B3 = BASE*BASE*BASE, B4 = BASE*BASE*BASE*BASE, B5 = BASE*BASE*BASE*BASE*BASE;

function eval5strength(c0, c1, c2, c3, c4) {
  const r0=c0>>2, r1=c1>>2, r2=c2>>2, r3=c3>>2, r4=c4>>2;
  const s0=c0&3,  s1=c1&3,  s2=c2&3,  s3=c3&3,  s4=c4&3;
  const flush = (s0===s1 && s1===s2 && s2===s3 && s3===s4);

  const rs = [r0,r1,r2,r3,r4].sort((a,b)=>b-a);
  const [a,b,c,d,e] = rs;

  const cnt = new Int8Array(13);
  cnt[r0]++; cnt[r1]++; cnt[r2]++; cnt[r3]++; cnt[r4]++;

  const isWheel = (a===12 && b===3 && c===2 && d===1 && e===0);
  const isStraight = isWheel || (new Set(rs).size===5 && a-e===4);
  const straightHigh = isWheel ? 3 : a;

  if (flush && isStraight) {
    if (a===12 && b===11 && c===10 && d===9 && e===8) return 9 * B5;
    return 8 * B5 + straightHigh;
  }

  const groups = [];
  for (let v=12; v>=0; v--) if (cnt[v]) groups.push([v, cnt[v]]);
  groups.sort((x,y) => y[1]-x[1] || y[0]-x[0]);

  const maxCnt = groups[0][1];
  const secCnt = groups.length > 1 ? groups[1][1] : 0;

  if (maxCnt === 4) return 7*B5 + groups[0][0]*B4 + groups[1][0];
  if (maxCnt === 3 && secCnt === 2) return 6*B5 + groups[0][0]*B4 + groups[1][0];
  if (flush) return 5*B5 + a*B4 + b*B3 + c*B2 + d*B1 + e;
  if (isStraight) return 4*B5 + straightHigh;
  if (maxCnt === 3) return 3*B5 + groups[0][0]*B4 + groups[1][0]*B3 + groups[2][0]*B2;
  if (maxCnt === 2 && secCnt === 2) return 2*B5 + groups[0][0]*B4 + groups[1][0]*B3 + groups[2][0]*B2;
  if (maxCnt === 2) return 1*B5 + groups[0][0]*B4 + groups[1][0]*B3 + groups[2][0]*B2 + groups[3][0]*B1;
  return 0*B5 + a*B4 + b*B3 + c*B2 + d*B1 + e;
}

function rankCatFromStrength(s) { return Math.floor(s / B5) - 1; }

function best7strength(h0, h1, b0, b1, b2, b3, b4) {
  const all = [h0, h1, b0, b1, b2, b3, b4];
  let best = -1;
  for (let i=0;i<3;i++) for (let j=i+1;j<4;j++) for (let k=j+1;k<5;k++)
    for (let l=k+1;l<6;l++) for (let m=l+1;m<7;m++) {
      const s = eval5strength(all[i],all[j],all[k],all[l],all[m]);
      if (s > best) best = s;
    }
  return best;
}

function evalAllHands(b0, b1, b2, b3, b4) {
  const strengths = new Float64Array(10);
  let bestStr = -1;
  for (let h=0; h<10; h++) {
    const s = best7strength(HANDS[h][0], HANDS[h][1], b0, b1, b2, b3, b4);
    strengths[h] = s;
    if (s > bestStr) bestStr = s;
  }
  const winners = new Uint8Array(10);
  let winnerCount = 0;
  for (let h=0; h<10; h++) {
    if (strengths[h] === bestStr) { winners[h] = 1; winnerCount++; }
  }
  return { strengths, winners, winnerCount };
}

const RANK_NAMES_BY_CAT = {
  0: 'One Pair', 1: 'Two Pair', 2: 'Three of a Kind', 3: 'Straight',
  4: 'Flush', 5: 'Full House', 6: 'Four of a Kind', 7: 'Straight Flush', 8: 'Royal Flush',
};

// 5% player-margin tie split — same rule as the live game engine
function calculateTiePayout(originalOdds, numberOfWinners) {
  if (numberOfWinners <= 1) return originalOdds;
  return ((originalOdds + 1) / 2) * 1.05 - 1;
}

function popcount10(mask) {
  let c = 0;
  while (mask) { c += mask & 1; mask >>= 1; }
  return c;
}

const PROGRESS_UPDATE_INTERVAL = 50_000;

// ── Persistent buffer — single source of truth for the current run ──
let _buffer = { winnersMask: null, rankCat: null, size: 0 };

function generateBuffer(rounds, callId) {
  const winnersMask = new Uint16Array(rounds);
  const rankCat = new Int8Array(rounds);

  for (let i = 0; i < rounds; i++) {
    if (i > 0 && i % PROGRESS_UPDATE_INTERVAL === 0) {
      self.postMessage({ type: 'PROGRESS', callId, done: i, total: rounds });
    }
    const [b0, b1, b2, b3, b4] = shuffleAndDeal();
    const { strengths, winners, winnerCount } = evalAllHands(b0, b1, b2, b3, b4);

    let mask = 0;
    let firstWinner = -1;
    for (let h = 0; h < 10; h++) {
      if (winners[h]) { mask |= (1 << h); if (firstWinner < 0) firstWinner = h; }
    }
    winnersMask[i] = mask;
    rankCat[i] = winnerCount === 10 ? -1 : (firstWinner >= 0 ? rankCatFromStrength(strengths[firstWinner]) : -1);
  }

  _buffer = { winnersMask, rankCat, size: rounds };
}

function computeFromBuffer(payload) {
  const {
    callId,
    handBets, rankBets, handPayouts, perHandRankPayouts,
    handPercentPaid, rankPercentPaid, roundCheckpoints,
  } = payload;

  const { winnersMask, rankCat, size } = _buffer;

  const rankNames = Object.keys(rankBets).filter(k => rankBets[k] > 0);
  const handBetCount = handBets.filter(b => b > 0).length;
  const rankBetCount = rankNames.length;
  const totalBetPerRound = handBets.reduce((s, b) => s + (b || 0), 0) + rankNames.reduce((s, k) => s + rankBets[k], 0);

  const checkpointNet = new Map();
  (roundCheckpoints || []).forEach(r => checkpointNet.set(r, null));

  if (totalBetPerRound <= 0) {
    self.postMessage({ type: 'RESULT', callId, data: { success: true, noBets: true, roundsTested: size, checkpoints: (roundCheckpoints || []).map(r => ({ round: r, net: null })) } });
    return;
  }

  const handPct = (handPercentPaid[handBetCount] ?? 100) / 100;
  const rankPct = (rankPercentPaid[rankBetCount] ?? 100) / 100;

  let totalWon = 0;
  let hitCount = 0;
  let netWinCount = 0;
  let runningBalance = 0;
  let bestRunUp = 0;
  let bestRunUpRound = 0;
  let worstRun = 0;
  let worstRunRound = 0;

  for (let i = 0; i < size; i++) {
    if (i > 0 && i % PROGRESS_UPDATE_INTERVAL === 0) {
      self.postMessage({ type: 'PROGRESS', callId, done: i, total: size });
    }

    const mask = winnersMask[i];
    const isBoardWin = mask === 1023;
    let roundWon = 0;

    if (!isBoardWin) {
      const winnerCount = popcount10(mask);
      for (let h = 0; h < 10; h++) {
        const bet = handBets[h];
        if (bet > 0 && (mask & (1 << h))) {
          const odds = calculateTiePayout(handPayouts[h], winnerCount);
          roundWon += bet * (1 + odds * handPct);
        }
      }

      const rc = rankCat[i];
      const winningRankName = rc >= 0 ? RANK_NAMES_BY_CAT[rc] : null;
      if (winningRankName) {
        let firstWinner = -1;
        for (let h = 0; h < 10; h++) { if (mask & (1 << h)) { firstWinner = h; break; } }
        const handId = firstWinner + 1;
        const payoutsForHand = perHandRankPayouts[handId] ?? perHandRankPayouts[String(handId)];
        const ratio = payoutsForHand ? payoutsForHand[winningRankName] : null;
        if (ratio != null) {
          for (const rk of rankNames) {
            if (rk === winningRankName) {
              roundWon += rankBets[rk] * (1 + ratio * rankPct);
            }
          }
        }
      }
    }

    totalWon += roundWon;
    if (roundWon > 0) hitCount++;
    const net = roundWon - totalBetPerRound;
    if (net > 0) netWinCount++;

    runningBalance += net;
    const roundNumber = i + 1;
    if (runningBalance > bestRunUp) { bestRunUp = runningBalance; bestRunUpRound = roundNumber; }
    if (runningBalance < worstRun) { worstRun = runningBalance; worstRunRound = roundNumber; }

    if (checkpointNet.has(roundNumber)) checkpointNet.set(roundNumber, runningBalance);
  }

  const totalBet = totalBetPerRound * size;
  const totalNet = totalWon - totalBet;
  const rtp = totalBet > 0 ? (totalWon / totalBet) * 100 : 0;
  const houseEdge = 100 - rtp;
  const hitFrequency = size > 0 ? (hitCount / size) * 100 : 0;
  const netWinFrequency = size > 0 ? (netWinCount / size) * 100 : 0;

  self.postMessage({
    type: 'RESULT',
    callId,
    data: {
      success: true,
      noBets: false,
      roundsTested: size,
      totalBet,
      totalWon,
      totalNet,
      rtp,
      houseEdge,
      hitFrequency,
      netWinFrequency,
      bestRunUp,
      bestRunUpRound,
      worstRun,
      worstRunRound,
      checkpoints: (roundCheckpoints || []).map(r => ({ round: r, net: checkpointNet.get(r) ?? null })),
    },
  });
}

self.onmessage = function(e) {
  const { type, payload } = e.data;
  const { callId } = payload || {};
  try {
    if (type === 'RUN') {
      generateBuffer(payload.rounds, callId);
      computeFromBuffer(payload);
    } else if (type === 'RECALCULATE') {
      if (!_buffer.size) {
        self.postMessage({ type: 'ERROR', callId, message: 'No simulation buffer — run a test first.' });
        return;
      }
      computeFromBuffer(payload);
    } else if (type === 'CLEAR') {
      _buffer = { winnersMask: null, rankCat: null, size: 0 };
      self.postMessage({ type: 'RESULT', callId, data: { success: true, cleared: true } });
    }
  } catch (err) {
    self.postMessage({ type: 'ERROR', callId, message: err?.message ?? String(err) });
  }
};