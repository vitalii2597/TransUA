interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ total, page, pageSize, onChange }: PaginationProps) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const btnBase: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 13,
    cursor: 'pointer',
    background: '#fff',
    color: '#374151',
  };

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
      <button
        style={{ ...btnBase, opacity: page === 1 ? 0.4 : 1 }}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ←
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          style={{
            ...btnBase,
            background: p === page ? '#1a3a5c' : '#fff',
            color: p === page ? '#fff' : '#374151',
            borderColor: p === page ? '#1a3a5c' : '#e5e7eb',
            fontWeight: p === page ? 700 : 400,
          }}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        style={{ ...btnBase, opacity: page === pages ? 0.4 : 1 }}
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
      >
        →
      </button>
    </div>
  );
}
