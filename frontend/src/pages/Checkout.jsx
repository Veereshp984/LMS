import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/Layout/AppShell";
import apiClient from "../lib/apiClient";
import useAuthStore from "../store/authStore";

function formatInr(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const amountText = useMemo(() => formatInr(subject?.price_inr), [subject?.price_inr]);

  useEffect(() => {
    let active = true;
    apiClient
      .get(`/subjects/${subjectId}`)
      .then((res) => {
        if (!active) return;
        setSubject(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.response?.data?.message || "Failed to load course");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [subjectId]);

  async function startPayment() {
    if (paying) return;
    setError("");
    setPaying(true);
    let checkoutOpened = false;
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        setError("Unable to load Razorpay checkout. Please try again.");
        return;
      }

      const orderRes = await apiClient.post("/payments/orders", { subject_id: Number(subjectId) });
      const orderData = orderRes.data;

      if (orderData?.already_enrolled) {
        navigate(`/subjects/${subjectId}`, { replace: true });
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "LearnSphere",
        description: `Enrollment: ${orderData.subject.title}`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response) => {
          try {
            await apiClient.post("/payments/verify", {
              subject_id: Number(subjectId),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/subjects/${subjectId}`, { replace: true });
          } catch (err) {
            setError(err?.response?.data?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp?.error?.description || "Payment failed");
        setPaying(false);
      });
      checkoutOpened = true;
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to initiate payment");
    } finally {
      if (!checkoutOpened) setPaying(false);
    }
  }

  if (loading) {
    return <AppShell>Loading checkout...</AppShell>;
  }

  if (!subject) {
    return <AppShell>{error || "Course not found"}</AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Secure Checkout</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{subject.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subject.description || "Course enrollment payment"}</p>

        <div className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-600">Amount payable</span>
          <span className="text-xl font-bold text-slate-900">{amountText}</span>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back
          </button>
          <button
            type="button"
            onClick={startPayment}
            disabled={paying}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {paying ? "Processing..." : `Pay ${amountText}`}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
