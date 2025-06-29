
import React, { useState } from 'react';

const ConcertModal = ({ isOpen, onClose, event }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  if (!isOpen) return null;

  const getArtistImage = () => {
    if (event.performers && event.performers.length > 0) {
      const image = event.performers[0].image;
      if (image && !isSeatGeekDefaultImage(image)) {
        return image;
      }
    }
    return '/placeholder-artist.jpg';
  };

  const isSeatGeekDefaultImage = (imageUrl) => {
    if (!imageUrl) return true;
    const isStandardPattern = /\/performers-landscape\/[^\/]+\/\d+\/huge\.jpg$/.test(imageUrl);
    const hasExtraNumber = /\/performers-landscape\/[^\/]+\/\d+\/\d+\/huge\.jpg$/.test(imageUrl);
    return isStandardPattern && !hasExtraNumber;
  };

  const getArtistName = () => {
    return event.performers && event.performers.length > 0 ? event.performers[0].name : 'Unknown Artist';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle review and rating submission logic here
    console.log({ rating, review });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm" onClick={onClose} />
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-lg font-semibold text-white block mb-2">Your Rating</label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onClick={() => setRating(star)}
                    className={`h-8 w-8 cursor-pointer ${rating >= star ? 'text-primary' : 'text-gray-600'}`}
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
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="What did you think of the show?"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="py-3 px-6 bg-primary text-black rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConcertModal;
