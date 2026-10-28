import { puter } from '@heyputer/puter.js';

export const generateJewelryImage = async (prompt) => {
  const image = await puter.ai.txt2img(prompt, {
    model: 'black-forest-labs/flux-schnell',
  });

  return image;
};