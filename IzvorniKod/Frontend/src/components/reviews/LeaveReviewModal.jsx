import { useState } from "react";
import { useReviews } from "./ReviewsContext";

export default function LeaveReviewModal() {
  const { pendingReview, submitReview } = useReviews();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!pendingReview) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">
          Kako je prošla šetnja?
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Ostavite recenziju za <b>{pendingReview.otherUserName}</b>
        </p>

        {/* Stars */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* komentar */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Napiši komentar (opcionalno)"
          className="w-full border rounded-lg p-2 mb-4 text-sm"
        />

        {/* submit */}
       <div className="flex justify-end">
  <button
    disabled={rating === 0}
    className="px-4 py-2 text-sm rounded-lg bg-teal-500 text-white disabled:opacity-50"
    onClick={() =>
      submitReview({
        walkId: pendingReview.walkId,
        rating,
        comment,
        date: new Date().toISOString(),
      })
    }
  >
    Pošalji
  </button>
</div>
      </div>
    </div>
  );
}
