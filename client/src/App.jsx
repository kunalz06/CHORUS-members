import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./lib/firebase";
import "./styles.css";

const authErrors = {
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-password": "Enter your password.",
  "auth/user-disabled": "This account has been disabled.",
};

function getAuthErrorMessage(error) {
  return authErrors[error.code] ?? "Unable to log in. Please try again.";
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("");
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
    await signOut(auth);
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
