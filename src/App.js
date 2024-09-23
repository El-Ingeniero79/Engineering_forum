
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import PostForm from './pages/PostForm';
import PostList from './pages/PostList';
import Posts from './pages/Posts';
// import './Post.css'
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
     
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/create-post" element={<PostForm />} />
          <Route path="/posts" element={<Posts />} /> 
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
