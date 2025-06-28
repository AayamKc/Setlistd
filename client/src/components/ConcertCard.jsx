import React from 'react'

const ConcertCard = ({ event }) => {
  const getArtistImage = () => {
    if (event.performers && event.performers.length > 0) {
      return event.performers[0].image || '/placeholder-artist.jpg'
    }
    return '/placeholder-artist.jpg'
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
      stars.push(<span key={i} className="star full">★</span>)
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>)
    }

    return stars
  }

  return (
    <div className="concert-card">
      <div className="card-image">
        <img 
          src={getArtistImage()} 
          alt={getArtistName()}
          onError={(e) => {
            e.target.src = '/placeholder-artist.jpg'
          }}
        />
      </div>
      
      <div className="card-content">
        <div className="artist-info">
          <h3 className="artist-name">{getArtistName()}</h3>
          <p className="tour-name">{getTourName()}</p>
        </div>
        
        <div className="event-details">
          <p className="venue">{event.venue?.name}</p>
          <p className="location">{event.venue?.city}, {event.venue?.state}</p>
          <p className="date">{formatDate(event.datetime_local)}</p>
        </div>
        
        <div className="rating-section">
          <div className="stars">
            {renderStars(event.averageRating || 0)}
          </div>
          <span className="rating-text">
            {event.averageRating ? event.averageRating.toFixed(1) : 'No ratings'} 
            {event.reviewCount > 0 && ` (${event.reviewCount} reviews)`}
          </span>
        </div>
        
        {event.stats && event.stats.lowest_price && (
          <div className="price-info">
            <span className="price">From ${event.stats.lowest_price}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConcertCard