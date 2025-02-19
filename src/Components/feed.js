import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './userContext';
import "../Styles/feed.css";
import { fetchFeed } from "./api";
import { Heart, MessageCircle } from 'lucide-react';

const Feed = () => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const navigate = useNavigate();

  // Cargar publicaciones desde la API
  useEffect(() => {
    const loadFeed = async () => {
      if (user && user.username) {
        const data = await fetchFeed(user.username);
        setPosts(data);
        
        // Fetch likes and comments for each post
        data.forEach(post => {
          fetchLikes(post.id);
          fetchComments(post.id);
          checkIfLiked(post.id);
        });
      }
    };
    loadFeed();
  }, [user]);

  const checkIfLiked = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/likes/check`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const isLiked = await response.json();
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
    } catch (error) {
      console.error("Error al verificar like:", error);
    }
  };

  const fetchLikes = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/likes/count`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const count = await response.json();
      setLikes(prev => ({ ...prev, [postId]: count }));
    } catch (error) {
      console.error("Error al obtener likes:", error);
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const method = likedPosts[postId] ? "DELETE" : "POST";
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/likes`, {
        method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
        fetchLikes(postId);
      }
    } catch (error) {
      console.error("Error al gestionar like:", error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const token = localStorage.getItem("token");
    const commentContent = newComments[postId];
    
    if (!commentContent?.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newCommentData]
        }));
        setNewComments(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error("Error al agregar comentario:", error);
    }
  };

  const handleNavigateProfile = () => {
    navigate('/profile');
  };

  const handleOpenCommentModal = (post) => {
    setCurrentPost(post);
    setIsCommentModalOpen(true);
  };

  return (
    <div className="p-container">
      <nav className="p-navbar">
        <div className="p-nav-content">
          <h1 className="p-nav-logo">Social_Net</h1>

          <div className="p-form-group">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-form-group input"
            />
          </div>

          <div className="p-actions">
            <button onClick={() => navigate("/profile")} className="p-nav-button">
              Mi Perfil
            </button>
            <button onClick={() => navigate("/notifications")} className="p-nav-button">
              Notificaciones
            </button>
          </div>
        </div>
      </nav>

      <div className="p-wrapper">
        {posts.length === 0 ? (
          <div className="p-card">
            <p className="p-bio">No hay publicaciones.</p>
          </div>
        ) : (
          <div className="p-posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="p-post">
                <div className="p-header">
                  <div className="p-image-container" style={{width: '40px', height: '40px'}}>
                    <img
                      src={post.user.profilePicture || "/default-avatar.png"}
                      alt={`${post.user.username} avatar`}
                      className="p-image"
                    />
                  </div>
                  <div className="p-info">
                    <span
                      className="p-username"
                      onClick={() => navigate(`/profile/${post.user.id}`)}
                      style={{cursor: 'pointer'}}
                    >
                      {post.user.username}
                    </span>
                    <span className="p-name">{post.user.name}</span>
                  </div>
                </div>

                {post.imageUrl && (
                  <img src={post.imageUrl} alt="post" className="p-post-image" />
                )}

                <div className="p-post-content">
                  <p className="p-post-caption">{post.content}</p>
                  
                  <div className="p-post-actions">
                    <button 
                      className={`p-interaction-button p-like-button ${likedPosts[post.id] ? 'active' : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart 
                        size={20} 
                        fill={likedPosts[post.id] ? 'var(--like-color)' : 'none'}
                        color={likedPosts[post.id] ? 'var(--like-color)' : 'currentColor'}
                      />
                      <span className="p-like-count">{likes[post.id] || 0}</span>
                    </button>
                    
                    <button className="p-interaction-button p-comment-button">
                      <MessageCircle size={20} />
                      <span>{comments[post.id]?.length || 0}</span>
                    </button>
                  </div>

                  <div className="p-comments-preview">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="p-comment-item">
                        <div className="p-comment-content">
                          <span className="p-comment-user">{comment.username}</span>
                          <p className="p-comment-text">{comment.content}</p>
                          <div className="p-comment-metadata">
                            <span className="p-comment-date">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="p-comment-input-container">
                      <input
                        type="text"
                        className="p-comment-input"
                        value={newComments[post.id] || ''}
                        onChange={(e) => setNewComments(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        placeholder="Escribe un comentario..."
                      />
                      <button 
                        className="p-comment-submit"
                        onClick={() => handleAddComment(post.id)}
                      >
                        Comentar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;