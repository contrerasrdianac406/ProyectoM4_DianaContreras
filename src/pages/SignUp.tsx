import { useState } from "react";
import { useAuth } from "../features/auth/Authenticator";
import { Link } from "react-router-dom";
import { getAuthErrorMessage } from "../features/auth/authErrors";

const SignUp = () => {
  const { signInWithGoogle, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      await signUp(email, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const handleWithGoogle = async () => {
    try {
      await signInWithGoogle();
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
        <button onClick={handleRegister}>Register</button>
      </section>

      <section>
        <button onClick={handleWithGoogle}>Register with Google</button>
      </section>

      <section>{error && <p style={{ color: "red" }}>{error}</p>}</section>

      <section>
        <Link to={"/login"}>Login</Link>
      </section>
    </>
  );
};

export default SignUp;
