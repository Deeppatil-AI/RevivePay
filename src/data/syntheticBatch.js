// Real-world synthetic dataset of Indian recurring subscription payments & mandates
// Covering OTT, EdTech, B2B SaaS, Quick Commerce, Gym/Fitness, Insurance EMIs
export const INDIAN_MERCHANTS = [
  { name: "Hotstar Premium", category: "OTT_MEDIA", plans: [{ name: "Annual 4K Super", amount: 1499 }, { name: "Monthly Mobile", amount: 299 }] },
  { name: "SonyLIV Subscriptions", category: "OTT_MEDIA", plans: [{ name: "LIV Premium Annual", amount: 999 }, { name: "LIV WWE Special", amount: 599 }] },
  { name: "PhysicsWallah Infinity", category: "EDTECH", plans: [{ name: "JEE Ultimate Batch", amount: 4999 }, { name: "NEET Crash EMI", amount: 2499 }] },
  { name: "Cult.fit Cultpass", category: "FITNESS", plans: [{ name: "Cultpass ELITE 12M", amount: 14990 }, { name: "Monthly Cultpass Live", amount: 1199 }] },
  { name: "Zoho Books & One", category: "SAAS_B2B", plans: [{ name: "Zoho One Enterprise (5 Seats)", amount: 9000 }, { name: "Standard GST Tier", amount: 2499 }] },
  { name: "Freshworks Freshdesk", category: "SAAS_B2B", plans: [{ name: "Growth Omnichannel", amount: 7800 }, { name: "Pro Agent Tier", amount: 18500 }] },
  { name: "Swiggy One VIP", category: "COMMERCE", plans: [{ name: "Swiggy One 3 Months", amount: 899 }, { name: "Annual Super", amount: 1999 }] },
  { name: "Zepto Pass Monthly", category: "COMMERCE", plans: [{ name: "Zepto VIP Pass", amount: 299 }, { name: "Quarterly Club", amount: 699 }] },
  { name: "Bajaj Finserv EMI", category: "BFSI_EMI", plans: [{ name: "Laptop No-Cost EMI", amount: 3850 }, { name: "Health Prime Care", amount: 1250 }] },
  { name: "Digit Health Protect", category: "INSURANCE", plans: [{ name: "Annual Health TopUp", amount: 4800 }, { name: "Family Floater Qtr", amount: 3600 }] }
];

export const REAL_INDIAN_CUSTOMERS = [
  { name: "Aarav Sharma", city: "Bengaluru", phone: "+91 98201 44512", email: "aarav.sharma@gmail.com", bank: "SBI", ifsc: "SBIN0001234", mandateLimit: 5000, ltv: 28500 },
  { name: "Priya Sundaram", city: "Chennai", phone: "+91 94440 88219", email: "priya.sundaram@zoho.com", bank: "HDFC", ifsc: "HDFC0000060", mandateLimit: 15000, ltv: 45000 },
  { name: "Rohan Varma", city: "Mumbai", phone: "+91 98210 99401", email: "rohan.v@fintechcorp.in", bank: "ICICI", ifsc: "ICIC0000011", mandateLimit: 10000, ltv: 32000 },
  { name: "Ananya Iyer", city: "Hyderabad", phone: "+91 99881 22345", email: "ananya.iyer@techmahindra.com", bank: "Axis", ifsc: "UTIB0000004", mandateLimit: 8000, ltv: 19500 },
  { name: "Kunal Deshmukh", city: "Pune", phone: "+91 98500 11420", email: "kunal.d@tcs.com", bank: "PNB", ifsc: "PUNB0024000", mandateLimit: 6000, ltv: 14000 },
  { name: "Tanvi Kulkarni", city: "Bengaluru", phone: "+91 97411 66820", email: "tanvi.k@swiggy.in", bank: "Kotak", ifsc: "KKBK0000958", mandateLimit: 12000, ltv: 26000 },
  { name: "Vikram Malhotra", city: "New Delhi", phone: "+91 98110 55319", email: "vikram.m@delhivery.com", bank: "SBI", ifsc: "SBIN0004521", mandateLimit: 15000, ltv: 54000 },
  { name: "Meera Nair", city: "Kochi", phone: "+91 94471 33201", email: "meera.nair@wipro.com", bank: "HDFC", ifsc: "HDFC0001221", mandateLimit: 7500, ltv: 22000 },
  { name: "Siddharth Sen", city: "Kolkata", phone: "+91 98300 77142", email: "siddharth.s@cognizant.com", bank: "ICICI", ifsc: "ICIC0000214", mandateLimit: 9000, ltv: 31000 },
  { name: "Divya Patel", city: "Ahmedabad", phone: "+91 98250 44109", email: "divya.p@cadila.in", bank: "Axis", ifsc: "UTIB0000115", mandateLimit: 8500, ltv: 18000 }
];

