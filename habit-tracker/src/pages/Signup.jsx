import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate=useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
  try {
    const response = await fetch(
      "https://habitly-rpdo.onrender.com/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      }
    );
    const data = await response.json();
    alert(data.message);
    console.log(data);
  } catch (err) {
    console.log(err);
    alert("Signup failed");
  }
navigate("/login");
};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Create Account
        </h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
          />

          <button
            onClick={handleSignup}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-medium transition"
          > 
            Sign Up
          </button>

        </div>

      </div>

    </div>

  );

}

export default Signup;