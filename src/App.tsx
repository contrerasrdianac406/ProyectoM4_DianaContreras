import type { JSX } from "react/jsx-runtime"
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SignUp from "./pages/SignUp";
import RequireAuth from "./components/RequireAuth";

function App(): JSX.Element {
  return <div style={{ padding: "2rem" }}>
    <h1>Auth Demo</h1>
    <Routes>
      <Route path="/" element={<SignUp />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/dashboard' element={
        <RequireAuth>
          <DashboardPage />
        </RequireAuth>
      } />
    </Routes>
  </div>
}
export default App


