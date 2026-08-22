import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from '../logger.js';

const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY || 'rzp_test_sec_99481';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_mock';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_wh_secret_revivepay_2026';

// Warn on insecure production configuration
if (process.env.NODE_ENV === 'production') {
  if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'rzp_test_secret_key_mock') {
    logger.warn('⚠️ SECURITY WARNING: RAZORPAY_KEY_SECRET is missing or using placeholder in production mode!');
  }
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET === 'rzp_wh_secret_revivepay_2026') {
    logger.warn('⚠️ SECURITY WARNING: RAZORPAY_WEBHOOK_SECRET is missing or using default secret in production mode!');
  }
}

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
} catch (err) {
  logger.warn({ err: err.message }, 'Razorpay SDK initialization warning (using test fallback)');
}

export const RazorpayService = {
  isTestMode: true,
  keyId,

  /**
   * Validates Razorpay webhook signature using HMAC-SHA256
   */
  validateWebhookSignature(bodyString, signature, customSecret = webhookSecret) {
    if (!signature || typeof signature !== 'string') return false;

    try {
      if (typeof Razorpay.validateWebhookSignature === 'function') {
        return Razorpay.validateWebhookSignature(bodyString, signature, customSecret);
      }
      const expectedSignature = crypto
        .createHmac('sha256', customSecret)
        .update(bodyString)
        .digest('hex');
      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
    } catch (err) {
      logger.warn({ err: err.message }, 'Webhook signature validation error');
      return false;
    }
  },

  /**
   * Generates a valid test signature for webhook simulation
   */
  generateTestSignature(payloadString, secret = webhookSecret) {
    return crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
  },

  /**
   * Creates a live Razorpay Payment Link (or fallback in sandbox)
   */
  async createPaymentLink({ amount, customerName, customerEmail, customerPhone, merchant = 'RevivePay Merchant' }) {
    if (razorpayInstance && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'rzp_test_secret_key_mock') {
      try {
        const link = await razorpayInstance.paymentLink.create({
          amount: Math.round(amount * 100), // paise
          currency: 'INR',
          accept_partial: false,
          description: `Auto-recovery payment for ${merchant}`,
          customer: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone
          },
          notify: {
            sms: true,
            email: true,
            whatsapp: true
          },
          reminder_enable: true,
          notes: {
            recovered_by: 'Razorpay RevivePay Sentinel',
            original_amount: String(amount)
          }
        });
        return {
          id: link.id,
          short_url: link.short_url,
          status: link.status,
          isLiveWire: true
        };
      } catch (err) {
        logger.warn({ err: err.message }, 'Live Razorpay API call fell back to sandbox link');
      }
    }

    // Sandbox / Test fallback
    const mockId = `plink_${Math.random().toString(36).substring(2, 10)}`;
    return {
      id: mockId,
      short_url: `https://rzp.io/i/${mockId}`,
      status: 'created',
      isLiveWire: false
    };
  }
};
