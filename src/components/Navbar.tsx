import { Link } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";

interface NavbarProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

function Navbar({ isAuthenticated, setIsAuthenticated }: NavbarProps): JSX.Element {
  return (
    <nav>
      <Link to="/">Login</Link>
      {" | "}
      <Link to="/register">Registrate aquí</Link>
      {" | "}
      <Link to="/tasks">Tareas</Link>
      {" | "}
      <button onClick={() => setIsAuthenticated(!isAuthenticated)}>
        {isAuthenticated ? "Cerrar sesión" : "Iniciar sesión"}
      </button>
    </nav>
  );
}

export default Navbar;