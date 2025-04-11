import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ token, setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setToken("");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <Link to="/" className="text-lg font-bold">Library Hub</Link>
      
      <div className="flex space-x-4">
        {token && (
          <Link to="/add-book" className="hover:bg-blue-500 px-3 py-1 rounded">
            Add Book
          </Link>
        )}
        {token ? (
          <button 
            onClick={handleLogout} 
            className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="hover:bg-blue-500 px-3 py-1 rounded">Login</Link>
            <Link to="/signup" className="hover:bg-blue-500 px-3 py-1 rounded">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
