import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [nick, setNick] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        
        const postResponse = await axios.get('http://localhost:5000/posts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPosts(postResponse.data);

        
        const profileResponse = await axios.get(`http://localhost:5000/users/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, 
        });
        setNick(profileResponse.data.nick);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    if (user) fetchProfileData();
  }, [user]);

  return (
    <div>
      <h1>Mi perfil</h1>

      <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nick:</strong> {nick || "Sin nick"}</p>
      </div>

      <h2>Mis posts</h2>
      <ul>
        {posts.length > 0 ? (
          posts.map((post) => (
            <li key={post.id}>
              <Link to={`/post/${post.id}`}>{post.title}</Link>
              <p>{post.content}</p>
            </li>
          ))
        ) : (
          <p>No has publicado ningún post.</p>
        )}
      </ul>
    </div>
  );
}

export default Profile;
