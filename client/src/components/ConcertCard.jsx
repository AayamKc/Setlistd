import React from 'react'

const ConcertCard = ({ event }) => {
  const getArtistImage = () => {
    if (event.performers && event.performers.length > 0) {
      const image = event.performers[0].image
      
      // Check if it's a SeatGeek default image and replace with our custom placeholder
      if (image && !isSeatGeekDefaultImage(image)) {
        return image
      }
    }
    return null // Return null to show our custom fallback
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

  return (
    <div className="block bg-secondary border border-primary rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        {getArtistImage() ? (
          <img 
            src={getArtistImage()} 
            alt={getArtistName()}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className={`w-full h-48 bg-cover bg-center flex items-center justify-center ${getArtistImage() ? 'hidden' : 'flex'}`}
          style={{ 
            display: getArtistImage() ? 'none' : 'flex',
            backgroundImage: 'url(/Setlistd.png)'
          }}
        >
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary">{getArtistName()}</h3>
          <p className="text-gray-400">{getTourName()}</p>
        </div>
        
        <div className="text-sm text-gray-400 mb-4">
          <p>{event.venue?.name}</p>
          <p>{event.venue?.city}, {event.venue?.state}</p>
          <p>{formatDate(event.datetime_local)}</p>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex">
            {renderStars(event.averageRating || 0)}
          </div>
          <span className="ml-2 text-gray-400 text-sm">
            {event.averageRating ? event.averageRating.toFixed(1) : 'No ratings'} 
            {event.reviewCount > 0 && ` (${event.reviewCount} reviews)`}
          </span>
        </div>
        
        {event.stats && event.stats.lowest_price && (
          <div className="text-lg font-bold text-primary">
            <span>From ${event.stats.lowest_price}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConcertCard