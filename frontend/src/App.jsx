import { useEffect, useState } from "react";
import { createRequest, fetchOfferings, fetchRequests, updateRequest } from "./api";
import OfferingList from "./components/OfferingList";
import RequestForm from "./components/RequestForm";
import RequestsList from "./components/RequestsList";

export default function App() {
  const [offerings, setOfferings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [offeringData, requestData] = await Promise.all([fetchOfferings(), fetchRequests()]);
      setOfferings(offeringData);
      setRequests(requestData);
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async (data) => {
    const created = await createRequest(data);
    setRequests((prev) => [created, ...prev]);
  };

  const handleStatusChange = async (id, status) => {
    const updated = await updateRequest(id, { status });
    setRequests((prev) => prev.map((req) => (req.id === id ? updated : req)));
  };

  return (
    <div className="layout">
      <header className="hero">
        <div>
          <p className="eyebrow">Pentest as a Service</p>
          <h1>Plan, monitor en bevestig pentests vanuit één portal.</h1>
          <p className="lede">
            Combineer aanvragen, scopes en statusupdates in een lichte workflow. Backend in Django, frontend in React, alles klaar
            voor containers.
          </p>
        </div>
        <div className="hero-card">
          <p className="eyebrow">Snelle start</p>
          <p>Gebruik het formulier hieronder om een nieuwe aanvraag in te dienen. De lijst rechts toont de laatste inzendingen.</p>
          <p className="meta">Backend endpoint: {import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api"}</p>
        </div>
      </header>

      {loading ? (
        <div className="card">Laden...</div>
      ) : (
        <div className="grid">
          <OfferingList offerings={offerings} />
          <RequestForm onSubmit={handleCreate} />
          <RequestsList requests={requests} onStatusChange={handleStatusChange} />
        </div>
      )}
    </div>
  );
}
