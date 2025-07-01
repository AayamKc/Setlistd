import React, { useState, useEffect } from 'react';
import ConcertModal from './ConcertModal';
import { eventsAPI } from '../utils/api';

const ConcertCard = ({ event }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [artistRating, setArtistRating] = useState(null);
  const [loadingArtistRating, setLoadingArtistRating] = useState(true);

  useEffect(() => {
    const fetchArtistRating = async () => {
      if (event.performers && event.performers.length > 0) {
        try {
          const artistName = event.performers[0].name;
          const response = await eventsAPI.getArtistRating(artistName);
          setArtistRating(response.data);
        } catch (error) {
          console.error('Error fetching artist rating:', error);
          setArtistRating({ hasReviews: false });
        } finally {
          setLoadingArtistRating(false);
        }
      } else {
        setLoadingArtistRating(false);
      }
    };

    fetchArtistRating();
  }, [event]);

  const getArtistImage = () => {
    if (event.performers && event.performers.length > 0) {
      const image = event.performers[0].image
      
      // Check if it's a SeatGeek default image and replace with our custom placeholder
      if (image && !isSeatGeekDefaultImage(image)) {
        return image
      }
    }
    return null // Return null to show our cus1tom fallback
  }

  const isSeatGeekDefaultImage = (imageUrl) => {
    if (!imageUrl) return true
    
    // SeatGeek has exactly TWO types of image URLs:
    // 1. DEFAULT/CARTOON: .../[slug]/[id]/huge.jpg (missing extra number)
    // 2. REAL PHOTOS: .../[slug]/[id]/[extra_number]/huge.jpg (has extra number)
    
    // Check if URL matches the default pattern (no extra number before huge.jpg)
    const isStandardPattern = /\/performers-landscape\/[^\/]+\/\d+\/huge\.jpg$/.test(imageUrl)
    const hasExtraNumber = /\/performers-landscape\/[^\/]+\/\d+\/\d+\/huge\.jpg$/.test(imageUrl)
    
    // If it's the standard pattern WITHOUT the extra number, it's a default/cartoon
    return isStandardPattern && !hasExtraNumber
  }

  const getArtistName = () => {
    if (event.performers && event.performers.length > 0) {
      return event.performers[0].name
    }
    return 'Unknown Artist'
  }

  const getTourName = () => {
    // Extract tour name from event title or use the full title
    return event.title || 'Concert'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-primary">★</span>)
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-primary">★</span>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-400">☆</span>)
    }

    return stars
  }

  const renderArtistRating = () => {
    if (loadingArtistRating) {
      return <span className="text-xs text-gray-400">Loading...</span>
    }

    if (!artistRating || !artistRating.hasReviews) {
      return <span className="text-xs text-gray-400">No reviews</span>
    }

    return (
      <div className="flex items-center">
        <div className="flex text-xs">
          {renderStars(artistRating.averageRating)}
        </div>
        <span className="ml-1 text-gray-400 text-xs">
          {artistRating.averageRating.toFixed(1)} ({artistRating.totalReviews})
        </span>
      </div>
    )
  }

  return (
    <>
      <div 
        className="block bg-secondary border border-primary rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer w-full max-w-sm mx-auto aspect-[4/5.5]"
        onClick={() => setIsModalOpen(true)}
      >
      <div className="relative h-3/5">
        {getArtistImage() ? (
          <img 
            src={getArtistImage()} 
            alt={getArtistName()}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full bg-cover bg-center flex items-center justify-center ${getArtistImage() ? 'hidden' : 'flex'}`}
          style={{ 
            display: getArtistImage() ? 'none' : 'flex',
            backgroundImage: 'url(/Setlistd.png)'
          }}
        >
        </div>
      </div>
      
      <div className="p-4 h-2/5 flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-primary truncate">{getArtistName()}</h3>
          <p className="text-gray-400 text-sm truncate" title={getTourName()}>{getTourName()}</p>
        </div>
        
        <div className="text-xs text-gray-400 mb-2">
          <p className="truncate">{event.venue?.name}</p>
          <p>{event.venue?.city}, {event.venue?.state}</p>
          <div className="flex justify-between items-center">
            <p>{formatDate(event.datetime_local)}</p>
            {renderArtistRating()}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex text-xs">
              {renderStars(event.averageRating || 0)}
            </div>
            <span className="ml-1 text-gray-400 text-xs">
              {event.averageRating ? event.averageRating.toFixed(1) : '0'} ({event.reviewCount || 0})
            </span>
          </div>
          {event.stats && event.stats.lowest_price && (
            <div className="text-sm font-bold text-primary">
              ${event.stats.lowest_price}
            </div>
          )}
        </div>
      </div>
    </div>
    <ConcertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} event={event} />
    </>
  )
}

export default ConcertCard