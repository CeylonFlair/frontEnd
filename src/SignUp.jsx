import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [country, setCountry] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('country', country);
        if (profilePicture) {
            formData.append('profilePicture', profilePicture);
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'Registration failed');
                return;
            }
            navigate('/login');
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div>
            <h1>Get Started with CeylonFlair!</h1>
            <form className="form" onSubmit={handleSubmit}>
                <h2>Create a New Account</h2>
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
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                <div>
                    <label>Profile Picture</label>
                    <br />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePicture(e.target.files[0])}
                    />
                </div>
                <br />
                <div>
                    <label>Country</label>
                    <br />
                    <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    />
                </div>
                <br />
                <br />
                <button type="submit">REGISTER</button>
                <br />
                <br />
                <p>Already have an account? <Link to='/login'>Login</Link> </p>
            </form>
        </div>
    );
};

export default Register;


