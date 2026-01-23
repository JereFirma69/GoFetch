import { useState, useEffect } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { api } from "../../utils/api";

export default function WalkerSubscription({ isWalker }) {
  const [pricing, setPricing] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch pricing (public endpoint)
        const pricingData = await api.get("/payments/membership-pricing");
        setPricing(pricingData);

        // Fetch subscription status if user is a walker
        if (isWalker) {
          try {
            const subData = await api.get("/payments/my-subscription");
            setSubscription(subData);
          } catch (e) {
            console.error("Failed to fetch subscription:", e);
          }
        }
      } catch (e) {
        console.error("Failed to fetch pricing:", e);
        setError("Unable to load pricing");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isWalker]);

  const refreshSubscription = async () => {
    try {
      const subData = await api.get("/payments/my-subscription");
      setSubscription(subData);
    } catch (e) {
      console.error("Failed to refresh subscription:", e);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!isWalker) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🐕 Walker Membership</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You must register as a walker to subscribe to a membership.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Go to "Edit Profile" and enable the "Become a Walker" option.
          </p>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = subscription?.hasActiveSubscription;
  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">🐕 Walker Membership</h3>

      {/* Subscription Status */}
      {hasActiveSubscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <p className="font-medium text-green-800">Active Subscription</p>
              <p className="text-sm text-green-600">
                Plan: {subscription.plan === "yearly" ? "Yearly" : "Monthly"}
              </p>
              {expiryDate && (
                <p className="text-sm text-green-600">
                  Valid until: {expiryDate.toLocaleDateString("en-US")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Plan */}
        <div
          onClick={() => setSelectedPlan("monthly")}
          className={`cursor-pointer border-2 rounded-xl p-5 transition-all ${
            selectedPlan === "monthly"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900">Monthly</h4>
              <p className="text-sm text-gray-500">Flexible option</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "monthly"
                  ? "border-teal-500 bg-teal-500"
                  : "border-gray-300"
              }`}
            >
              {selectedPlan === "monthly" && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {pricing?.monthlyPrice?.toFixed(2)}
            </span>
            <span className="text-gray-500 ml-1">{pricing?.currency}/mo</span>
          </div>
        </div>

        {/* Yearly Plan */}
        <div
          onClick={() => setSelectedPlan("yearly")}
          className={`cursor-pointer border-2 rounded-xl p-5 transition-all relative ${
            selectedPlan === "yearly"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {pricing && pricing.monthlyPrice * 12 > pricing.yearlyPrice && (
            <div className="absolute -top-3 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Save {Math.round((1 - pricing.yearlyPrice / (pricing.monthlyPrice * 12)) * 100)}%
            </div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900">Yearly</h4>
              <p className="text-sm text-gray-500">Best value</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "yearly"
                  ? "border-teal-500 bg-teal-500"
                  : "border-gray-300"
              }`}
            >
              {selectedPlan === "yearly" && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">
              {pricing?.yearlyPrice?.toFixed(2)}
            </span>
            <span className="text-gray-500 ml-1">{pricing?.currency}/yr</span>
          </div>
          {pricing && (
            <p className="text-xs text-gray-400 mt-1">
              ({(pricing.yearlyPrice / 12).toFixed(2)} {pricing.currency}/mo)
            </p>
          )}
        </div>
      </div>

      {/* Pay Button */}
      <div className="max-w-md">
        <p className="text-sm text-gray-500 mb-3">
          {hasActiveSubscription
            ? "Extend or change your subscription:"
            : "Select a plan and pay via PayPal:"}
        </p>

        {processing ? (
          <div className="text-center py-4 text-gray-500">
            Processing payment...
          </div>
        ) : (
          <PayPalButtons
            key={selectedPlan}
            style={{ layout: "vertical" }}
            createOrder={async () => {
              setProcessing(true);
              setError(null);
              try {
                const response = await api.post("/payments/subscribe", {
                  plan: selectedPlan,
                });
                return response.orderId;
              } catch (e) {
                setProcessing(false);
                setError("Error creating order");
                throw e;
              }
            }}
            onApprove={async (data) => {
              try {
                await api.post(`/payments/capture-subscription/${data.orderID}`, {
                  plan: selectedPlan,
                });
                await refreshSubscription();
                alert("✅ Subscription activated successfully!");
              } catch (e) {
                console.error("Capture failed:", e);
                setError("Error activating subscription");
              } finally {
                setProcessing(false);
              }
            }}
            onCancel={() => {
              setProcessing(false);
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              setError("Payment error");
              setProcessing(false);
            }}
          />
        )}

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
