import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";
import axios from "axios";

export default function EditPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // New state
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios.get(`/post/${id}`)
      .then(response => {
        const postInfo = response.data; // Access data directly
        setTitle(postInfo.title);
        setContent(postInfo.content);
        setSummary(postInfo.summary);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching post:", error);
        setErrorMessage("Failed to load post data");
        setLoading(false);
      });
  }, [id]);

  async function updatePost(ev) {
    ev.preventDefault();
    setUpdating(true); // Set updating state

    if (!title || !summary || !content) {
      setErrorMessage("All fields are required.");
      setUpdating(false);
      return;
    }

    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('id', id);

    if (files.length > 0) {
      data.set('file', files[0]);
    }

    try {
      const response = await axios.put('/post', data, {
        withCredentials: true,  // Include credentials like cookies (if not globally set)
      });
      

      if (response.status===200) {
        setRedirect(true);
      } else {
        setErrorMessage("Failed to update post.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      setErrorMessage("An error occurred while updating the post.");
    } finally {
      setUpdating(false); // Reset updating state
    }
  }

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={updatePost}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={ev => setTitle(ev.target.value)}
      />
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={ev => setSummary(ev.target.value)}
      />
      <input
        type="file"
        onChange={ev => setFiles(ev.target.files)}
      />
      <Editor onChange={setContent} value={content} />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <button style={{ marginTop: '5px' }} disabled={updating}>
        {updating ? 'Updating...' : 'Update Post'}
      </button>
    </form>
  );
}
