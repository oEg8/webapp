export default function OfferingList({ offerings }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Diensten</h3>
        <p>Kies een pentest profiel dat past bij uw omgeving.</p>
      </div>
      <div className="card-body list">
        {offerings.map((item) => (
          <article key={item.id} className="list-item">
            <strong>{item.name}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
