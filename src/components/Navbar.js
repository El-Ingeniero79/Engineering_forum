
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/posts">Posts</Link>
      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          <Link to="/create-post">Create Post</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
