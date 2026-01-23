import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";

export default function PayPalCheckout() {
  const amount = 50.00;

  const createOrder = async () => {
    const response = await axios.post(
      "/api/payments/create-order",
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
      "/api/payments/capture-order",
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

  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "EUR"
      }}
    >
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        style={{ layout: "vertical" }}
      />
    </PayPalScriptProvider>
  );
}
