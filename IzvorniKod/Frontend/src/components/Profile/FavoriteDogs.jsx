export default function FavoriteDogs({ dogs }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          FAVORITI
        </h3>
        <button className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-teal-500 transition-colors text-2xl">
          +
        </button>
      </div>

      <div className="flex gap-8 flex-wrap">
        {dogs.map((dog) => (
          <div key={dog.id} className="text-center group cursor-pointer">
            <div className="relative">
              <img
                src={dog.image}
                alt={dog.name}
                className="w-32 h-32 rounded-full object-cover mb-2 border-4 border-gray-100 group-hover:border-teal-200 transition-colors"
              />
            </div>
            <p className="text-sm font-medium text-gray-700">{dog.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
