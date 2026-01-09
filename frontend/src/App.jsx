import { useEffect, useMemo, useState } from "react";
import { fetchEngines, fetchMe, fetchScans, loginUser, registerUser, runScan, verifyMfa } from "./api";

const ROUTES = {
  login: "/login",
  register: "/register",
  mfa: "/mfa",
  pentest: "/pentest",
  dashboard: "/dashboard",
};

const getRoute = () => {
  const raw = window.location.hash.replace("#", "");
  return raw || ROUTES.login;
};

const navigate = (route) => {
  window.location.hash = route;
};

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [auth, setAuth] = useState({ token: null, user: null, profile: null });
  const [booting, setBooting] = useState(true);
  const [alert, setAlert] = useState("");
  const [mfa, setMfa] = useState({ required: false, username: "", code: "" });
  const [scanState, setScanState] = useState({ running: false, latest: null });
  const [scans, setScans] = useState([]);
  const [engines, setEngines] = useState([]);
  const [selectedEngine, setSelectedEngine] = useState("nmap");

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setBooting(false);
      return;
    }
    fetchMe(token)
      .then((data) => {
        setAuth({ token, user: data.user, profile: data.profile });
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
      })
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    if (!auth.token) {
      if ([ROUTES.pentest, ROUTES.dashboard].includes(route)) {
        navigate(ROUTES.login);
      }
      return;
    }
    if (route === ROUTES.dashboard) {
      fetchScans(auth.token).then(setScans).catch(() => setAlert("Could not load scans."));
    }
    if (route === ROUTES.pentest) {
      fetchEngines()
        .then((list) => {
          setEngines(list);
          if (list.length && !list.includes(selectedEngine)) {
            setSelectedEngine(list[0]);
          }
        })
        .catch(() => setAlert("Could not load engines."));
    }
  }, [route, auth.token]);

  const isAuthed = Boolean(auth.token);
  const pageTitle = useMemo(() => {
    switch (route) {
      case ROUTES.register:
        return "Register";
      case ROUTES.mfa:
        return "MFA verification";
      case ROUTES.pentest:
        return "Run pentest";
      case ROUTES.dashboard:
        return "Dashboard";
      default:
        return "Sign in";
    }
  }, [route]);

  const handleRegister = async (event) => {
    event.preventDefault();
    setAlert("");
    const form = new FormData(event.currentTarget);
    const payload = {
      username: form.get("username"),
      password: form.get("password"),
      email: form.get("email"),
      target_ip: form.get("target_ip"),
      mfa_enabled: form.get("mfa_enabled"),
    };
    try {
      const data = await registerUser(payload);
      localStorage.setItem("auth_token", data.token);
      setAuth({ token: data.token, user: data.user, profile: data.profile });
      navigate(ROUTES.pentest);
    } catch (error) {
      setAlert(error.response?.data?.error || "Registration failed.");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAlert("");
    const form = new FormData(event.currentTarget);
    const payload = {
      username: form.get("username"),
      password: form.get("password"),
    };
    try {
      const data = await loginUser(payload);
      if (data.mfa_required) {
        setMfa({ required: true, username: data.username, code: data.mfa_code || "" });
        navigate(ROUTES.mfa);
        return;
      }
      localStorage.setItem("auth_token", data.token);
      setAuth({ token: data.token, user: data.user, profile: data.profile });
      navigate(ROUTES.pentest);
    } catch (error) {
      setAlert(error.response?.data?.error || "Login failed.");
    }
  };

  const handleMfaVerify = async (event) => {
    event.preventDefault();
    setAlert("");
    const form = new FormData(event.currentTarget);
    const payload = {
      username: mfa.username,
      code: form.get("code"),
    };
    try {
      const data = await verifyMfa(payload);
      localStorage.setItem("auth_token", data.token);
      setAuth({ token: data.token, user: data.user, profile: data.profile });
      setMfa({ required: false, username: "", code: "" });
      navigate(ROUTES.pentest);
    } catch (error) {
      setAlert(error.response?.data?.error || "MFA verification failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setAuth({ token: null, user: null, profile: null });
    setScans([]);
    navigate(ROUTES.login);
  };

  const handleRunScan = async () => {
    setAlert("");
    setScanState({ running: true, latest: null });
    try {
      const data = await runScan(auth.token, selectedEngine);
      setScanState({ running: false, latest: data });
      setScans((prev) => [data, ...prev]);
      if (typeof data.credits === "number") {
        setAuth((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            credits: data.credits,
          },
        }));
      }
    } catch (error) {
      setScanState({ running: false, latest: null });
      setAlert(error.response?.data?.error || "Scan failed.");
    }
  };

  if (booting) {
    return (
      <div className="layout">
        <div className="card">
          <div className="card-body">Starting up...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <header className="hero">
        <div>
          <p className="eyebrow">Pentest Control Center</p>
          <h1>{pageTitle}</h1>
          <p className="lede">
            Register your target, sign in, and run a simple Nmap scan. Results show up immediately in your dashboard.
          </p>
        </div>
        <div className="hero-card">
          <p className="eyebrow">Status</p>
          {isAuthed ? (
            <>
              <p className="meta">Signed in as {auth.user?.username}</p>
              <p className="meta">Target IP: {auth.profile?.target_ip}</p>
              <p className="meta">Credits: {auth.profile?.credits ?? 0}</p>
              <button className="secondary" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="meta">Not signed in yet.</p>
              <div className="stack">
                <button type="button" onClick={() => navigate(ROUTES.login)}>
                  Sign in
                </button>
                <button className="secondary" type="button" onClick={() => navigate(ROUTES.register)}>
                  Register
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {isAuthed && (
        <nav className="nav">
          <button type="button" className={route === ROUTES.pentest ? "active" : ""} onClick={() => navigate(ROUTES.pentest)}>
            Pentest
          </button>
          <button type="button" className={route === ROUTES.dashboard ? "active" : ""} onClick={() => navigate(ROUTES.dashboard)}>
            Dashboard
          </button>
        </nav>
      )}

      {alert && <div className="alert">{alert}</div>}

      {!isAuthed && route === ROUTES.login && (
        <section className="card">
          <div className="card-header">
            <h3>Sign in</h3>
          </div>
          <form className="card-body form-grid" onSubmit={handleLogin}>
            <label>
              Username
              <input name="username" type="text" required />
            </label>
            <label>
              Password
              <input name="password" type="password" required />
            </label>
            <button type="submit">Sign in</button>
          </form>
        </section>
      )}

      {!isAuthed && route === ROUTES.register && (
        <section className="card">
          <div className="card-header">
            <h3>Register</h3>
          </div>
          <form className="card-body form-grid" onSubmit={handleRegister}>
            <label>
              Username
              <input name="username" type="text" required />
            </label>
            <label>
              Password
              <input name="password" type="password" required />
            </label>
            <label>
              Email
              <input name="email" type="email" />
            </label>
            <label>
              Target IP
              <input name="target_ip" type="text" placeholder="192.168.1.10" required />
            </label>
            <label className="checkbox">
              <input name="mfa_enabled" type="checkbox" />
              Enable MFA (dev)
            </label>
            <button type="submit">Create account</button>
          </form>
        </section>
      )}

      {!isAuthed && route === ROUTES.mfa && (
        <section className="card">
          <div className="card-header">
            <h3>MFA verification</h3>
          </div>
          <div className="card-body">
            <p className="meta">Dev code (for now): {mfa.code || "n/a"}</p>
            <form className="form-grid" onSubmit={handleMfaVerify}>
              <label>
                MFA code
                <input name="code" type="text" defaultValue={mfa.code} required />
              </label>
              <button type="submit">Verify</button>
            </form>
          </div>
        </section>
      )}

      {isAuthed && route === ROUTES.pentest && (
        <section className="card">
          <div className="card-header">
            <h3>Start pentest</h3>
          </div>
          <div className="card-body">
            <p className="meta">Target IP: {auth.profile?.target_ip}</p>
            <p className="meta">
              Working hours: 09:00 - 17:00 (current: {new Date().toLocaleTimeString()})
            </p>
            <p className="meta">Credits available: {auth.profile?.credits ?? 0}</p>
            {engines.length > 0 && (
              <label>
                Engine
                <select value={selectedEngine} onChange={(event) => setSelectedEngine(event.target.value)}>
                  {engines.map((engine) => (
                    <option key={engine} value={engine}>
                      {engine}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="button" onClick={handleRunScan} disabled={scanState.running}>
              {scanState.running ? "Scanning..." : "Start scan"}
            </button>
          </div>
          {scanState.latest && (
            <div className="card-footer">
              <h4>Latest result</h4>
              <pre className="code-block">{scanState.latest.output || "No output."}</pre>
            </div>
          )}
        </section>
      )}

      {isAuthed && route === ROUTES.dashboard && (
        <section className="card">
          <div className="card-header">
            <h3>Results</h3>
          </div>
          <div className="card-body list">
            {scans.length === 0 ? (
              <p className="meta">No scans yet.</p>
            ) : (
              scans.map((scan) => (
                <div key={scan.id} className="list-item">
                  <header>
                    <div>
                      <p className="pill">{scan.status}</p>
                      <p className="meta">{scan.target_ip}</p>
                    </div>
                    <span className="meta">{new Date(scan.created_at).toLocaleString()}</span>
                  </header>
                  <pre className="code-block">{scan.output || "No output."}</pre>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
