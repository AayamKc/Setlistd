
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import { eventsAPI } from '../utils/api';
import confetti from 'canvas-confetti';
import Toast from './Toast';

const ConcertModal = ({ isOpen, onClose, event }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [existingReviews, setExistingReviews] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingRating, setEditingRating] = useState(0);
  const [editingText, setEditingText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [hoveredReviewId, setHoveredReviewId] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Check if concert has already happened
  const isEventInPast = () => {
    if (!event || !event.datetime_local) return false;
    const eventDate = new Date(event.datetime_local);
    const currentDate = new Date();
    return eventDate <= currentDate;
  };

  useEffect(() => {
    console.log('ConcertModal useEffect - event data:', event);
    console.log('ConcertModal useEffect - seatgeekId:', event?.seatgeekId);
    
    if (isOpen && event && event.seatgeekId) {
      const fetchReviews = async () => {
        try {
          console.log('Fetching reviews for seatgeekId:', event.seatgeekId);
          const response = await eventsAPI.getEventReviews(event.seatgeekId);
          console.log('Reviews fetched:', response.data);
          setExistingReviews(response.data);
          
          // Check if current user has already reviewed
          if (user && response.data.length > 0) {
            const userReview = response.data.find(review => review.userId === user.id);
            setUserHasReviewed(!!userReview);
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      };
      fetchReviews();
    } else {
      console.log('Not fetching reviews - missing data:', { isOpen, hasEvent: !!event, seatgeekId: event?.seatgeekId });
    }
  }, [isOpen, event, user]);

  if (!isOpen) return null;

  const getArtistImage = () => {
    if (event.performers && event.performers.length > 0 && event.performers[0].image) {
      return event.performers[0].image;
    }
    return '/Setlistd.png'; 
  };

  const getArtistName = () => {
    return event.performers && event.performers.length > 0 ? event.performers[0].name : 'Unknown Artist';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit - event data:', event);
    console.log('handleSubmit - seatgeekId:', event?.seatgeekId);
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Validate rating
    if (rating === 0) {
      setToast({ message: 'Please select a rating', type: 'error' });
      return;
    }
    
    if (!event.seatgeekId) {
      console.error('No seatgeekId found in event:', event);
      setToast({ message: 'Unable to submit review - missing event ID', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    console.log('Submitting review for seatgeekId:', event.seatgeekId);
    
    try {
      await eventsAPI.submitReview(event.seatgeekId, { rating, reviewText: review });
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Reset form
      setRating(0);
      setReview('');
      
      // Mark that user has reviewed
      setUserHasReviewed(true);
      
      // Hide success message after 3 seconds and refresh the page
      setTimeout(() => {
        setShowSuccessMessage(false);
        onClose();
        // Refresh the page to update ratings
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      let errorMessage = 'Failed to submit review';
      
      if (error.response?.status === 400 && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = 'Review failed to submit: server issue';
      }
      
      setToast({ message: errorMessage, type: 'error' });
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditingRating(review.rating);
    setEditingText(review.reviewText);
  };

  const handleUpdateReview = async (reviewId) => {
    if (editingRating === 0) {
      setToast({ message: 'Please select a rating', type: 'error' });
      return;
    }

    try {
      console.log('Updating review:', { eventId: event.seatgeekId, reviewId, rating: editingRating });
      await eventsAPI.updateReview(event.seatgeekId, reviewId, {
        rating: editingRating,
        reviewText: editingText
      });
      
      // Refresh reviews
      const response = await eventsAPI.getEventReviews(event.seatgeekId);
      setExistingReviews(response.data);
      
      // Clear editing state
      setEditingReviewId(null);
      setEditingRating(0);
      setEditingText('');
      
      // Refresh page to update ratings
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error updating review:', error);
      setToast({ message: 'Failed to update review', type: 'error' });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      console.log('Deleting review:', { eventId: event.seatgeekId, reviewId });
      await eventsAPI.deleteReview(event.seatgeekId, reviewId);
      
      // Refresh reviews
      const response = await eventsAPI.getEventReviews(event.seatgeekId);
      setExistingReviews(response.data);
      
      // Check if user still has a review after deletion
      if (user && response.data.length > 0) {
        const userReview = response.data.find(review => review.userId === user.id);
        setUserHasReviewed(!!userReview);
      } else {
        setUserHasReviewed(false);
      }
      
      // Close confirmation dialog
      setShowDeleteConfirm(null);
      
      // Refresh page to update ratings
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error deleting review:', error);
      setToast({ message: 'Failed to delete review', type: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingRating(0);
    setEditingText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm" onClick={onClose} />
      
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center z-[70] bg-black bg-opacity-50">
          <div className="bg-gray-800 text-white px-8 py-6 rounded-lg shadow-2xl text-center z-[80]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg font-semibold">Submitting Review...</div>
          </div>
        </div>
      )}
      
      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-60">
          <div className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-2xl text-center">
            <div className="text-2xl font-bold mb-2">🎉 Review Submitted! 🎉</div>
            <div className="text-lg">Thank you for your feedback!</div>
          </div>
        </div>
      )}
      
      <div className="relative bg-gray-900 rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-primary">{getArtistName()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <img src={getArtistImage()} alt={getArtistName()} className="w-full h-64 object-cover rounded-lg mb-6" />
          {!isEventInPast() && !userHasReviewed && (
            <div className="bg-yellow-200 bg-opacity-20 border border-yellow-300 text-yellow-200 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm font-semibold">This concert has not happened yet.</p>
              <p className="text-sm">Reviews can only be submitted after the concert has taken place.</p>
            </div>
          )}
          {!userHasReviewed && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-lg font-semibold text-white block mb-2">Your Rating</label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onClick={() => isEventInPast() && setRating(star)}
                    className={`h-8 w-8 ${isEventInPast() ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${rating >= star ? 'text-primary' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="review" className="text-lg font-semibold text-white block mb-2">Your Review</label>
              <textarea
                id="review"
                rows="4"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="What did you think of the show?"
                disabled={!isEventInPast()}
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="py-3 px-6 bg-primary text-black rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                disabled={!isEventInPast()}
              >
                Submit Review
              </button>
            </div>
          </form>
          )}

          <div className="mt-8">
            <h3 className="text-xl font-bold text-primary mb-4">Reviews</h3>
            {existingReviews.length === 0 ? (
              <p className="text-gray-400">No reviews yet. Be the first to leave one!</p>
            ) : (
              <div className="space-y-4">
                {[...existingReviews]
                  .sort((a, b) => {
                    // Put current user's review at the top
                    if (user && a.userId === user.id) return -1;
                    if (user && b.userId === user.id) return 1;
                    // Maintain original order for other reviews
                    return 0;
                  })
                  .map((rev) => (
                  <div 
                    key={rev._id} 
                    className="bg-gray-800 p-4 rounded-lg relative"
                    onMouseEnter={() => setHoveredReviewId(rev._id)}
                    onMouseLeave={() => setHoveredReviewId(null)}
                  >
                    {editingReviewId === rev._id ? (
                      // Edit mode
                      <div>
                        <div className="flex items-center mb-4">
                          <p className="font-semibold text-white">{rev.username || 'Anonymous User'}</p>
                          <div className="ml-auto flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditingRating(star)}
                                className={`text-2xl ${editingRating >= star ? 'text-primary' : 'text-gray-600'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white rounded-lg resize-none"
                          rows="3"
                          placeholder="Share your thoughts..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleUpdateReview(rev._id)}
                            className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{rev.username || 'Anonymous User'}</p>
                            {/* Edit/Delete buttons - show on hover if user owns the review */}
                            {user && rev.userId === user.id && hoveredReviewId === rev._id && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditReview(rev)}
                                  className="p-1 text-gray-400 hover:text-white transition-colors"
                                  title="Edit review"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(rev._id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete review"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="ml-auto text-sm text-gray-400">Rating: {rev.rating}/5</p>
                        </div>
                        <p className="text-gray-300">{rev.reviewText}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-gray-900 p-6 rounded-xl max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Review</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete your review? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteReview(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ConcertModal;
