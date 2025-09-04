import React, { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  // Tipamos el posible shape del estado que ProtectedRoute envía al redirigir
  interface LocationState {
    from?: { pathname?: string };
  }
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname || "/home";

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          setErrorMsg("Credenciales inválidas");
        } else {
          setErrorMsg("Error del servidor");
        }
        return;
      }
      interface LoginResponse { token: string; userId: number; }
      const data: LoginResponse = await resp.json();
      
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_id", String(data.userId));
      navigate(from, { replace: true });
  } catch {
      setErrorMsg("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {errorMsg && <p className="login-error">{errorMsg}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
