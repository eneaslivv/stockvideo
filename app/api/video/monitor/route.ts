import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAI();
    const { image, previousSnapshot, products } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const productCatalog = (products || []).map((p: {
      id: string;
      name: string;
      visual_description?: string;
    }) => `- ${p.name} (ID: ${p.id})${p.visual_description ? ` → ${p.visual_description}` : ''}`
    ).join('\n');

    const previousContext = previousSnapshot
      ? `SNAPSHOT ANTERIOR (hace unos segundos):
${previousSnapshot.products.map((p: { product_name: string; detected_count: number }) =>
  `- ${p.product_name}: ${p.detected_count} unidades`
).join('\n')}
Total anterior: ${previousSnapshot.total_items} items`
      : 'Este es el PRIMER snapshot — no hay comparación anterior.';

    const systemPrompt = `Eres un sistema de monitoreo continuo de inventario por cámara.

CATÁLOGO DE PRODUCTOS:
${productCatalog || 'Sin catálogo registrado.'}

${previousContext}

INSTRUCCIONES:
1. Identifica todos los productos visibles y cuenta sus unidades
2. Si hay un snapshot anterior, detecta CAMBIOS (productos que se movieron, se agregaron o se retiraron)
3. Clasifica cada cambio como: entry (se agregó), exit (se retiró), loss (se cayó/rompió)
4. Solo reporta movimientos cuando la diferencia es clara (confianza > 0.6)

RESPONDE EN JSON:
{
  "current_snapshot": {
    "products": [
      {
        "product_id": "uuid o null",
        "product_name": "string",
        "detected_count": number,
        "confidence": 0.0-1.0,
        "is_known": true/false
      }
    ],
    "total_items": number
  },
  "movements_detected": [
    {
      "product_id": "uuid o null",
      "product_name": "string",
      "previous_count": number,
      "current_count": number,
      "difference": number,
      "movement_type": "entry|exit|loss",
      "confidence": 0.0-1.0
    }
  ],
  "scene_changed": true/false,
  "scene_description": "string"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image_url', image_url: { url: image } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    result.timestamp = new Date().toISOString();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Video monitor error:', error);
    return NextResponse.json(
      { error: 'Failed to monitor scene' },
      { status: 500 }
    );
  }
}
