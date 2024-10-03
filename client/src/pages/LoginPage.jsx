import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();
    setError(''); 
  
    if (!username || !password) {
      setError('Please enter both username and password.');
      return; 
    } 
    setLoading(true);  
    try {
      const response = await axios.post('/login', 
        { username, password }, 
        { withCredentials: true }
      );
      setLoading(false);
      if (response.status === 200) {
        const userInfo = response.data; 
        setUserInfo(userInfo);
        setRedirect(true); 
      }
    } catch (error) {
      setLoading(false); 
      setError('Wrong credentials. Please try again.');  
    }
  }
  

  if (redirect) {
    return <Navigate to={'/'} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-gray-900 mix-blend-screen"></div>

      {/* Form Container */}
      <form
        onSubmit={login}
        className="relative z-10 bg-gray-800 bg-opacity-80 backdrop-blur-lg p-10 rounded-lg shadow-2xl max-w-sm w-full space-y-6 border border-gray-600"
      >
        <h1 className="text-3xl font-extrabold text-center text-gray-200">Welcome </h1>
        <p className="text-center text-gray-400">Please enter your credentials to continue</p>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={ev => setUsername(ev.target.value)}
          className="w-5/6 mx-auto p-2 bg-gray-700 border border-gray-500 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={ev => setPassword(ev.target.value)}
          className="w-5/6 mx-auto p-2 bg-gray-700 border border-gray-500 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${loading ? 'bg-gray-500' : 'bg-gray-600'} text-white font-semibold py-3 rounded-md hover:bg-gray-700 transition duration-300 shadow-lg transform hover:scale-105`}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>

        <p className="text-center text-gray-400">
          Don't have an account? <a href="/register" className="text-blue-500 hover:underline font-semibold">Register</a>
        </p>
      </form>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.1)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <polygon fill="url(#gradient)" points="0,0 100,0 100,100 0,100" />
        </svg>
      </div>
    </div>
  );
}
