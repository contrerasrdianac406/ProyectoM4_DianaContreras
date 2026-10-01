import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/Authenticator";

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
    <>
      <p>User: {user?.email}</p>
      <button onClick={handleCloseSession}> logout </button>
    </>
  );
};

export default DashboardPage;

