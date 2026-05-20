import OpenAI from 'openai';
import formidable from 'formidable';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { Readable } from 'stream';

export const config = { api: { bodyParser: false } };

function getApiKey(req) {
  const key = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('API 키가 없습니다.');
  return key;
}

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 20 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = getApiKey(req);
    const openai = new OpenAI({ apiKey });

    const { files } = await parseForm(req);
    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
    if (!pdfFile) return res.status(400).json({ error: 'PDF 파일이 없습니다.' });

    const fs = await import('fs');
    const buffer = fs.readFileSync(pdfFile.filepath);
    const pdfData = await pdfParse(buffer);
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
    return res.status(200).json({ posts: content.posts || [] });
  } catch (err) {
    console.error('analyze error:', err);
    return res.status(500).json({ error: err.message || 'Failed to analyze PDF' });
  }
}
