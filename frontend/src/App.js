import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddBook from "./pages/AddBook";
import BookDetails from "./pages/BookDetails";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");

  useEffect(() => {
    console.log("Token changed:", token);  // Debugging
  }, [token]);

  return (
    <Router>
      <Navbar token={token} setToken={setToken} />
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup setToken={setToken} />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute token={token} />}>
          <Route path="/dashboard" element={<Dashboard token={token} />} />
          <Route path="/books/:bookId" element={<BookDetails token={token} />} />
          <Route path="/add-book" element={<AddBook />} />
        </Route>

        {/* Default route */}
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;