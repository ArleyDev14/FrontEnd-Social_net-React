import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/register.css"

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    phone: "",
    email: "",
    birthday: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const validateAge = (birthday) => {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 14;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.values(formData).some((field) => field === "")) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!validateAge(formData.birthday)) {
      setError("Debes tener al menos 14 años para registrarte");
      return;
    }

    // if (formData.password !== formData.confirmPassword) {
    //   setError("Las contraseñas no coinciden");
    //   return;
    // }

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: Number(formData.phone), // Enviar el campo correctamente
          birthday: formData.birthday.toString(),
        }),
        credentials:"include"
      });

      if (!response.ok) {
        throw new Error("Error en el registro, intenta de nuevo");
      }

      alert("Registro exitoso. Redirigiendo al login...");
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Registro</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <input type="text" name="fullname" placeholder="Nombre completo" value={formData.fullname} onChange={handleChange} />
          <input type="text" name="username" placeholder="Usuario" value={formData.username} onChange={handleChange} />
          <input type="text" name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} />
          <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} />
          <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
          
          <button type="submit">Registrarse</button>
        </form>
        <p className="login-link">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/">Iniciar Sesion</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
