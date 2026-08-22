// In-memory central store with realistic Indian enterprise dataset
import { generateFullBatch } from '../../src/data/syntheticBatch.js';

export const db = {
  subscriptions: generateFullBatch(3),
  
  invoices: [
    {
      id: "INV-2026-8819",
      buyerName: "Swiggy Delivery Logistics Pvt Ltd",
      buyerGstin: "29AABCS1429B1ZB",
      amount: 148500,
      dueDate: "2026-02-05",
      overdueDays: 17,
      agingBucket: "1_30_DAYS",
      status: "OVERDUE",
      ptpDate: null,
      contactPerson: "Rajesh Kannan (Head of Procurement)",
      phone: "+91 98450 12891",
      email: "finance.vendor@swiggy.in",
      items: [
        { desc: "Dedicated Cloud Delivery Fleet API (Jan 2026)", qty: 1, rate: 125847 },
        { desc: "GST 18% (CGST 9% + SGST 9%)", qty: 1, rate: 22653 }
      ]
    },
    {
      id: "INV-2026-8820",
      buyerName: "PhysicsWallah EdTech Learning",
      buyerGstin: "07AAACP4418P1ZK",
      amount: 215000,
      dueDate: "2026-01-15",
      overdueDays: 38,
      agingBucket: "31_60_DAYS",
      status: "OVERDUE",
      ptpDate: "2026-02-28",
      contactPerson: "Nikhil Agarwal (VP Finance)",
      phone: "+91 98102 33418",
      email: "accounts.payable@pw.live",
      items: [
        { desc: "Live Classroom Interactive Video Streaming SDK (Q4)", qty: 1, rate: 182203 },
        { desc: "GST 18% (IGST)", qty: 1, rate: 32797 }
      ]
    },
    {
      id: "INV-2026-8821",
      buyerName: "Cult.fit Healthcare & Gyms",
      buyerGstin: "29AAHCC8891C1ZT",
      amount: 89400,
      dueDate: "2025-12-10",
      overdueDays: 74,
      agingBucket: "60_PLUS_DAYS",
      status: "ESCALATED_LEGAL",
      ptpDate: null,
      contactPerson: "Sonal Mehra (Accounts Lead)",
      phone: "+91 97400 55190",
      email: "sonal.mehra@cult.fit",
      items: [
        { desc: "Multi-gym Biometric Access Integration Hardware", qty: 1, rate: 75762 },
        { desc: "GST 18% (CGST + SGST)", qty: 1, rate: 13638 }
      ]
    },
    {
      id: "INV-2026-8822",
      buyerName: "Zepto Hyperlocal Grocery",
      buyerGstin: "27AABCZ9941Z1ZZ",
      amount: 340000,
      dueDate: "2026-02-12",
      overdueDays: 10,
      agingBucket: "1_30_DAYS",
      status: "OVERDUE",
      ptpDate: null,
      contactPerson: "Aadit Palicha (Finance Desk)",
      phone: "+91 98200 44102",
      email: "finance.ops@zeptonow.com",
      items: [
        { desc: "Enterprise Dark Store Real-Time Routing Engine", qty: 1, rate: 288135 },
        { desc: "GST 18% (IGST)", qty: 1, rate: 51865 }
      ]
    }
  ],

  disputes: [
    {
      id: "disp_rzp_994101",
      paymentId: "pay_Kx992014",
      amount: 1499,
      reasonCode: "FRAUDULENT_NOT_RECOGNIZED",
      cardNetwork: "VISA",
      issuerBank: "HDFC Bank",
      chargebackDate: "2026-02-18",
      evidenceDeadline: "2026-02-28",
      customerName: "Suresh Menon",
      customerPhone: "+91 98400 11928",
      dossierCompiled: true,
      winProbability: 94,
      evidenceItems: {
        deliveryOtp: "OTP-8819 Verified on 2026-01-15 14:22 IST",
        deviceFingerprint: "Chrome 122.0.0 Win11 (IP: 49.37.12.84, Bengaluru)",
        threeDsAuthRrn: "338190284192 (3DS 2.0 Strong Customer Auth Approved)",
        logisticsTracking: "BlueDart Waybill #774910291 (Signed by recipient)"
      },
      status: "READY_FOR_SUBMISSION"
    },
    {
      id: "disp_rzp_994102",
      paymentId: "pay_Kx992015",
      amount: 4999,
      reasonCode: "PRODUCT_NOT_DELIVERED",
      cardNetwork: "MASTERCARD",
      issuerBank: "State Bank of India",
      chargebackDate: "2026-02-14",
      evidenceDeadline: "2026-02-25",
      customerName: "Pooja Hegde",
      customerPhone: "+91 98211 44521",
      dossierCompiled: true,
      winProbability: 91,
      evidenceItems: {
        deliveryOtp: "Digital License Key Activated on 2026-01-20 18:05 IST",
        deviceFingerprint: "Safari iOS 17.3 (IP: 106.51.78.22, Mumbai)",
        threeDsAuthRrn: "338199481022 (Mastercard Identity Check Pass)",
        logisticsTracking: "Cloud Portal Access Log (14 sessions recorded)"
      },
      status: "SUBMITTED_TO_NETWORK"
    }
  ],

  policy: {
    maxDiscountPercentage: 8,
    absoluteDiscountCapRupees: 250,
    minCustomerLtvForDiscount: 8000,
    escalateAboveRupees: 10000,
    maxAutomaticRetries: 3,
    enforceMandateLimitStrict: true
  },

  auditLogs: [],
  webhookEvents: []
};
