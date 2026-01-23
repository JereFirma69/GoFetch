export default function Reviews({ reviews }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Recenzije</h3>
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <div
            key={review.id ?? review.Id ?? idx}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-800">
                    {review.reviewerName ?? review.ReviewerName ?? review.dogName ?? "Anonimno"}
                  </span>
                  <div className="flex text-yellow-400">
                    {[...Array(review.rating ?? review.Rating ?? 0)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
                {(review.date ?? review.Date) && (
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(review.date ?? review.Date).toLocaleDateString()}
                  </div>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {review.comment ?? review.Comment ?? review.text ?? ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
