import PlayingCard from './PlayingCard';
import { motion } from 'framer-motion';

const CARD_W = 70;
const CARD_H = 100;
const GAP = 10;
const GROUP_GAP = 20;
const LABEL_H = 18;
const LABEL_TOP_GAP = 6;

function CardSlot({ card, index, active, cardW = CARD_W, cardH = CARD_H }) {
  return (
    <div style={{ width: cardW, height: cardH, flexShrink: 0, position: 'relative' }}>
      {card ? (
        <motion.div
          key={`card-${index}-${card.rank}${card.suit}`}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 * index }}
          style={{ width: cardW, height: cardH }}
        >
          <PlayingCard card={card} size="community" glow={active} />
        </motion.div>
      ) : (
        <div style={{ width: cardW, height: cardH, opacity: 0.9 }}>
          <img
            src="https://media.base44.com/images/public/69f3a45ad82dff5b772d4de2/1b33b172d_image.png"
            alt="Card back"
            style={{ width: cardW, height: cardH, borderRadius: '6px', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}

function CardGroup({ cards, indices, label, hasCards, cardW = CARD_W, cardH = CARD_H, gap = GAP, labelH = LABEL_H, labelTopGap = LABEL_TOP_GAP }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap }}>
        {indices.map((i) => (
          <CardSlot
            key={i}
            card={cards[i]}
            index={i}
            active={i === cards.length - 1 && cards.length > 0}
            cardW={cardW}
            cardH={cardH}
          />
        ))}
      </div>
      <div style={{
        height: labelH,
        marginTop: labelTopGap,
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: 'Oswald, sans-serif',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#e8b84b',
        textShadow: '0 0 2px #000, 1px 1px 2px #000, -1px -1px 2px #000, 2px 2px 0 #000',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
    </div>
  );
}

export default function CommunityCards({ cards = [], cardW = CARD_W, cardH = CARD_H, gap = GAP, groupGap = GROUP_GAP, labelH = LABEL_H, labelTopGap = LABEL_TOP_GAP }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: groupGap,
        flexShrink: 0,
      }}
    >
      <CardGroup
        cards={cards}
        indices={[0, 1, 2]}
        label="Flop"
        hasCards={cards.length >= 3}
        cardW={cardW}
        cardH={cardH}
        gap={gap}
        labelH={labelH}
        labelTopGap={labelTopGap}
      />
      <CardGroup
        cards={cards}
        indices={[3]}
        label="Turn"
        hasCards={cards.length >= 4}
        cardW={cardW}
        cardH={cardH}
        gap={gap}
        labelH={labelH}
        labelTopGap={labelTopGap}
      />
      <CardGroup
        cards={cards}
        indices={[4]}
        label="River"
        hasCards={cards.length >= 5}
        cardW={cardW}
        cardH={cardH}
        gap={gap}
        labelH={labelH}
        labelTopGap={labelTopGap}
      />
    </div>
  );
}
