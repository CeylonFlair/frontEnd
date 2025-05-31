import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            navigate('/dashboard'); 
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div>
            <h1>Welcome back to CeylonFlair!</h1>
            <form className="form" onSubmit={handleSubmit}>
                <h2>Sign in</h2>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <div>
                    <label>Username</label>
                    <br />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <br />
                <div>
                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <br />
                <br />
                <button type="submit">SIGN IN</button>
                <p>Don't have account? <Link to="/register">Sign up</Link> </p>
            </form>
        </div>
    );
};

export default SignIn;