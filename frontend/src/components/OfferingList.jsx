export default function OfferingList({ offerings }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Services</h3>
        <p>Choose a pentest profile that fits your environment.</p>
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
