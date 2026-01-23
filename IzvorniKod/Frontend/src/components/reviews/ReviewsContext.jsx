import { createContext, useContext, useState } from "react";
import { api } from "../../utils/api";

const ReviewsContext = createContext();

export function ReviewsProvider({ children }) {
  const [pendingReview, setPendingReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState(null);

  function requestReview(data, onSuccess = null) {
    setPendingReview(data);
    setOnSuccessCallback(() => onSuccess); // Store callback as function
  }

  async function submitReview({ walkId, rating, comment }) {
    if (!walkId) throw new Error("Missing walkId");
    if (!rating || rating < 1 || rating > 5) throw new Error("Invalid rating");

    setSubmitting(true);
    try {
      // Backend expects: { ocjena, komentar }
      const created = await api.post(`/calendar/rezervacije/${walkId}/recenzija`, {
        ocjena: rating,
        komentar: comment,
      });

      // Keep a local cache in case some UI wants it (optional)
      setReviews((prev) => [...prev, created]);
      setPendingReview(null);
      
      // Call onSuccess callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
        setOnSuccessCallback(null);
      }
      
      return created;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ReviewsContext.Provider
      value={{ pendingReview, requestReview, submitReview, reviews, submitting }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  return useContext(ReviewsContext);
}
