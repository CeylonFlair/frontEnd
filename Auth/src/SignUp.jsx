import React, { useState } from 'react';
import { Link} from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [country, setCountry] = useState('');

    // Handling form submission
    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     console.log({ username, email, password, profilePicture, country });
    // };

    return (
        <>
            <div>
                <h1>Get Started with CeylonFlair!</h1>
                {/* <form onSubmit={handleSubmit}> */} 
                <form className="form">
                    <h2>Create a New Account</h2>
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
                        <label>Email</label>
                        <br/>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <div>
                        <label>Profile Picture</label>
                        <br/>
                        <input
                            type="file"
                            onChange={(e) => setProfilePicture(e.target.files[0])}
                        />
                    </div>
                    <br/>
                    <div>
                        <label>Country</label>
                        <br/>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>
                    <br/>
                    <br/>
                    <button type="submit">REGISTER</button>
                    <br/>
                    <br/>
                    <p>Already have an account? <Link to ='/login'>Login</Link> </p>
                </form>
            </div>
        </>
    );
}

export default Register;
