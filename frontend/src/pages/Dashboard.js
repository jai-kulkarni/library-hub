import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login"); // Redirect if not logged in
    }
  }, [navigate]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/books/");
        setBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, []);

  // Filter books based on genre or author
  const filteredBooks = books.filter((book) => {
    const filterLowerCase = filter.toLowerCase();
    const genreMatch = book.genre.toLowerCase().includes(filterLowerCase);
    const authorMatch = book.author.toLowerCase().includes(filterLowerCase);
    return genreMatch || authorMatch; // Match either genre or author
  });

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-4">Welcome, {user?.first_name}! 📚</h2>

      <input
        type="text"
        placeholder="Filter by Genre or Author..."
        className="w-full p-2 border rounded mb-4"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      {books.length === 0 ? (
        <p className="text-gray-600 text-center mt-6">📖 No books available. Add some to get started!</p>
      ) : filteredBooks.length === 0 ? (
        <p className="text-gray-600 text-center mt-6">🔍 No books found for the selected filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="block p-4 border rounded-lg shadow hover:shadow-lg">
              <h3 className="text-xl font-bold">{book.title}</h3>
              <p className="text-gray-600">Author: {book.author}</p>
              <p className="text-gray-600">Genre: {book.genre}</p>
              {book.average_rating > 0 ? (
                <p className="text-yellow-500 font-semibold">⭐ {book.average_rating} / 5</p>
              ) : (
                <p className="text-gray-500">No Rating</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
