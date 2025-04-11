import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BookDetails = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [bookResponse, reviewsResponse] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/books/${bookId}/`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/books/${bookId}/reviews/`, { headers }),
      ]);
      
      setBook(bookResponse.data);
      setReviews(reviewsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchData();
    }
  }, [bookId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!bookId || !user) return;

    try {
      const token = localStorage.getItem("auth_token");
      const reviewData = { book: bookId, rating: Number(rating), comment: comment.trim(), user: user.id };

      await axios.post(`http://127.0.0.1:8000/api/books/${bookId}/reviews/`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComment("");
      fetchData();
    } catch (error) {
      console.error("Failed to add review:", error.response ? error.response.data : error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.delete(`http://127.0.0.1:8000/api/books/${bookId}/reviews/${reviewId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (error) {
      console.error("Failed to delete review:", error.response ? error.response.data : error);
    }
  };

  const handleEditReview = (reviewId, existingComment, existingRating) => {
    setEditReviewId(reviewId);
    setEditComment(existingComment);
    setEditRating(existingRating);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      const updatedReview = { rating: Number(editRating), comment: editComment.trim() };

      await axios.put(`http://127.0.0.1:8000/api/books/${bookId}/reviews/${editReviewId}/`, updatedReview, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error("Failed to update review:", error.response ? error.response.data : error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  const paginateReviews = (reviews) => {
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    return reviews.slice(indexOfFirstReview, indexOfLastReview);
  };

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentReviews = paginateReviews(reviews);

  if (!book) return <p className="text-center text-xl mt-10">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">{book.title}</h2>
          <p className="text-lg text-gray-600">by <span className="font-semibold">{book.author}</span></p>
          <p className="text-lg text-gray-600"><strong>Genre:</strong> {book.genre}</p>
          <p className="text-lg text-gray-600"><strong>Published:</strong> {book.published_year}</p>
          <p className="text-lg text-gray-600 mt-4">
            <strong>Average Rating: </strong>
            {book.reviews.length === 0 ? "No Ratings" : `${book.average_rating} ⭐ (${book.reviews.length} reviews)`}
          </p>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleReviewSubmit} className="bg-white p-6 shadow-lg rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Add a Review</h3>
            <div className="flex space-x-2 my-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <span key={num} onClick={() => setRating(num)} className={`cursor-pointer text-2xl ${num <= rating ? "text-yellow-500" : "text-gray-300"}`}>
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Write a comment..."
              value={comment}
              required
              onChange={(e) => setComment(e.target.value)}
              className="block w-full px-4 py-2 mt-2 border rounded-lg focus:ring focus:ring-indigo-300"
            ></textarea>
            <button type="submit" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition">Submit Review</button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-3xl font-semibold text-gray-900">Reviews</h3>
        {currentReviews.length > 0 ? (
          currentReviews.map((review, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-xl font-semibold text-gray-900">{review.user.first_name} {review.user.last_name}</p>
              <p className="text-xl font-semibold text-gray-900 flex items-center space-x-4">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className={`text-yellow-500 ${index < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                ))}
                <span className="text-sm text-gray-500">{formatTimestamp(review.timestamp)}</span>
              </p>
              <p className="text-gray-700 mt-2">{review.comment}</p>
              {user.id === review.user.id && (
                <div className="flex space-x-4 mt-2">
                  <button onClick={() => handleEditReview(review.id, review.comment, review.rating)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => handleDeleteReview(review.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              )}
              {isEditing && editReviewId === review.id && (
                <form onSubmit={handleSaveEdit} className="mt-4 bg-white p-6 shadow-lg rounded-lg">
                  <h3 className="text-2xl font-semibold mb-4">Edit Review</h3>
                  <div className="flex space-x-2 my-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <span key={num} onClick={() => setEditRating(num)} className={`cursor-pointer text-2xl ${num <= editRating ? "text-yellow-500" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    placeholder="Update your comment..."
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="block w-full px-4 py-2 mt-2 border rounded-lg focus:ring focus:ring-indigo-300"
                  ></textarea>
                  <button type="submit" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition">Save Changes</button>
                </form>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-4">No reviews yet. Be the first to review this book!</p>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-4">
            <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Previous</button>
            <span className="text-lg text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
