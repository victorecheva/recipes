import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/", { replace: true });
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to the Home Page!</h1>
      <p className="home-paragraph">Esta ruta ahora está protegida.</p>
      <button className="home-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Home;
