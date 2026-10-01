import { useState } from "react";
import { useAuth } from "../features/auth/Authenticator";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../features/auth/authErrors";

const LoginPage = () => {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const handleWithInGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <>
      <section>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignIn}>Login</button>
      </section>

      <section>
        <button onClick={handleWithInGoogle}>login with Google</button>
      </section>

      <section>{error && <p style={{ color: "red" }}>{error}</p>}</section>

      <section>
        <Link to={"/"}>Register</Link>
      </section>
    </>
  );
};

export default LoginPage;
