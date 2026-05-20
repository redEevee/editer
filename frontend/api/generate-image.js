import OpenAI from 'openai';

function getApiKey(req) {
  const key = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('API 키가 없습니다.');
  return key;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = getApiKey(req);
    const openai = new OpenAI({ apiKey });

    const { imagePrompt, postId } = req.body;
    if (!imagePrompt) return res.status(400).json({ error: 'imagePrompt is required' });

    const fullPrompt = `${imagePrompt}. Square format, Instagram-ready, high quality, visually striking. If any text appears in the image, it must be written in Korean (한국어). All labels, titles, and captions inside the image should be in Korean.`;

    const response = await openai.images.generate({
      model: 'gpt-image-2',
      prompt: fullPrompt,
      size: '1024x1024',
      quality: 'medium',
      n: 1,
      output_format: 'png'
    });

    const item = response.data[0];
    const url = item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
    if (!url) throw new Error('이미지를 생성하지 못했습니다.');

    return res.status(200).json({ url, postId });
  } catch (err) {
    console.error('generate-image error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate image' });
  }
}
