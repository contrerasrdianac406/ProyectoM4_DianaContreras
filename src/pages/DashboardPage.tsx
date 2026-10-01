import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/Authenticator";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleCloseSession = async () => {
    try {
      await logout();
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <h1>Mi Dashboard</h1>
        <p className="subtitle">Bienvenido a tu panel de tareas</p>

        <div className="user-info">
          <div className="user-icon">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <p className="user-email">{user?.email}</p>
        </div>

        <button className="btn-logout" onClick={handleCloseSession}>
          Cerrar sesion
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;

