import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function register(ev) {
    ev.preventDefault();
    setError(''); 
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/;
    
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one lowercase letter, one uppercase letter, and one symbol.');
      return;
    }  
    setLoading(true);  
    try {
      const response = await axios.post('/register', 
        { username, password }
      );
  
      setLoading(false); 
      if (response.status === 200) {
        alert('Registration successful');
        navigate('/login'); 
      } else {
        setError('Registration failed. Please try again.'); 
      }
    } catch (error) {
      setLoading(false);
      setError('Registration failed. Please try again.'); 
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-gray-900 mix-blend-screen"></div>

      {/* Form Container */}
      <form
        onSubmit={register}
        className="relative z-10 bg-gray-800 bg-opacity-80 backdrop-blur-lg p-10 rounded-lg shadow-2xl max-w-sm w-full space-y-6 border border-gray-600"
      >
        <h1 className="text-3xl font-extrabold text-center text-gray-200">Register</h1>
        
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
          {loading ? 'Loading...' : 'Register'}
        </button>

        <p className="text-center text-gray-400">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline font-semibold">Login</a>
        </p>
      </form>
    </div>
  );
}
