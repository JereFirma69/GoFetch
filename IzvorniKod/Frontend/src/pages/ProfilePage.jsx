import { useState } from 'react';

function ProfilePage() {
  const [user] = useState({ name: "Guest User", email: "guest@pawpal.com" });

  const favoriteDogs = [
    { id: 1, name: "Max", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop" },
    { id: 2, name: "Luna", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop" },
    { id: 3, name: "Roki", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop" }
  ];

  const addedDogs = [
    { 
      id: 1, 
      name: "Rex", 
      breed: "German Shepherd",
      image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=150&h=150&fit=crop"
    },
    { 
      id: 2, 
      name: "Bela", 
      breed: "Golden Retriever",
      image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=150&h=150&fit=crop"
    }
  ];

  const reviews = [
    {
      id: 1,
      dogName: "Rex",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt."
    },
    {
      id: 2,
      dogName: "Max",
      rating: 5,
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl"></span>
            </div>
            <span className="text-xl font-bold text-gray-800">PawPal</span>
          </div>
          <nav className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              Dashboard
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              Calendar
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              Messages
            </button>
            <button className="px-4 py-2 text-teal-600 font-medium rounded-lg bg-teal-50">
              Profile
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=120&background=14b8a6&color=fff&bold=true`}
                  alt="Profile" 
                  className="w-28 h-28 rounded-full mb-4 border-4 border-teal-100"
                />
                <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                
                <button 
                  className="w-full py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-2 font-medium"
                >
                  Edit Profile
                </button>
                <button 
                  className="w-full py-2.5 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium"
                >
                  Log Out
                </button>
              </div>
            </div>

            {/* Added Dogs Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Dodaj psa</h3>
                <button className="w-9 h-9 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-teal-500 transition-colors text-xl">
                  +
                </button>
              </div>
              
              <div className="space-y-3">
                {addedDogs.map(dog => (
                  <div key={dog.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <img 
                      src={dog.image} 
                      alt={dog.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{dog.name}</p>
                      <p className="text-xs text-gray-500 truncate">{dog.breed}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Favorites Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-red-500 text-xl"></span>
                  FAVORITI
                </h3>
                <button className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-teal-500 transition-colors text-2xl">
                  +
                </button>
              </div>
              
              <div className="flex gap-8">
                {favoriteDogs.map(dog => (
                  <div key={dog.id} className="text-center group cursor-pointer">
                    <div className="relative">
                      <img 
                        src={dog.image}
                        alt={dog.name}
                        className="w-32 h-32 rounded-full object-cover mb-2 border-4 border-gray-100 group-hover:border-teal-200 transition-colors"
                      />
                      <div className="absolute top-1 right-1 text-xl">
                        
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{dog.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Recenzije</h3>
              
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-800">{review.dogName}</span>
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <span key={i}></span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;