import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { generateJewelryImage } from '../../services/puterAI';

const API_URL = 'http://localhost:5000/api';

const jewelryTypes = [
  'Ring',
  'Necklace',
  'Earrings',
  'Bracelet',
  'Pendant',
  'Bangle',
];

const styles = [
  'Minimalist',
  'Classic',
  'Modern',
  'Vintage',
  'Floral',
  'Royal',
  'Geometric',
  'Luxury',
];

const materials = ['Gold', 'Silver', 'Platinum'];

const purities = {
  Gold: ['24K', '22K', '20K', '18K', '14K'],
  Silver: ['925'],
  Platinum: ['950'],
};

const metalColors = ['Yellow Gold', 'Rose Gold', 'White Gold'];

const gemstones = [
  'None',
  'Diamond',
  'Ruby',
  'Emerald',
  'Sapphire',
  'Pearl',
  'Other',
];

const complexities = ['Simple', 'Moderate', 'Intricate'];

function DesignStudio() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jewelryType: 'Ring',
    size: '',
    style: 'Modern',
    material: 'Gold',
    purity: '18K',
    metalColor: 'Yellow Gold',
    gemstone: 'None',
    carat: '',
    estimatedWeight: '',
    complexity: 'Moderate',
    budget: '',
    description: '',
    referenceImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');

  // Read the latest token for every API request.
  const getAuthConfig = () => {
    const token = localStorage.getItem('jeweloraToken');

    if (!token) {
      throw new Error('Your session has expired. Please log in again.');
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleMaterialChange = (material) => {
    setFormData((previous) => ({
      ...previous,
      material,
      purity: purities[material][0],
      metalColor:
        material === 'Gold'
          ? ['Silver', 'Platinum'].includes(previous.metalColor)
            ? 'Yellow Gold'
            : previous.metalColor
          : material,
    }));
  };

  const handleReferenceImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    setError('');

    setFormData((previous) => ({
      ...previous,
      referenceImage: file,
    }));
  };

  const buildPrompt = () => `
Create a premium jewelry design concept for a jewelry customization website.

Jewelry type: ${formData.jewelryType}
Size: ${formData.size}
Style: ${formData.style}
Material: ${formData.material}
Purity: ${formData.purity}
Metal color: ${formData.metalColor}
Gemstone: ${formData.gemstone}
Gemstone carat: ${formData.carat || 'Not specified'}
Estimated weight: ${formData.estimatedWeight} grams
Design complexity: ${formData.complexity}
Customer budget: ₹${formData.budget}

Customer description:
${formData.description || 'No additional description provided.'}

Generate a single elegant 2D jewelry product design concept.

Requirements:
- Focus clearly on the requested jewelry type.
- Match the selected material, purity, metal color and gemstone.
- Follow the requested style and complexity.
- Make the design visually premium and realistic.
- Show the jewelry clearly against a clean neutral background.
- Use a professional product-design presentation.
- Do not show a person wearing the jewelry.
- Do not create text, labels, measurements, logos or watermarks.
- This is a 2D design concept, not a manufacturing-ready CAD model.
`;

  const handleGenerate = async () => {
    setError('');

    const token = localStorage.getItem('jeweloraToken');

    if (!token) {
      setError('Please log in before creating a jewelry design.');
      navigate('/login');
      return;
    }

    if (
      !formData.size.trim() ||
      !formData.estimatedWeight ||
      !formData.budget
    ) {
      setError(
        'Please enter size, estimated weight and budget before generating your design.'
      );
      return;
    }

    const weight = Number(formData.estimatedWeight);
    const budget = Number(formData.budget);
    const carat = Number(formData.carat || 0);

    if (!Number.isFinite(weight) || weight <= 0) {
      setError('Estimated weight must be greater than 0.');
      return;
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      setError('Budget must be greater than 0.');
      return;
    }

    if (!Number.isFinite(carat) || carat < 0) {
      setError('Please enter a valid gemstone carat value.');
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Save customization details.
      setLoadingText('Saving your customization...');

      const customizationPayload = {
        jewelryType: formData.jewelryType,
        size: formData.size.trim(),
        style: formData.style,
        material: formData.material,
        purity: formData.purity,
        metalColor: formData.metalColor,
        gemstone: formData.gemstone,
        carat,
        estimatedWeight: weight,
        complexity: formData.complexity,
        budget,
        description: formData.description.trim(),
        referenceImage: formData.referenceImage
          ? {
              fileName: formData.referenceImage.name,
              fileType: formData.referenceImage.type,
            }
          : null,
      };

      const customizationResponse = await axios.post(
        `${API_URL}/customizations`,
        customizationPayload,
        getAuthConfig()
      );

      const customization =
        customizationResponse.data?.customization;

      if (!customization?._id) {
        throw new Error(
          'The customization was not saved correctly. Please try again.'
        );
      }

      // STEP 2: Generate the AI image using Puter.
      setLoadingText('Creating your AI jewelry design...');

      const generatedImage = await generateJewelryImage(buildPrompt());

      if (!generatedImage) {
        throw new Error('The AI did not return a jewelry image.');
      }

      let imageSource = generatedImage;

      if (
        typeof HTMLImageElement !== 'undefined' &&
        generatedImage instanceof HTMLImageElement
      ) {
        imageSource = generatedImage.src;
      }

      if (
        typeof imageSource !== 'string' ||
        !imageSource.trim()
      ) {
        throw new Error(
          'The generated image could not be processed. Please try again.'
        );
      }

      // STEP 3: Save the generated design in MongoDB.
      setLoadingText('Saving your generated design...');

      const designPayload = {
        imageBase64: imageSource,
        jewelryType: formData.jewelryType,
        size: formData.size.trim(),
        style: formData.style,
        material: formData.material,
        purity: formData.purity,
        metalColor: formData.metalColor,
        gemstone: formData.gemstone,
        carat,
        estimatedWeight: weight,
        complexity: formData.complexity,
        budget,
        description: formData.description.trim(),
      };

      const designResponse = await axios.post(
        `${API_URL}/designs/generate`,
        designPayload,
        getAuthConfig()
      );

      const savedDesign = designResponse.data?.design;

      if (!savedDesign?._id) {
        throw new Error(
          'The server did not confirm that your design was saved.'
        );
      }

      // STEP 4: Calculate the approximate jewelry price.
      setLoadingText('Calculating your approximate price...');

      const priceResponse = await axios.post(
        `${API_URL}/price/estimate`,
        {
          material: formData.material,
          purity: formData.purity,
          gemstone: formData.gemstone,
          carat,
          estimatedWeight: weight,
          complexity: formData.complexity,
          budget,
        },
        getAuthConfig()
      );

      const priceEstimate = priceResponse.data?.estimate;

      if (!priceEstimate) {
        throw new Error(
          'The design was saved, but the price estimate was not returned.'
        );
      }

      // STEP 5: Attach the saved design and price estimate
      // to this customer's customization request.
      setLoadingText('Linking your design to the customization...');

      const customizationUpdateResponse = await axios.patch(
        `${API_URL}/customizations/${customization._id}/design`,
        {
          designId: savedDesign._id,
          priceEstimate,
        },
        getAuthConfig()
      );

      const updatedCustomization =
        customizationUpdateResponse.data?.customization;

      if (!updatedCustomization) {
        throw new Error(
          'The design was saved, but the customization could not be updated.'
        );
      }

      // STEP 6: Open the result page.
      navigate('/design-result', {
        state: {
          design: {
            ...savedDesign,
            imageBase64: imageSource,
          },
          priceEstimate,
          customization: updatedCustomization,
        },
      });
    } catch (err) {
      console.error('Design generation error:', err);

      const status = err.response?.status;
      const backendMessage = err.response?.data?.message;

      if (status === 401) {
        setError(
          backendMessage ||
            'Your login session is invalid. Please log in again.'
        );
      } else if (status === 403) {
        setError(
          backendMessage ||
            'You do not have permission to perform this action.'
        );
      } else {
        setError(
          backendMessage ||
            err.message ||
            'Unable to generate your jewelry design. Please try again.'
        );
      }
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <div className="studio-page">
      <div className="studio-background-glow glow-one"></div>
      <div className="studio-background-glow glow-two"></div>

      <div className="studio-container">
        {/* HEADER */}
        <header className="studio-header">
          <div>
            <span className="studio-eyebrow">
              JEWELORA DESIGN STUDIO
            </span>

            <h1>
              Design Jewelry That Is
              <span> Uniquely Yours.</span>
            </h1>

            <p>
              Personalize every detail and let AI transform your vision
              into an elegant jewelry design concept.
            </p>
          </div>

          <div className="studio-badge">
            <span>✦</span>
            AI Powered
          </div>
        </header>

        {/* PROGRESS */}
        <div className="studio-progress">
          <div className="progress-step active">
            <span>1</span>
            Customize
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>2</span>
            Generate
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>3</span>
            Review
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="studio-error" role="alert">
            <span>!</span>
            {error}
          </div>
        )}

        {/* 01: JEWELRY TYPE */}
        <section className="studio-card">
          <div className="section-heading">
            <div>
              <span className="section-number">01</span>
              <div>
                <h2>Choose Your Jewelry</h2>
                <p>What would you like to create?</p>
              </div>
            </div>
          </div>

          <div className="option-grid jewelry-grid">
            {jewelryTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`option-card ${
                  formData.jewelryType === type ? 'selected' : ''
                }`}
                onClick={() => updateField('jewelryType', type)}
              >
                <span>{type}</span>

                {formData.jewelryType === type && (
                  <span className="selected-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 02: STYLE */}
        <section className="studio-card">
          <div className="section-heading">
            <div>
              <span className="section-number">02</span>
              <div>
                <h2>Choose Your Style</h2>
                <p>Define the personality of your jewelry.</p>
              </div>
            </div>
          </div>

          <div className="style-grid">
            {styles.map((style) => (
              <button
                key={style}
                type="button"
                className={`style-card ${
                  formData.style === style ? 'selected' : ''
                }`}
                onClick={() => updateField('style', style)}
              >
                <span>{style}</span>

                {formData.style === style && (
                  <span className="selected-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 03: MATERIAL */}
        <section className="studio-card">
          <div className="section-heading">
            <div>
              <span className="section-number">03</span>
              <div>
                <h2>Select Material</h2>
                <p>Choose the foundation of your design.</p>
              </div>
            </div>
          </div>

          <div className="material-grid">
            {materials.map((material) => (
              <button
                key={material}
                type="button"
                className={`material-card ${
                  formData.material === material ? 'selected' : ''
                }`}
                onClick={() => handleMaterialChange(material)}
              >
                <div className={`metal-preview ${material.toLowerCase()}`}>
                  <span></span>
                </div>

                <div>
                  <strong>{material}</strong>

                  <small>
                    {material === 'Gold'
                      ? 'Timeless elegance'
                      : material === 'Silver'
                        ? 'Modern brilliance'
                        : 'Rare sophistication'}
                  </small>
                </div>

                {formData.material === material && (
                  <span className="selected-check">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Purity</label>

              <select
                value={formData.purity}
                onChange={(event) =>
                  updateField('purity', event.target.value)
                }
              >
                {purities[formData.material].map((purity) => (
                  <option key={purity} value={purity}>
                    {purity}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Metal Color</label>

              <select
                value={formData.metalColor}
                onChange={(event) =>
                  updateField('metalColor', event.target.value)
                }
              >
                {(formData.material === 'Gold'
                  ? metalColors
                  : [formData.material]
                ).map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 04: GEMSTONE */}
        <section className="studio-card">
          <div className="section-heading">
            <div>
              <span className="section-number">04</span>
              <div>
                <h2>Add a Gemstone</h2>
                <p>Give your creation its signature sparkle.</p>
              </div>
            </div>
          </div>

          <div className="gemstone-grid">
            {gemstones.map((gemstone) => (
              <button
                key={gemstone}
                type="button"
                className={`gemstone-card ${
                  formData.gemstone === gemstone ? 'selected' : ''
                }`}
                onClick={() => {
                  setFormData((previous) => ({
                    ...previous,
                    gemstone,
                    carat: gemstone === 'None' ? '' : previous.carat,
                  }));
                }}
              >
                <span className="gemstone-symbol">
                  {gemstone === 'None'
                    ? '○'
                    : gemstone === 'Diamond'
                      ? '◇'
                      : gemstone === 'Pearl'
                        ? '●'
                        : gemstone === 'Other'
                          ? '✦'
                          : '◆'}
                </span>

                <span>{gemstone}</span>

                {formData.gemstone === gemstone && (
                  <span className="selected-check">✓</span>
                )}
              </button>
            ))}
          </div>

          {formData.gemstone !== 'None' && (
            <div className="single-field">
              <div className="field-group">
                <label>Gemstone Carat</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 0.50"
                  value={formData.carat}
                  onChange={(event) =>
                    updateField('carat', event.target.value)
                  }
                />
              </div>
            </div>
          )}
        </section>

        {/* 05: SPECIFICATIONS */}
        <section className="studio-card">
          <div className="section-heading">
            <div>
              <span className="section-number">05</span>
              <div>
                <h2>Design Specifications</h2>
                <p>Fine-tune the physical characteristics.</p>
              </div>
            </div>
          </div>

          <div className="spec-grid">
            <div className="field-group">
              <label>Size / Dimensions</label>

              <input
                type="text"
                placeholder="e.g. Ring size 14"
                value={formData.size}
                onChange={(event) =>
                  updateField('size', event.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label>Estimated Weight</label>

              <div className="input-with-unit">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 8.5"
                  value={formData.estimatedWeight}
                  onChange={(event) =>
                    updateField('estimatedWeight', event.target.value)
                  }
                />

                <span>grams</span>
              </div>
            </div>

            <div className="field-group">
              <label>Design Complexity</label>

              <div className="complexity-options">
                {complexities.map((complexity) => (
                  <button
                    key={complexity}
                    type="button"
                    className={
                      formData.complexity === complexity ? 'active' : ''
                    }
                    onClick={() => updateField('complexity', complexity)}
                  >
                    {complexity}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>Approximate Budget</label>

              <div className="input-with-prefix">
                <span>₹</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 75000"
                  value={formData.budget}
                  onChange={(event) =>
                    updateField('budget', event.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* 06: DESCRIPTION */}
        <section className="studio-card">
          <div className="section-heading">
            <div>
              <span className="section-number">06</span>
              <div>
                <h2>Describe Your Vision</h2>
                <p>Tell the AI anything else you would like to see.</p>
              </div>
            </div>
          </div>

          <textarea
            className="vision-input"
            rows="5"
            placeholder="Example: I want a delicate floral ring with a central diamond, subtle detailing and an elegant premium appearance..."
            value={formData.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
          />
        </section>

        {/* 07: REFERENCE IMAGE */}
        <section className="studio-card">
          <div className="section-heading">
            <div>
              <span className="section-number">07</span>
              <div>
                <h2>Add a Reference</h2>
                <p>Optional — upload an image for inspiration.</p>
              </div>
            </div>
          </div>

          <label className="upload-box">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleReferenceImage}
            />

            <span className="upload-icon">↑</span>

            <strong>
              {formData.referenceImage
                ? formData.referenceImage.name
                : 'Upload a reference image'}
            </strong>

            <small>PNG, JPG or JPEG</small>
          </label>
        </section>

        {/* GENERATE */}
        <section className="generate-section">
          <div className="generate-info">
            <span className="generate-sparkle">✦</span>

            <div>
              <h2>Ready to bring your idea to life?</h2>

              <p>
                Jewelora AI will create a personalized 2D design concept
                and calculate an approximate price.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {loadingText || 'Creating your design...'}
              </>
            ) : (
              <>
                Generate My Jewelry Design
                <span>✦</span>
              </>
            )}
          </button>
        </section>

        {/* DISCLAIMER */}
        <p className="studio-disclaimer">
          Jewelora generates AI-powered 2D design concepts for
          visualization and planning. Price estimates are approximate
          and actual jewelry pricing may vary by jeweller, craftsmanship,
          gemstone quality, market rates and other factors.
        </p>
      </div>
    </div>
  );
}

export default DesignStudio;
