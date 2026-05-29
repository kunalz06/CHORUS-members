import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getAuthErrorMessage } from "./constants/authErrors";
import { useAuthSession } from "./hooks/useAuthSession";
import { auth, firebaseConfigStatus } from "./lib/firebase";
import "./styles.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { currentUser, isAuthReady } = useAuthSession();

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!auth) {
      setErrorMessage("Add your Firebase environment values before signing in.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setErrorMessage("");

    if (auth) {
      await signOut(auth);
    }
  }

  if (!isAuthReady) {
    return (
      <main className="app-shell">
        <section className="login-panel">
          <p className="eyebrow">CHORUS Members</p>
          <h1>Loading your session</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="login-panel" aria-labelledby="login-heading">
        <div className="brand-block">
          <p className="eyebrow">CHORUS Members</p>
          <h1 id="login-heading">Theatre club login</h1>
          <p className="intro">
            Sign in with your assigned club email and password.
          </p>
        </div>

        {!firebaseConfigStatus.isConfigured ? (
          <div className="setup-notice" role="status">
            <p className="setup-title">Firebase setup needed</p>
            <p>
              The app page is ready. Add the Firebase values in
              <span> client/.env.local </span>
              to enable login.
            </p>
          </div>
        ) : null}

        {currentUser ? (
          <div className="signed-in-state">
            <div>
              <p className="field-label">Signed in as</p>
              <p className="user-email">{currentUser.email}</p>
            </div>
            <button className="primary-button" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            <label>
              <span>Email</span>
              <input
                autoComplete="email"
                inputMode="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="member@college.edu"
                required
                type="email"
                value={email}
              />
            </label>

            <label>
              <span>Password</span>
              <input
                autoComplete="current-password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
                type="password"
                value={password}
              />
            </label>

            {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
