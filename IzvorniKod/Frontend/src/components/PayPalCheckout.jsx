import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useEffect } from "react";
import axios from "axios";

export default function PayPalCheckout() {
  const [{ isPending, isResolved }, dispatch] = usePayPalScriptReducer();
  const amount = 50.00;

  // Load the PayPal script when this component mounts
  useEffect(() => {
    dispatch({
      type: "setLoadingStatus",
      value: "pending"
    });
  }, [dispatch]);

  const createOrder = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/payments/create-order`,
      amount,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      }
    );

    return response.data.orderId;
  };

  const onApprove = async (data) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/payments/capture-order`,
      data.orderID,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      }
    );

    alert("✅ Plaćanje uspješno! ✅");
  };

  const onError = (err) => {
    console.error(err);
    alert("❌ Greška pri plaćanju ❌");
  };

  if (isPending) {
    return <div className="text-center py-4">Loading PayPal...</div>;
  }

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
      style={{ layout: "vertical" }}
    />
  );
}
