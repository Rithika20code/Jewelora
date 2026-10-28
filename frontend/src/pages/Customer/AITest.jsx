import { useState } from 'react';
import { generateJewelryImage } from '../../services/puterAI';

function AITest() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setImage(null);

    try {
      const prompt = `
Create a premium realistic jewelry product photograph.

A beautiful elegant rose-gold ring with a small
round brilliant diamond in the center.

Style: modern, minimal, luxurious.
Material: rose gold.
Gemstone: diamond.
Background: clean warm ivory studio background.
Lighting: soft professional jewelry photography.
Show the complete ring clearly.
No person wearing it.
No hands.
No text.
No logo.
No watermark.
2D product image only.
`;

      const result = await generateJewelryImage(prompt);

      console.log('Puter AI result:', result);

      setImage(result);
    } catch (error) {
      console.error('Puter AI error:', error);
      setError(
        error?.message ||
          'Unable to generate the jewelry image.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '60px',
        background: '#f8f4ef',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: '#ffffff',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        <h1>Jewelora AI Test</h1>

        <p>
          This is a temporary test to verify that
          Jewelora can generate a jewelry image without
          Hugging Face or OpenAI credits.
        </p>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          style={{
            marginTop: '20px',
            padding: '14px 24px',
            border: 'none',
            borderRadius: '12px',
            background: '#1f1b18',
            color: '#ffffff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading
            ? 'Generating Jewelry...'
            : 'Generate Test Jewelry'}
        </button>

        {error && (
          <div
            style={{
              marginTop: '25px',
              padding: '15px',
              borderRadius: '10px',
              background: '#fff0f0',
              color: '#b42318',
            }}
          >
            {error}
          </div>
        )}

        {image && (
          <div style={{ marginTop: '35px' }}>
            <h2>Generated Design</h2>

            <img
              src={image}
              alt="AI generated jewelry"
              style={{
                width: '100%',
                maxWidth: '600px',
                borderRadius: '20px',
                marginTop: '15px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AITest;