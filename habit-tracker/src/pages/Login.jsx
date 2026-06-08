import { useState } from "react";   
function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const response = await fetch(
        "https://habitly-rpdo.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
     window.location.href = "/dashboard";
      alert("Login successful");
      console.log(data);
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (

    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">
          Login
        </h1>
        <div className="space-y-4">
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
            onClick={handleLogin}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-medium transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>

  );

}

export default Login;