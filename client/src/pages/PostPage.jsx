import { useContext, useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import axios from 'axios';
export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/${id}`);
        setPostInfo(response.data); 
        setLoading(false); 
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message); 
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  async function deletePost() {
    const confirmed = window.confirm('Do you want to delete this post?');
    if (!confirmed) return;

    const response = await axios.delete(`/post/${id}`, {
          withCredentials: true,
    });

    if (response.status===200) {
      alert('Post deleted');
      setRedirect(true);
    } else if (response.status === 404) {
      alert('Post not found');
    } else if (response.status === 403) {
      alert('You are not authorized to delete this post');
    } else {
      alert('Failed to delete post');
    }
  }

  if (loading) {
    return <div>Loading post...</div>;  // Display loading message
  }

  if (error) {
    return <div>Error: {error}</div>;  // Display error message
  }

  if (!postInfo) return '';

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="post-page max-w-2xl mx-auto p-6 bg-gray-50 rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
        {postInfo.title}
      </h1>
      <time className="block text-center text-gray-500 mb-4 text-lg">
        {formatISO9075(new Date(postInfo.createdAt))}
      </time>
      <div className="author text-center text-gray-600 text-lg mb-6">
        by <span className="text-indigo-600 font-medium">@{postInfo.author.username}</span>
      </div>

      {userInfo?.id === postInfo.author._id && (
        <div className="edit-row flex flex-col items-center space-y-4 my-8">
          <Link
            className="edit-btn inline-block w-48 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 hover:scale-105 transition-all duration-300 ease-out text-center"
            to={`/edit/${postInfo._id}`}
          >
            ✏️ Edit this post
          </Link>
          <button
            onClick={deletePost}
            className="delete-btn inline-block w-48 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-300 ease-out text-center"
          >
            🗑️ Delete this post
          </button>
        </div>
      )}

      <div className="image mb-8">
        <img
          src={postInfo.cover}
          alt={`Cover for ${postInfo.title}`}  // Descriptive alt text for accessibility
          className="w-full h-auto rounded-2xl shadow-lg"
        />
      </div>

      <div dangerouslySetInnerHTML={{ __html: postInfo.content }} className="prose mx-auto text-gray-700 leading-relaxed" />
    </div>
  );
}
