function ProfileTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'attended', label: 'Attended', icon: '🎤' },
    { id: 'wishlist', label: 'Wishlist', icon: '⭐' },
    { id: 'favorites', label: 'Favorites', icon: '❤️' },
    { id: 'posts', label: 'Posts', icon: '📝' }
  ]

  return (
    <div className="border-b border-gray-800">
      <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-accent text-primary font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-400'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfileTabs