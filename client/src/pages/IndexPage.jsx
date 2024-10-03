import axios from "axios";
import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  useEffect(() => {
    axios.get('/post')
      .then(response => {
        setPosts(response.data); // Data is already parsed
        setLoading(false); // Data fetched
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setError(err.message);
        setLoading(false); // Error occurred
      });
  }, []);

  if (loading) {
    return <div>Loading posts...</div>;  // Display loading message
  }

  if (error) {
    return <div>Error: {error}</div>;  // Display error message if there's an error
  }

  if (posts.length === 0) {
    return <div>No posts available.</div>;  // Display a message if no posts are found
  }

  return (
    <>
      {posts.map(post => (
        <Post key={post._id} {...post} />  // Added `key` prop for better React list handling
      ))}
    </>
  );
}
