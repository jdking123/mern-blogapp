import axios from "axios";
import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  

  useEffect(() => {
    axios.get('/post')
      .then(response => {
        setPosts(response.data);
        setLoading(false); 
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setError(err.message);
        setLoading(false); 
      });
  }, []);

  if (loading) {
    return <div>Loading posts...</div>;  
  }

  if (error) {
    return <div>Error: {error}</div>;  
  }

  if (posts.length === 0) {
    return <div>No posts available.</div>;  
  }

  return (
    <>
      {posts.map(post => (
        <Post key={post._id} {...post} />  
      ))}
    </>
  );
}
