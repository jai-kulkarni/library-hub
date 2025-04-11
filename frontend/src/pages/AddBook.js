import { useState, } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GENRE_OPTIONS = [
  "Fiction",
  "Non-Fiction",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Biography",
  "History",
  "Horror",
  "Romance",
  "Thriller",
  "Self-Help"
];

const AddBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAddBook = async (e) => {
    e.preventDefault();
    setError("");

    const currentYear = new Date().getFullYear();
    if (publishedYear < 1450 || publishedYear > currentYear) {
        setError(`Published year must be between 1450 and ${currentYear}`);
        return;
    }

    try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            setError("User not authenticated");
            return;
        }

        await axios.post(
            "http://127.0.0.1:8000/api/books/",
            { title, author, genre, published_year: publishedYear },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        navigate("/dashboard");
    } catch (error) {
        console.error("Error adding book:", error);
        setError(error.response?.data?.detail || "Failed to add book.");
    }
};

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Add New Book</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleAddBook} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select a Genre</option>
          {GENRE_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Published Year"
          value={publishedYear}
          onChange={(e) => setPublishedYear(e.target.value)}
          required
          className="w-full p-2 border rounded"
          min="1450"
          max={new Date().getFullYear()}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Book
        </button>
      </form>
    </div>
  );
};

export default AddBook;
