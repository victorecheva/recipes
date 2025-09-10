import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import User from "../models/User";

interface SidebarProps {
  users: User[];
  onUserSelect: (user: User) => void; // 👈 Nuevo callback
}

const Sidebar: React.FC<SidebarProps> = ({ users, onUserSelect }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/", { replace: true });
  };

  
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <button
          className="sidebar-button"
          onClick={() => navigate("/home")}
        >
          Home
        </button>

        <ul className="user-list">
          {users.map((u) => (
            <li
              key={u.id}
              className="user-item"
              onClick={() => onUserSelect(u)} // 👈 Avisamos al padre
            >
              {u.username}
            </li>
          ))}
        </ul>
        
      </div>

      <button className="sidebar-button logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
