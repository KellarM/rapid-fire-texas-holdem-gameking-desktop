// ============================================================
// HAND SIMULATION WORKER
// Simulates N rounds with fixed Card Hand + Rank bets placed every
// round, applying the sandboxed "% Paid" bell-curve tables. Card
// hands + Ranks only (no Color/River) — matches the Hand Simulations tool.
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

const PROGRESS_UPDATE_INTERVAL = 50_000;

function handleRun(payload) {
  const {
    callId, rounds,
    handBets,            // array of 10 numbers
    rankBets,             // { rankName: amount }
    handPayouts,          // array of 10 (CARDED_HAND_PAYOUTS)
    perHandRankPayouts,   // { handId: { rankName: ratio } }
    handPercentPaid,      // array indexed 0-10
    rankPercentPaid,      // array indexed 0-7
  } = payload;

  const rankNames = Object.keys(rankBets).filter(k => rankBets[k] > 0);
  const handBetCount = handBets.filter(b => b > 0).length;
  const rankBetCount = rankNames.length;

  const totalBetPerRound = handBets.reduce((s,b)=>s+(b||0),0) + rankNames.reduce((s,k)=>s+rankBets[k],0);

  if (totalBetPerRound <= 0) {
    self.postMessage({ type: 'RESULT', callId, data: { success: true, noBets: true } });
    return;
  }

  const handPct = (handPercentPaid[handBetCount] ?? 100) / 100;
  const rankPct = (rankPercentPaid[rankBetCount] ?? 100) / 100;

  let totalWon = 0;
  let hitCount = 0;
  let netWinCount = 0;
  let runningBalance = 0;
  let bestRunUp = 0;
  let worstRun = 0;
  let streakType = 0; // 1 = win streak, -1 = loss streak
  let streakStartBalance = 0;

  let roundsDone = 0;

  while (roundsDone < rounds) {
    if (roundsDone > 0 && roundsDone % PROGRESS_UPDATE_INTERVAL === 0) {
      self.postMessage({ type: 'PROGRESS', callId, done: roundsDone, total: rounds });
    }

    const [b0, b1, b2, b3, b4] = shuffleAndDeal();
    const { strengths, winners, winnerCount } = evalAllHands(b0, b1, b2, b3, b4);
    const isBoardWin = winnerCount === 10;

    let roundWon = 0;

    if (!isBoardWin) {
      let winningHandIdx = -1;
      for (let h = 0; h < 10; h++) { if (winners[h] === 1) { winningHandIdx = h; break; } }
      const winningRankCat = winningHandIdx >= 0 ? rankCatFromStrength(strengths[winningHandIdx]) : -99;
      const winningRankName = RANK_NAMES_BY_CAT[winningRankCat] ?? null;

      for (let h = 0; h < 10; h++) {
        const bet = handBets[h];
        if (bet > 0 && winners[h] === 1) {
          const odds = calculateTiePayout(handPayouts[h], winnerCount);
          roundWon += bet * (1 + odds * handPct);
        }
      }

      if (winningHandIdx >= 0 && winningRankName) {
        const handId = winningHandIdx + 1;
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
    if (net > 0) {
      if (streakType !== 1) { streakType = 1; streakStartBalance = runningBalance - net; }
      const runUp = runningBalance - streakStartBalance;
      if (runUp > bestRunUp) bestRunUp = runUp;
    } else if (net < 0) {
      if (streakType !== -1) { streakType = -1; streakStartBalance = runningBalance - net; }
      const runDown = runningBalance - streakStartBalance;
      if (runDown < worstRun) worstRun = runDown;
    }

    roundsDone++;
  }

  const totalBet = totalBetPerRound * rounds;
  const totalNet = totalWon - totalBet;
  const rtp = totalBet > 0 ? (totalWon / totalBet) * 100 : 0;
  const houseEdge = 100 - rtp;
  const hitFrequency = rounds > 0 ? (hitCount / rounds) * 100 : 0;
  const netWinFrequency = rounds > 0 ? (netWinCount / rounds) * 100 : 0;

  self.postMessage({
    type: 'RESULT',
    callId,
    data: {
      success: true,
      noBets: false,
      roundsTested: rounds,
      totalBet,
      totalWon,
      totalNet,
      rtp,
      houseEdge,
      hitFrequency,
      netWinFrequency,
      bestRunUp,
      worstRun,
    },
  });
}

self.onmessage = function(e) {
  const { type, payload } = e.data;
  if (type === 'RUN') {
    try { handleRun(payload); }
    catch (err) {
      self.postMessage({ type: 'ERROR', callId: payload?.callId, message: err?.message ?? String(err) });
    }
  }
};