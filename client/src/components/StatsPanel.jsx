export default function StatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <section className="stats-panel">
      <div><strong>Total:</strong> {stats.totalBooks}</div>
      <div><strong>Read:</strong> {stats.readCount}</div>
      <div><strong>Unread:</strong> {stats.unreadCount}</div>
      <div>
        <strong>Avg Rating:</strong>{" "}
        {stats.averageRating !== null ? `${stats.averageRating.toFixed(1)} / 5` : "N/A"}
      </div>
    </section>
  );
}