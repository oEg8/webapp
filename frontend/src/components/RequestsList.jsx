export default function RequestsList({ requests, onStatusChange }) {
  if (!requests.length) {
    return <div className="card">Nog geen aanvragen.</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Recente aanvragen</h3>
        <p>Bekijk status en plan van de lopende pentests.</p>
      </div>
      <div className="card-body list">
        {requests.map((req) => (
          <article key={req.id} className="list-item">
            <header>
              <div>
                <div className="pill">{req.status.replace("_", " ")}</div>
                <strong>{req.client_name}</strong>
                <div className="meta">{new Date(req.created_at).toLocaleString()}</div>
              </div>
              <div className="actions">
                <select value={req.status} onChange={(e) => onStatusChange(req.id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="in_progress">in_progress</option>
                  <option value="complete">complete</option>
                </select>
              </div>
            </header>
            <p>{req.scope}</p>
            {req.preferred_window && <div className="meta">Venster: {req.preferred_window}</div>}
            <div className="meta">Contact: {req.contact_email}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
