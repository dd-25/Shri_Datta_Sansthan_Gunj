import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axiosConfig';
import './Login.css';
import { AuthContext } from '../context/Authcontext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { isAuthenticated, bhakt, loading, verifyToken } = useContext(AuthContext);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('/api/login', { username, password })
      .then(response => {
        if (response.data.success) {
          verifyToken();
          navigate('/home');
        } else {
          console.error('Login failed:', response.data.message);
        }
      })
      .catch(error => {
        console.error('Login error:', error);
      });
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          required
          className="login-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          required
          className="login-input"
        />
        <input type="submit" id="login-submit" value="Login" className="login-submit" />
      </form>
      <div className="login-options">
        <a href="#forgot-password" className="login-link">Forgot Password?</a>
        <a id='signup' href="/signup" className="login-link">Sign Up</a>
      </div>
      <div className="login-google">
        <button className="google-button">
          <i className="fab fa-google"></i> Login with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
