import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from './Components/userContext';
import LoginForm from "./Components/login";
import RegisterForm from "./Components/register";
import Feed from './Components/feed';
import Profile from "./Components/perfil";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/home" element={<Feed />} />
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
    </Router>
  </UserProvider>
);
