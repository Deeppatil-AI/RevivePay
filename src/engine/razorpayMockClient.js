/**
 * Razorpay Test-Mode API Dispatcher & Simulator
 * Mirrors Razorpay's API responses for Payment Links, Orders, Subscriptions, and UPI Intent URLs.
 */

export const RazorpayClient = {
  // Simulates POST /v1/payment_links
  createPaymentLink: async (params) => {
    const linkId = `plink_${Math.random().toString(36).substring(2, 10)}`;
    const shortUrl = `https://rzp.io/i/${linkId.substring(6)}`;
    
    // Simulate slight network latency
    await new Promise((r) => setTimeout(r, 80));

    return {
      id: linkId,
      entity: "payment_link",
      amount: Math.round(params.amount * 100), // in paise
      currency: "INR",
      accept_partial: false,
      description: params.description || "Subscription Renewal via RevivePay Sentinel",
      customer: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone
      },
      notify: {
        sms: true,
        email: true,
        whatsapp: true
      },
      reminder_enable: true,
      short_url: shortUrl,
      upi_intent_url: `upi://pay?pa=razorpay.revive@icici&pn=${encodeURIComponent(params.merchant)}&am=${params.amount}&cu=INR&tr=${linkId}`,
      status: "created",
      created_at: Math.floor(Date.now() / 1000)
    };
  },

  // Simulates POST /v1/orders
  createOrder: async (amount, currency = "INR", receipt = "rec_revive_01") => {
    const orderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    return {
      id: orderId,
      entity: "order",
      amount: Math.round(amount * 100),
      amount_paid: 0,
      amount_due: Math.round(amount * 100),
      currency,
      receipt,
      status: "created",
      attempts: 0
    };
  },

  // Simulates POST /v1/subscriptions/:id/retry
  triggerMandateRetry: async (mandateId, scheduledSlot) => {
    await new Promise((r) => setTimeout(r, 60));
    return {
      mandate_id: mandateId,
      status: "rescheduled",
      next_execution_at: scheduledSlot,
      compliance_mode: "RBI_EMANDATE_V2",
      npci_switch_ack: "ACK_RECEIVED_200"
    };
  },

  // Simulates instantaneous test mode capture for live interactive demo
  executeTestPaymentCapture: async (paymentLinkId, amount) => {
    await new Promise((r) => setTimeout(r, 120));
    return {
      payment_id: `pay_${Math.random().toString(36).substring(2, 12)}`,
      payment_link_id: paymentLinkId,
      status: "captured",
      amount_recovered: amount,
      captured_at: new Date().toISOString(),
      method: "upi",
      vpa: "customer@upi"
    };
  }
};
