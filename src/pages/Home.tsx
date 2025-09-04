import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Home.css";
import User from "../models/User";  

const Home: React.FC = () => {
      

  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:4000/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error fetching users");
        }
        const data = await response.json();

        //Map the response to User instances
        // Mapeamos los datos a instancias de User
        const usersList = data.map(
          (u: { id: number; username: string }) => new User(u.username, u.id)
        );

        setUsers(usersList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, [token]);

      
  return (
    <div className="flex">
      {/* Sidebar */}
      {/* <Sidebar users={users} /> */}
      <Sidebar users={users} />

      {/* Contenido principal */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Home Page!</h1>
        <p className="mb-4">Esta ruta ahora está protegida.</p>
        {/* Aquí irá tu contenido dinámico */}
      </div>
    </div>
  );
};

export default Home;
