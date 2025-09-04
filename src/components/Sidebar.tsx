import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import User from "../models/User"; 

interface SidebarProps {
  users: User[];
}

const Sidebar: React.FC<SidebarProps> = ({ users }) => {
    const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/", { replace: true });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <button className="sidebar-button home" onClick={() => navigate("/home")}>
          Home
        </button>

        <ul className="user-list">
          {users.map((u) => (
            <li key={u.id} className="user-item">
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
