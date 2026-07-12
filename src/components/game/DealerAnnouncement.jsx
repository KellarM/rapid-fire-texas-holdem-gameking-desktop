export default function DealerAnnouncement({ message }) {
  const text = message || '';

  return (
    <div
      style={{
        width: '100%',
        height: '40px',
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
            fontSize: '1rem',
            fontWeight: 700,
            fontStyle: 'italic',
            lineHeight: '40px',
            height: '40px',
            transform: 'skewX(-8deg)',
            display: 'inline',
            color: '#f6d860',
            textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 6px rgba(180,130,40,0.4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}