import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const app = express();
const PORT = process.env.PORT || 3001;

function getOpenAI(req) {
  const apiKey = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('API 키가 없습니다.');
  return new OpenAI({ apiKey });
}

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*'
}));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/analyze', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const openai = getOpenAI(req);
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: '당신은 인스타그램 콘텐츠 전략가입니다. 주어진 스토리보드를 분석하여 인스타그램 그리드에 어울리는 9개의 피드 게시물을 기획해주세요. 전체 그리드가 통일된 색감, 분위기, 스타일을 유지하도록 구성하세요.'
        },
        {
          role: 'user',
          content: `스토리보드 내용:\n\n${pdfText}\n\n다음 형식으로 JSON 객체를 반환해주세요. 키는 'posts'이고, 정확히 9개의 게시물 배열을 포함해야 합니다. 각 게시물 형식: { id, title(한국어 제목), caption(해시태그 포함 한국어 캡션), imagePrompt(영어로 작성된 이미지 생성 프롬프트 - 구체적인 구도, 색감, 스타일 포함. 이미지 안에 텍스트가 필요할 경우 반드시 "with Korean text saying [한국어 텍스트]" 형식으로 명시할 것), colorPalette(3개의 hex 색상 코드 배열), textOverlay(이미지 위에 표시할 짧은 한국어 텍스트), mood(energetic|calm|dramatic|playful|professional 중 하나) }`
        }
      ]
    });

    const content = JSON.parse(response.choices[0].message.content);
    const posts = content.posts || [];

    return res.json({ posts });
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze PDF' });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const openai = getOpenAI(req);
    const { imagePrompt, postId } = req.body;
    if (!imagePrompt) {
      return res.status(400).json({ error: 'imagePrompt is required' });
    }

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
    if (!url) throw new Error('No image returned from API');
    return res.json({ url, postId });
  } catch (err) {
    console.error('Error in /api/generate-image:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate image' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
