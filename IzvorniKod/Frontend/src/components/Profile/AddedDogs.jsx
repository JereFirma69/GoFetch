export default function AddedDogs({ dogs }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Dodaj psa</h3>
        <button className="w-9 h-9 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:border-teal-500 transition-colors text-xl">
          +
        </button>
      </div>

      <div className="space-y-3">
        {dogs.map((dog) => (
          <div
            key={dog.id}
            className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer"
          >
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
  );
}
