import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import type { JSX } from "react/jsx-runtime";
import Navbar from "./components/Navbar";
import { useState } from "react";
import ProtectedRoute from "./routes/ProtectedRoute";



function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <>
    <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/tasks" 
          element={
            <ProtectedRoute isAuthenticated= {isAuthenticated}>
              <Tasks/>
            </ProtectedRoute>
            } />
    </Routes>
    </>
  )
}

export default App
