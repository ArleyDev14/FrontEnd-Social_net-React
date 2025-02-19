import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './userContext';
import { useNavigate } from 'react-router-dom';
import { Camera, Heart, MessageCircle, Share2, Hash, Edit } from 'lucide-react';
import "../Styles/perfil.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [currentEditPost, setCurrentEditPost] = useState(null);
  const [newPostData, setNewPostData] = useState({
    imageUrl: '',
    caption: '',
    hashtags: []
  });
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [userData, setUserData] = useState({
    fullname: '',
    username: '',
    bio: '',
    phone: '',
    profilePicture: ''
  });
  const [userPosts, setUserPosts] = useState([]);
  const [formData, setFormData] = useState(userData);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({}); // Objeto para manejar nuevos comentarios por post
  const [likedPosts, setLikedPosts] = useState({}); // Estado para rastrear posts que el usuario ha dado like

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${user.username}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) throw new Error('Error al obtener los datos del usuario');

        const data = await response.json();
        setUserData(data);
        setFormData(data);

        // Fetch user posts
        const postsResponse = await fetch(`http://localhost:8080/api/posts/feed/${user.username}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setUserPosts(postsData);
          
          // Fetch likes and comments for each post
          postsData.forEach(post => {
            fetchLikes(post.id);
            fetchComments(post.id);
            checkIfLiked(post.id);
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (user && user.username) {
      fetchUserData();
    }
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
        // Actualizar estado local
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
        // Actualizar comentarios localmente
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newCommentData]
        }));
        // Limpiar el input de comentario
        setNewComments(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error("Error al agregar comentario:", error);
    }
  };

  // Nuevo manejador para la URL de la imagen
  const handleImageURLChange = (e) => {
    const imageUrl = e.target.value;
    setNewProfileImage(imageUrl);
    setFormData(prev => ({
      ...prev,
      profilePicture: imageUrl
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No hay token disponible");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      console.log(JSON.stringify(formData))
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
  
      const updatedUser = await response.json();
      setUserData(updatedUser);
      setIsEditModalOpen(false);
      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert(`Error al actualizar el perfil: ${error.message}`);
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu perfil? Esta acción no se puede deshacer.')) {
      await fetch(`http://localhost:8080/api/users/${userData.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      console.log('Perfil eliminado');
    }
  };

  if (!user || !userData.username) {
    return <div>Cargando...</div>;
  }

  const handleAddHashtag = (e) => {
    e.preventDefault();
    if (currentHashtag.trim()) {
      const formattedHashtag = currentHashtag.trim().startsWith('#') 
        ? currentHashtag.trim() 
        : `#${currentHashtag.trim()}`;
      
      if (!newPostData.hashtags.includes(formattedHashtag)) {
        setNewPostData(prev => ({
          ...prev,
          hashtags: [...prev.hashtags, formattedHashtag]
        }));
      }
      setCurrentHashtag('');
    }
  };

  const handleRemoveHashtag = (hashtagToRemove) => {
    setNewPostData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(tag => tag !== hashtagToRemove)
    }));
  };

  const handleNewPostSubmit = async () => {
    const token = localStorage.getItem("token"); // Asegúrate de tener el token almacenado
  
    if (!token) {
      console.error("No hay token disponible");
      return;
    }
  
    const postData = {
      title: newPostData.caption,
      content: newPostData.caption,
      imageUrl: newPostData.imageUrl,
    };
  
    try {
      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Enviar el token en el encabezado
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Post creado:", data);
    } catch (error) {
      console.error("Error al crear la publicación:", error);
    }
  };
  
  const handleNewPostInputChange = (e) => {
    const { name, value } = e.target;
    setNewPostData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    
    if (!currentEditPost) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No estás autenticado");
      return;
    }
    console.log("Datos enviados:", {
      content: currentEditPost.caption,
      imageUrl: currentEditPost.imageUrl
    });
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${currentEditPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: currentEditPost.caption, // Solo enviamos lo necesario
          imageUrl: currentEditPost.imageUrl
        })
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
  
      const updatedPost = await response.json(); // Obtener la respuesta del backend
  
      // Actualizar el estado local con la respuesta
      setUserPosts(prevPosts =>
        prevPosts.map(post => (post.id === updatedPost.id ? updatedPost : post))
      );
  
      setIsEditPostModalOpen(false);
      setCurrentEditPost(null);
      alert("Publicación actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar la publicación:", error);
      alert("Error al actualizar la publicación");
    }
  };

  return (
      <div className="p-container">
        <nav className="p-navbar">
          <div className="p-nav-content">
            <h1 className="p-nav-logo">Social_Net</h1>
            <div className="p-nav-links">
              <button onClick={() => navigate("/home")} className="p-nav-button">
                Feed Global
              </button>
              <button 
                onClick={() => setIsNewPostModalOpen(true)} 
                className="p-nav-button p-new-post-button"
              >
                Nueva Publicación
              </button>
            </div>
          </div>
        </nav>

      <div className="p-wrapper">
        {/* Perfil info card */}
        <div className="p-card">
          <div className="p-header">
            <div className="p-image-container">
              <img 
                src={userData.profilePicture} 
                alt={`${userData.username} profile`}
                className="p-image"
              />
            </div>
            <div className="p-info">
              <h1 className="p-name">{userData.name}</h1>
              <p className="p-username">@{userData.username}</p>
              <p className="p-bio">{userData.bio}</p>
              
              <div className="p-stats">
                <div className="p-stat-item">
                  <span className="p-stat-value">{userPosts.length}</span>
                  <p className="p-stat-label">Publicaciones</p>
                </div>
                <div className="p-stat-item">
                  <span className="p-stat-value">1.2K</span>
                  <p className="p-stat-label">Seguidores</p>
                </div>
                <div className="p-stat-item">
                  <span className="p-stat-value">843</span>
                  <p className="p-stat-label">Siguiendo</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-actions">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-edit-button"
            >
              Editar Perfil
            </button>
            <button 
              onClick={handleDeleteProfile}
              className="p-delete-button"
            >
              Eliminar Perfil 
            </button>
          </div>
        </div>

        {isNewPostModalOpen && (
        <div className="p-modal-overlay">
          <div className="p-modal-container">
            <div className="p-modal-header">
              <h2 className="p-modal-title">Nueva Publicación</h2>
              <button 
                onClick={() => setIsNewPostModalOpen(false)}
                className="p-modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleNewPostSubmit} className="p-edit-form">
              <div className="p-form-group">
                <label htmlFor="caption">Descripción</label>
                <textarea
                  id="caption"
                  name="caption"
                  value={newPostData.caption}
                  onChange={handleNewPostInputChange}
                  placeholder="¿Qué quieres compartir?"
                  rows="4"
                  required
                  className="p-caption-input"
                />
              </div>

              <div className="p-form-group">
                <label htmlFor="imageUrl">URL de la imagen (opcional)</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={newPostData.imageUrl}
                  onChange={handleNewPostInputChange}
                  placeholder="Ingresa la URL de la imagen"
                  className="p-image-input"
                />
              </div>

              {newPostData.imageUrl && (
                <div className="p-new-post-preview">
                  <img 
                    src={newPostData.imageUrl} 
                    alt="Preview"
                    className="p-post-preview-image"
                  />
                </div>
              )}

              <div className="p-form-group">
                <label htmlFor="hashtag">Hashtags</label>
                <div className="p-hashtag-input-container">
                  <input
                    type="text"
                    id="hashtag"
                    value={currentHashtag}
                    onChange={(e) => setCurrentHashtag(e.target.value)}
                    placeholder="Agrega un hashtag"
                    className="p-hashtag-input"
                  />
                  <button 
                    onClick={handleAddHashtag}
                    type="button" 
                    className="p-add-hashtag-button"
                  >
                    <Hash size={20} />
                    Agregar
                  </button>
                </div>
                {newPostData.hashtags.length > 0 && (
                  <div className="p-hashtags-container">
                    {newPostData.hashtags.map((tag, index) => (
                      <span key={index} className="p-hashtag-tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveHashtag(tag)}
                          className="p-remove-hashtag"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-form-actions">
                <button type="submit" className="p-save-button">
                  Publicar
                </button>
                <button 
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="p-cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* Grid de publicaciones */}
        <div className="p-wrapper">
        {userPosts.map((post) => (
          <div key={post.id} className="p-post">
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
      </div>

      {isEditPostModalOpen && currentEditPost && (
        <div className="p-modal-overlay">
          <div className="p-modal-container">
            <div className="p-modal-header">
              <h2 className="p-modal-title">Editar Publicación</h2>
              <button 
                onClick={() => {
                  setIsEditPostModalOpen(false);
                  setCurrentEditPost(null);
                }}
                className="p-modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditPost} className="p-edit-form">
              <div className="p-form-group">
                <label htmlFor="caption">Descripción</label>
                <textarea
                  id="caption"
                  value={currentEditPost.caption}
                  onChange={(e) => setCurrentEditPost({
                    ...currentEditPost,
                    caption: e.target.value
                  })}
                  placeholder="¿Qué quieres compartir?"
                  rows="4"
                  required
                  className="p-caption-input"
                />
              </div>

              <div className="p-form-group">
                <label htmlFor="imageUrl">URL de la imagen</label>
                <input
                  type="text"
                  id="imageUrl"
                  value={currentEditPost.imageUrl}
                  onChange={(e) => setCurrentEditPost({
                    ...currentEditPost,
                    imageUrl: e.target.value
                  })}
                  placeholder="Ingresa la URL de la imagen"
                  className="p-image-input"
                />
              </div>

              {currentEditPost.imageUrl && (
                <div className="p-new-post-preview">
                  <img 
                    src={currentEditPost.imageUrl} 
                    alt="Preview"
                    className="p-post-preview-image"
                  />
                </div>
              )}

              <div className="p-form-actions">
                <button type="submit" className="p-save-button">
                  Guardar cambios
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditPostModalOpen(false);
                    setCurrentEditPost(null);
                  }}
                  className="p-cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="p-modal-overlay">
          <div className="p-modal-container">
            <div className="p-modal-header">
              <h2 className="p-modal-title">Editar Perfil</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-modal-close"
              >
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-edit-form">
              <div className="p-form-group">
                <img 
                  src={newProfileImage || userData.profileImage} 
                  alt="Profile preview"
                  className="p-preview-image"
                />
                <label htmlFor="p-profile-image">Nueva foto de perfil</label>
                <input
                  type="text"
                  id="p-profile-image"
                  accept="image/*"
                  onChange={handleImageURLChange}
                  
                />
              </div>

              <div className="p-form-fields">
                <div className="p-form-group">
                  <label htmlFor="p-name">Nombre</label>
                  <input
                    type="text"
                    id="p-name"
                    name="name"
                    value={formData.fullname}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="p-form-group">
                  <label htmlFor="p-bio">Biografía</label>
                  <textarea
                    id="p-bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className="p-form-group">
                  <label htmlFor="p-phone">Teléfono</label>
                  <input
                    type="tel"
                    id="p-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="p-form-actions">
                <button type="submit" className="p-save-button">
                  Guardar cambios
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;