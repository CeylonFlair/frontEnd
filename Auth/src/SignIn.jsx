import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Handling form submission
    // const handleSubmit = (e) => {
    //     e.preventDefault(); 
    //     console.log('Logging in with:', username, password);
    // };

    return(
        <>
            <div>
            <h1>Welcome back to CeylonFlair!</h1>
                {/* <form onSubmit={handleSubmit}> */}
                <form className="form">
                    <h2>Sign in</h2>
                    <div>
                        <label>Username</label>
                        <br/>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <br/>
                    <div>
                        <label>Password</label>
                        <br/>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <br/>
                    <br/>
                    <button type="submit">SIGN IN</button>
                    <p>Don't have account? <Link to="/register">Sign up</Link> </p>
                </form>
            </div>
        </>
    );
}

export default SignIn;
