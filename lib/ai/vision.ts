import OpenAI from 'openai';
import type { VideoAnalysis } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeStockImage(
  imageBase64: string,
  productName: string,
  productDescription?: string
): Promise<VideoAnalysis> {
  const systemPrompt = `Eres un sistema de visión por computadora para conteo de inventario.

PRODUCTO A CONTAR: ${productName}
${productDescription ? `DESCRIPCIÓN VISUAL: ${productDescription}` : ''}

INSTRUCCIONES:
1. Identifica el producto en la imagen
2. Cuenta las unidades visibles con la mayor precisión posible
3. Si hay productos parcialmente ocultos, estima
4. Reporta tu nivel de confianza

RESPONDE EN JSON:
{
  "detected_count": number,
  "confidence": 0.0-1.0,
  "notes": "string con observaciones",
  "partially_visible": number,
  "obstructions": boolean,
  "image_quality": "good|fair|poor",
  "bounding_boxes": [
    {"x": 0, "y": 0, "width": 0, "height": 0, "label": "string"}
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: systemPrompt },
          { type: 'image_url', image_url: { url: imageBase64 } },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 500,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
