import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/userProvider.jsx";

export const AuthenticationMode = {
  SignIn: "signin",
  SignUp: "signup"
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function Authentication({ authenticationMode }) {
  const ctx = useUser();

  // Jos konteksti puuttuu kokonaan (käytetään UserProviderin ulkopuolella)
  if (ctx === null) {
    console.error("Authentication used outside of UserProvider");
    return <div>Something went wrong with authentication context.</div>;
  }

  const { login } = ctx;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignIn = authenticationMode === AuthenticationMode.SignIn;

  function extractErrorMessage(error) {
    const data = error?.response?.data;
    return (
      data?.error?.message ??
      data?.error ??
      data?.message ??
      error?.message ??
      String(error)
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignIn) {
        // ---------- SIGN IN ----------
        const res = await axios.post(`${API}/user/signin`, {
          email,
          password
        });

        // backend palauttaa esim. { id, email, token }
        login(res.data);
        navigate("/");
      } else {
        // ---------- SIGN UP ----------
        await axios.post(`${API}/user/signup`, {
          email,
          password
        });

        alert("Account created, you can now sign in");
        navigate("/signin");
      }
    } catch (error) {
      alert(extractErrorMessage(error));
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <h1 className="auth-title">
          {isSignIn ? "Sign in to your account" : "Create a new account"}
        </h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="auth-button">
            {isSignIn ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="auth-footer">
          {isSignIn ? (
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/signup">Create one</Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link to="/signin">Sign in instead</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}