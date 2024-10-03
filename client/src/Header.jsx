import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import axios from 'axios';

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/profile', {
          withCredentials: true,
        });
        setUserInfo(response.data); 
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchUserProfile(); 
  }, [setUserInfo]);

  function logout() {
    axios.post('/logout', {}, { 
      withCredentials: true 
    })
    .then(response => {
      setUserInfo(null); 
    })
    .catch(error => {
      console.error("Error during logout:", error);
    });
  }

  const username = userInfo?.username;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center p-4 bg-gray-100 shadow-md">
      <Link to="/" className="logo" aria-label="Home">MyBlog</Link>
      <nav>
        {username ? (
          <>
            <Link to="/create" className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded transition duration-300" aria-label="Create a new post" >Create new post</Link>
            <Link onClick={logout} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded transition duration-300" aria-label={`Logout (${username})`}>Logout ({username})</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded transition duration-300" aria-label="Login">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded transition duration-300" aria-label="Register">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
