export function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div
        className="animate-spin rounded-full"
        style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#1a3a5c' }}
      />
    </div>
  );
}
