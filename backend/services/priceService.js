const METAL_RATES = {
  Gold: {
    '24K': 14847,
    '22K': 14491,
    '20K': 13214,
    '18K': 12026,
    '14K': 9577,
  },

  Silver: {
    '925': 222.82,
  },

  Platinum: {
    '950': 55900,
  },
};

const GEMSTONE_RATES = {
  None: 0,
  Diamond: 15000,
  Ruby: 5000,
  Emerald: 7000,
  Sapphire: 6000,
  Pearl: 2500,
  Other: 4000,
};

const COMPLEXITY_RATES = {
  Simple: 0.08,
  Moderate: 0.12,
  Intricate: 0.18,
};

const GST_RATE = 0.03;

const calculatePrice = ({
  material,
  purity,
  gemstone,
  carat,
  estimatedWeight,
  complexity,
  budget,
}) => {
  const weight = Number(estimatedWeight) || 0;
  const gemstoneCarat = Number(carat) || 0;
  const customerBudget = Number(budget) || 0;

  // ----------------------------------------
  // Find metal rate
  // ----------------------------------------

  const materialRates = METAL_RATES[material];

  if (!materialRates) {
    throw new Error(
      `Pricing is not available for material: ${material}`
    );
  }

  const ratePerGram = materialRates[purity];

  if (!ratePerGram) {
    throw new Error(
      `Pricing is not available for ${material} ${purity}`
    );
  }

  // ----------------------------------------
  // Metal cost
  // ----------------------------------------

  const metalCost = weight * ratePerGram;

  // ----------------------------------------
  // Gemstone cost
  // ----------------------------------------

  const gemstoneRate =
    GEMSTONE_RATES[gemstone] || 0;

  const gemstoneCost =
    gemstoneRate * gemstoneCarat;

  // ----------------------------------------
  // Making charges
  // ----------------------------------------

  const makingChargeRate =
    COMPLEXITY_RATES[complexity] || 0.12;

  const makingCharges =
    (metalCost + gemstoneCost) *
    makingChargeRate;

  // ----------------------------------------
  // Subtotal
  // ----------------------------------------

  const subtotal =
    metalCost +
    gemstoneCost +
    makingCharges;

  // ----------------------------------------
  // GST
  // ----------------------------------------

  const gst =
    subtotal * GST_RATE;

  // ----------------------------------------
  // Final estimated price
  // ----------------------------------------

  const total =
    subtotal + gst;

  // ----------------------------------------
  // Budget comparison
  // ----------------------------------------

  const difference =
    total - customerBudget;

  let budgetStatus = 'within_budget';

  if (difference > 0) {
    budgetStatus = 'above_budget';
  } else if (difference < 0) {
    budgetStatus = 'below_budget';
  }

  return {
    currency: 'INR',

    metal: {
      material,
      purity,
      weight,
      ratePerGram,
      cost: Math.round(metalCost),
    },

    gemstone: {
      type: gemstone || 'None',
      carat: gemstoneCarat,
      estimatedRatePerCarat: gemstoneRate,
      cost: Math.round(gemstoneCost),
    },

    makingCharges: {
      complexity,
      percentage: makingChargeRate * 100,
      cost: Math.round(makingCharges),
    },

    gst: {
      percentage: GST_RATE * 100,
      cost: Math.round(gst),
    },

    subtotal: Math.round(subtotal),

    total: Math.round(total),

    budget: {
      amount: customerBudget,
      difference: Math.round(
        Math.abs(difference)
      ),
      status: budgetStatus,
    },

    source: {
      name: 'India Bullion and Jewellers Association',
      type: 'Benchmark metal rate',
      rateDate: '2026-10-06',
      note:
        'Metal benchmark rates exclude GST and making charges.',
    },

    disclaimer:
      'This is an approximate jewelry price estimate for design planning. Actual prices may vary based on jeweller, craftsmanship, gemstone quality, certification, wastage, taxes, and market conditions.',
  };
};

module.exports = {
  calculatePrice,
};