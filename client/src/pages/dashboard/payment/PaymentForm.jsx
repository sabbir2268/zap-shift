import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../../hooks/useAxios";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0B0B0B",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
    },
  },
};

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const {id} = useParams();  
  const axiosSecure = useAxios()

  const { isPending, data: parcelInfo } = useQuery({
    queryKey: ['parcels', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/parcels/${id}`);
      return res;
    }

  })
  
  if(isPending){
    return "...loading"
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card || card == null) {
      return;
    }

    const { error } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      setError(error.message)
    } else {
      setError('')
    }
  };


  return (
    <div className="mt-6 bg-white rounded-3xl border border-gray-200 p-5 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center">
          <CreditCard size={21} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Card Details
          </h2>
          <p className="text-sm text-[var(--text)]">
            Enter your card information securely.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card Element */}
        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
          Card Information <span className="text-red-500 ml-1">*</span>
        </label>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition focus-within:border-[var(--foreground)] focus-within:ring-2 focus-within:ring-[var(--secondary)]">
          <CardElement options={cardElementOptions} />
        </div>

        {/* Secure Notice */}
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--secondary)]/20 px-4 py-3">
          <ShieldCheck size={18} className="shrink-0 text-[var(--foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">
            Your payment information is encrypted and 100% secure.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!stripe}
          className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--foreground)] px-6 py-3.5 text-lg font-bold text-[var(--secondary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(3,55,61,0.35)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/20 skew-x-12 transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative z-10">Pay ৳ {parcelInfo?.totalCost}</span>
          <Wallet size={18} className="relative z-10" />
        </button>

        {
          error && <p className="text-red-400">{error}</p>
        }
      </form>
    </div>
  );
};

export default PaymentForm;