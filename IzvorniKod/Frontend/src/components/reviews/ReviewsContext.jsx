import { createContext, useContext, useState } from "react";

const ReviewsContext = createContext();

export function ReviewsProvider({ children }) {
  const [pendingReview, setPendingReview] = useState(null);
  const [reviews, setReviews] = useState([]);

  function requestReview(data) {
    setPendingReview(data);
  }

  function submitReview(review) {
    setReviews((prev) => [...prev, review]);
    setPendingReview(null);
  }

  return (
    <ReviewsContext.Provider
      value={{ pendingReview, requestReview, submitReview, reviews }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  return useContext(ReviewsContext);
}
