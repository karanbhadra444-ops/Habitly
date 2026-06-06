import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function App() {

  const token = localStorage.getItem("token");
  return (
    <Routes>
      <Route
        path="/"
        element={
          token
            ? <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/signup"
        element={<Signup />}
      />
      <Route
        path="/dashboard"
        element={
          token
            ? <Dashboard />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );

}

export default App;