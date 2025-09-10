import React from "react";
import User from "../models/User";
import "./UserDetail.css";

interface UserDetailProps {
  user: User;
}


const UserDetail: React.FC<UserDetailProps> = ({ user }) => {

  const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
  ];
  const meals = ["Breakfast", "Lunch", "Snack", "Dinner"];

  return (
    <div className="user-detail">
      <div className="user-detail-header">
        <h2>{user.username}</h2>
        <div className="actions">
          <button className="action-btn">Crear</button>
          <button className="action-btn">Editar</button>
          <button className="action-btn">Borrar</button>
        </div>
      </div>
      <div className="user-detail-content">
        <p>ID: {user.id}</p>
        <p>Información detallada del usuario aquí...</p>

        {/* Tabla de días y comidas */}
        <div className="meal-plan">
          <table className="meal-plan-table">
            <thead>
              <tr>
                <th>Meal</th>
                {days.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal}>
                  <td>{meal}</td>
                  {days.map((day) => (
                    <td key={`${day}-${meal}`}></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>



      </div>
    </div>
  );
};

export default UserDetail;
