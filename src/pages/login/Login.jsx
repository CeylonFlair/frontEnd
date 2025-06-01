import React, { useState } from "react";
import "./Login.scss";
import { Link, useNavigate } from "react-router-dom";

function Login() {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      // const navigate = useNavigate();
  
      const handleSubmit = async (e) => {
          e.preventDefault();
          setError('');
          try {
              const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, password }),
              });
              if (!res.ok) {
                  const data = await res.json();
                  setError(data.message || 'Login failed');
                  return;
              }
              // navigate('/dashboard'); 
          } catch (err) {
              setError('Network error');
          }
      };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        {error && <div style={{ color: 'red' }}>{error}</div>}

        <label htmlFor="">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p>Don't have account? <Link to="/register">Sign up</Link> </p>
      </form>
    </div>
  );
}

export default Login;
