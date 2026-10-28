const { InferenceClient } = require('@huggingface/inference');

const hf = new InferenceClient(
  process.env.HF_TOKEN
);

/**
 * Generate a 2D jewelry design using
 * Hugging Face Inference Providers.
 */
const generateJewelryDesign = async (customization) => {
  const {
    jewelryType,
    size,
    style,
    material,
    purity,
    metalColor,
    gemstone,
    carat,
    estimatedWeight,
    complexity,
    budget,
    description,
  } = customization;

  const prompt = `
Create a premium realistic jewelry product design concept.

Customer specifications:

Jewelry type: ${jewelryType}
Size / dimensions: ${size}
Design style: ${style}
Material: ${material}
Purity: ${purity}
Metal color: ${metalColor}
Gemstone: ${gemstone || 'None'}
Gemstone carat: ${carat || 'Not specified'}
Estimated weight: ${estimatedWeight} grams
Design complexity: ${complexity}
Approximate budget: ₹${budget}

Customer description:
${description || 'No additional description provided.'}

Design requirements:

- Create a beautiful realistic jewelry product concept.
- The jewelry must clearly match the requested jewelry type.
- Clearly reflect the requested material.
- Clearly reflect the requested metal color.
- Clearly reflect the requested gemstone.
- Clearly reflect the requested design style.
- Use premium jewelry photography aesthetics.
- Place the jewelry on a clean neutral background.
- Focus primarily on the jewelry.
- Show the complete jewelry item clearly.
- Use realistic metallic materials.
- Use realistic gemstone appearance.
- Use elegant studio lighting.
- Create a 2D image only.
- Do not create a 3D model.
- Do not create CAD or manufacturing drawings.
- Do not show a person wearing the jewelry.
- Do not include people.
- Do not include text.
- Do not include prices.
- Do not include logos.
- Do not include watermarks.
`;

  try {
    console.log('========================================');
    console.log('STARTING HUGGING FACE JEWELRY GENERATION');
    console.log('========================================');

    console.log('Model: black-forest-labs/FLUX.1-dev');

    const imageBlob = await hf.textToImage({
      model: 'black-forest-labs/FLUX.1-dev',
      inputs: prompt,
    });

    if (!imageBlob) {
      throw new Error(
        'Hugging Face did not return an image.'
      );
    }

    console.log(
      'Hugging Face image generated successfully.'
    );

    // Convert Blob to Buffer
    const imageBuffer = Buffer.from(
      await imageBlob.arrayBuffer()
    );

    // Convert image to Base64
    const imageBase64 =
      imageBuffer.toString('base64');

    console.log(
      'Image converted to Base64 successfully.'
    );

    console.log('========================================');

    return imageBase64;
  } catch (error) {
    console.error('========================================');
    console.error(
      'HUGGING FACE JEWELRY GENERATION ERROR'
    );
    console.error('========================================');

    console.error(
      'Error name:',
      error.name
    );

    console.error(
      'Error message:',
      error.message
    );

    console.error(
      'Error status:',
      error.status
    );

    console.error(
      'Full error:',
      error
    );

    console.error('========================================');

    throw new Error(
      'Unable to generate the jewelry design using the AI service.'
    );
  }
};

module.exports = {
  generateJewelryDesign,
};