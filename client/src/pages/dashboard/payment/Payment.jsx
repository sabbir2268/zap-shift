import React from "react";


import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_payment_key);

const Payment = () => {
  return (
    <section className="mx-auto max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
          Payment
        </h1>
        <p className="mt-1 text-[var(--text)]/70">
          Complete your parcel payment here.
        </p>
      </div>
      <div>
        <Elements stripe={stripePromise}>
          <PaymentForm></PaymentForm>
        </Elements>
      </div>
    </section>
  );
};

export default Payment;
