import { useState } from "react";
import { X, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { submitReview } from "../services/api";
import { RETURN_REASONS } from "../types";
import type { Product, ReturnReason } from "../types";

interface Props {
  product: Product;
  orderId?: number;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function ReviewModal({ product, orderId = 0, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [hasReturn, setHasReturn] = useState(false);
  const [returnReason, setReturnReason] = useState<ReturnReason | "">("");
  const [returnDetails, setReturnDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!title.trim()) { setError("Please add a review title."); return; }
    if (!reviewText.trim()) { setError("Please write your review."); return; }
    if (hasReturn && !returnReason) { setError("Please select a return reason."); return; }

    setError("");
    setSubmitting(true);
    try {
      await submitReview({
        order_id: orderId,
        customer_id: 0,          // anonymous in this demo
        product_id: product.id,
        rating,
        title: title.trim(),
        review_text: reviewText.trim(),
        has_return_request: hasReturn,
        return_reason: hasReturn ? (returnReason as ReturnReason) : null,
        return_reason_details: hasReturn && returnDetails.trim() ? returnDetails.trim() : null,
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Write a Review</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
            <p className="text-gray-500 mb-2">Your review has been submitted successfully.</p>
            {hasReturn && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                Your return request has been received and is being reviewed. We'll be in touch shortly.
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  </button>
                ))}
                {(hoverRating || rating) > 0 && (
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Review Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience in a few words"
                maxLength={100}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Review <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell others about your experience with this product..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none"
              />
            </div>

            {/* Return Request Toggle */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    Request a Return / Report an Issue
                  </span>
                </div>
                <button
                  onClick={() => { setHasReturn(!hasReturn); setReturnReason(""); setReturnDetails(""); }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    hasReturn ? "bg-rose-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      hasReturn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {hasReturn && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Return Reason <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                    >
                      <option value="">Select a reason...</option>
                      {RETURN_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Additional Details (optional)
                    </label>
                    <textarea
                      value={returnDetails}
                      onChange={(e) => setReturnDetails(e.target.value)}
                      placeholder="Please describe the issue in more detail to help us process your return faster..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none"
                    />
                  </div>
                  <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                    A return request will be submitted along with your review. Our team will contact you within 1–2 business days.
                  </p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2.5">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
