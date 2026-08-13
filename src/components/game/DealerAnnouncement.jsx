// Matches card tokens like "9♠", "10♥", "K♦", "A♣" inside the dealer message
const CARD_TOKEN_REGEX = /(10|[2-9]|[AKQJ])([♠♥♦♣])/g;
const RED_SUITS = new Set(['♥', '♦']);

function renderColoredMessage(text) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  CARD_TOKEN_REGEX.lastIndex = 0;

  while ((match = CARD_TOKEN_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    const isRed = RED_SUITS.has(match[2]);
    nodes.push(
      <span
        key={key++}
        style={{
          color: isRed ? '#ff4d4d' : '#000',
          textShadow: isRed
            ? '0 1px 2px rgba(0,0,0,0.85), 0 0 6px rgba(255,60,60,0.4)'
            : '0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        {match[0]}
      </span>
    );
    lastIndex = CARD_TOKEN_REGEX.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return nodes;
}

export default function DealerAnnouncement({ message, fontSize = '1.2rem', height = '40px', lineHeight = '40px' }) {
  const text = message || '';

  return (
    <div
      style={{
        width: '100%',
        height: height,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {text && (
        <span
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: fontSize,
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: lineHeight,
            height: height,
            transform: 'skewX(-8deg)',
            display: 'inline',
            color: '#f6d860',
            textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(180,130,40,0.4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {renderColoredMessage(text)}
        </span>
      )}
    </div>
  );
}