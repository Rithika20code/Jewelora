const {
  calculatePrice,
} = require('../services/priceService');

const estimatePrice = async (req, res) => {
  try {
    const {
      material,
      purity,
      gemstone,
      carat,
      estimatedWeight,
      complexity,
      budget,
    } = req.body;

    // ----------------------------------------
    // Validate required fields
    // ----------------------------------------

    if (
      !material ||
      !purity ||
      estimatedWeight === undefined ||
      !complexity ||
      budget === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide material, purity, weight, complexity and budget.',
      });
    }

    // ----------------------------------------
    // Calculate price
    // ----------------------------------------

    const estimate = calculatePrice({
      material,
      purity,
      gemstone: gemstone || 'None',
      carat: carat || 0,
      estimatedWeight,
      complexity,
      budget,
    });

    // ----------------------------------------
    // Send response
    // ----------------------------------------

    return res.status(200).json({
      success: true,
      message:
        'Approximate jewelry price calculated successfully.',
      estimate,
    });
  } catch (error) {
    console.error(
      'Price estimation error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        'Unable to calculate the jewelry price.',
    });
  }
};

module.exports = {
  estimatePrice,
};