export const FAILURE_SCENARIOS = [
  {
    code: "NPCI_U30",
    name: "Core Banking CBS Outage",
    category: "CORE_BANKING_OUTAGE",
    description: "Bank CBS offline during midnight reconciliation batch lock.",
    suitableBanks: ["SBI", "PNB", "HDFC"]
  },
  {
    code: "NPCI_ZM",
    name: "Month-End Liquidity Timing",
    category: "LIQUIDITY_TIMING",
    description: "Temporary insufficient balance pending month-end salary credit.",
    suitableBanks: ["ICICI", "Axis", "Kotak", "HDFC", "SBI"]
  },
  {
    code: "NPCI_U28",
    name: "Mandate Debit Limit Exceeded",
    category: "MANDATE_CAP_BREACH",
    description: "Debit amount exceeds original pre-authorized e-mandate limit.",
    suitableBanks: ["Axis", "SBI", "Kotak"]
  },
  {
    code: "RAZOR_EXP_01",
    name: "Card/3DS Expired Authorization",
    category: "AUTH_TOKEN_EXPIRED",
    description: "Card tokenization expired; requires 1-click customer re-auth via WhatsApp.",
    suitableBanks: ["HDFC", "ICICI", "Axis"]
  }
];

export function generateSyntheticBatch(batchIndex = 1) {
  const transactions = [];

  REAL_INDIAN_CUSTOMERS.forEach((customer, idx) => {
    const merchant = INDIAN_MERCHANTS[(idx + batchIndex) % INDIAN_MERCHANTS.length];
    const plan = merchant.plans[idx % merchant.plans.length];
    const failure = FAILURE_SCENARIOS[(idx + batchIndex) % FAILURE_SCENARIOS.length];

    const txnId = `pay_IN_${(100000 + batchIndex * 100 + idx).toString()}`;
    const mandateId = `man_npci_${(40000 + batchIndex * 50 + idx).toString()}`;
    const rrn = `3381${Math.floor(10000000 + Math.random() * 90000000)}`;

    transactions.push({
      id: txnId,
      mandateId,
      rrn,
      customerName: customer.name,
      city: customer.city,
      phone: customer.phone,
      email: customer.email,
      merchant: merchant.name,
      category: merchant.category,
      planName: plan.name,
      amount: plan.amount,
      bank: customer.bank,
      ifsc: customer.ifsc,
      customerLtv: customer.ltv,
      mandateLimit: customer.mandateLimit,
      retryCount: idx % 3,
      failureCode: failure.code,
      failureName: failure.name,
      failureCategory: failure.category,
      failureReason: failure.description,
      failedAt: new Date(Date.now() - (idx * 14 + 10) * 60000).toISOString(),
      recoveryResult: null
    });
  });

  return transactions;
}

export function generateFullBatch(count = 3) {
  let all = [];
  for (let i = 1; i <= count; i++) {
    all = all.concat(generateSyntheticBatch(i));
  }
  return all;
}
