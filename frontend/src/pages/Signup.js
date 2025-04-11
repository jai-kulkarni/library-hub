import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
      e.preventDefault();
      const response = await registerUser(email, firstName, lastName, password);
      if (response) navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Signup</h2>
      <form onSubmit={handleSubmit} className="w-1/3">
            <input type="text" placeholder="First Name" className="w-full p-2 mb-2 border" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <input type="text" placeholder="Last Name" className="w-full p-2 mb-2 border" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <input type="email" placeholder="Email" className="w-full p-2 mb-2 border" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="w-full p-2 mb-2 border" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="bg-blue-500 text-white p-2 w-full">Sign Up</button>
        </form>
    </div>
  );
};

export default Signup;