import 'react-quill/dist/quill.snow.css';
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import axios from 'axios';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function createNewPost(ev) {
    ev.preventDefault();
    if (!title || !summary || !content || files.length === 0) {
      setErrorMessage("All fields are required, including a file.");
      return;
    }

    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);  

    try {
      const response = await axios.post('/post', data, {
        withCredentials: true,
      });

      
      if (response.status===200) {
        setRedirect(true);
      } else {
        setErrorMessage("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setErrorMessage("An error occurred while creating the post.");
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <form onSubmit={createNewPost}>
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
      <Editor value={content} onChange={setContent} />
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <button style={{ marginTop: '5px' }}>Create Post</button>
    </form>
  );
}
