import { useState } from "react";

const initialState = {
  client_name: "",
  contact_email: "",
  scope: "",
  preferred_window: "",
};

export default function RequestForm({ onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.client_name || !form.contact_email || !form.scope) {
      setError("Name, email, and scope are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(initialState);
    } catch (err) {
      setError(err?.response?.data || "Saving failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header">
        <h3>Submit request</h3>
        <p>Tell us which test you need.</p>
      </div>
      <div className="card-body">
        {error && <div className="alert">{error}</div>}
        <label>
          Organization name
          <input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} placeholder="ACME Corp" />
        </label>
        <label>
          Contact email
          <input value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="security@acme.com" />
        </label>
        <label>
          Scope
          <textarea value={form.scope} onChange={(e) => update("scope", e.target.value)} placeholder="API endpoints, webapp, etc." rows={3} />
        </label>
        <label>
          Preferred test window
          <input value={form.preferred_window} onChange={(e) => update("preferred_window", e.target.value)} placeholder="e.g. week 12, outside business hours" />
        </label>
      </div>
      <div className="card-footer">
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Submit request"}
        </button>
      </div>
    </form>
  );
}
