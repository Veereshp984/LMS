const crypto = require("crypto");
const env = require("../../config/env");
const paymentRepo = require("./payment.repository");
const enrollmentService = require("../enrollments/enrollment.service");

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function assertRazorpayConfig() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw createHttpError(
      500,
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }
}

function razorpayAuthHeader() {
  const token = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

async function createOrder(userId, subjectId) {
  assertRazorpayConfig();

  const subject = await paymentRepo.getPublishedSubjectById(subjectId);
  if (!subject) return null;

  const enrolled = await paymentRepo.isEnrolled(userId, subjectId);
  if (enrolled) {
    return {
      already_enrolled: true,
      subject: {
        id: Number(subject.id),
        title: subject.title,
        price_inr: Number(subject.price_inr || 0),
      },
    };
  }

  const amountInr = Number(subject.price_inr || 0);
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    throw createHttpError(400, "Invalid course price");
  }

  const payload = {
    amount: Math.round(amountInr * 100),
    currency: "INR",
    receipt: `sub_${subject.id}_usr_${userId}_${Date.now()}`,
    notes: {
      user_id: String(userId),
      subject_id: String(subject.id),
      subject_title: subject.title,
    },
  };

  const response = await fetch(`${RAZORPAY_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: razorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data?.error?.description || data?.error?.code || "Failed to create payment order";
    throw createHttpError(response.status, msg);
  }

  return {
    key_id: env.RAZORPAY_KEY_ID,
    order: {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
    },
    subject: {
      id: Number(subject.id),
      title: subject.title,
      price_inr: amountInr,
    },
  };
}

function verifySignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

async function fetchOrder(orderId) {
  const response = await fetch(`${RAZORPAY_BASE_URL}/orders/${orderId}`, {
    method: "GET",
    headers: { Authorization: razorpayAuthHeader() },
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data?.error?.description || "Unable to verify Razorpay order";
    throw createHttpError(response.status, msg);
  }
  return data;
}

async function verifyAndEnroll(userId, body) {
  assertRazorpayConfig();
  const orderId = String(body?.razorpay_order_id || "").trim();
  const paymentId = String(body?.razorpay_payment_id || "").trim();
  const signature = String(body?.razorpay_signature || "").trim();
  const subjectId = Number(body?.subject_id);

  if (!orderId || !paymentId || !signature || !subjectId) {
    throw createHttpError(400, "Missing payment verification fields");
  }
  if (!verifySignature(orderId, paymentId, signature)) {
    throw createHttpError(400, "Invalid payment signature");
  }

  const order = await fetchOrder(orderId);
  const noteUserId = Number(order?.notes?.user_id || 0);
  const noteSubjectId = Number(order?.notes?.subject_id || 0);
  if (noteUserId !== Number(userId) || noteSubjectId !== Number(subjectId)) {
    throw createHttpError(400, "Order does not match this user/course");
  }

  const subject = await paymentRepo.getPublishedSubjectById(subjectId);
  if (!subject) throw createHttpError(404, "Subject not found");

  const expectedAmount = Math.round(Number(subject.price_inr || 0) * 100);
  if (Number(order.amount) !== expectedAmount || order.currency !== "INR") {
    throw createHttpError(400, "Order amount mismatch");
  }

  await enrollmentService.enroll(userId, subjectId);

  return {
    paid: true,
    enrolled: true,
    subject_id: subjectId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
  };
}

module.exports = { createOrder, verifyAndEnroll };
