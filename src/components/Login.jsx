import { useState } from 'react';

// NOTE: This is a client-side gate only. On a public static site the credentials
// are visible in the shipped JS — it deters casual access, it is not real security.
// Swap for encrypted payloads / real auth if stronger protection is needed.
const USERNAME = 'fairstonecalculator';
const PASSWORD = 'fairstonecalculator';
const STORAGE_KEY = 'fps-auth';

export function isAuthed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function logout() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (username.trim() === USERNAME && password === PASSWORD) {
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <img
          className="login__logo"
          src={`${import.meta.env.BASE_URL}Logo_FairstoneIreland_White.svg`}
          alt="Fairstone Ireland"
        />
        <h1 className="login__title">Financial Protection Calculator</h1>
        <p className="login__subtitle">Please sign in to continue.</p>

        <label className="field">
          <span className="field__label">Username</span>
          <input className="input" type="text" autoComplete="username" value={username}
            onChange={(e) => { setUsername(e.target.value); setError(false); }} autoFocus />
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          <span className="field__label">Password</span>
          <input className="input" type="password" autoComplete="current-password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }} />
        </label>

        {error && <p className="login__error">Incorrect username or password.</p>}

        <button className="login__btn" type="submit">Sign in</button>
      </form>
    </div>
  );
}
