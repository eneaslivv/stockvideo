import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAI();
    const { image, products } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Build product catalog context for the AI
    const productCatalog = (products || []).map((p: {
      id: string;
      name: string;
      category?: string;
      unit?: string;
      visual_description?: string;
      aliases?: string[];
    }) => ({
      id: p.id,
      name: p.name,
      category: p.category || 'Sin categoría',
      unit: p.unit || 'unidad',
      visual_description: p.visual_description || '',
      aliases: p.aliases || [],
    }));

    const catalogText = productCatalog.length > 0
      ? productCatalog.map((p: { id: string; name: string; category: string; unit: string; visual_description: string; aliases: string[] }) =>
          `- ID: ${p.id} | "${p.name}" (${p.category}) [${p.unit}]${p.visual_description ? ` → Aspecto: ${p.visual_description}` : ''}${p.aliases.length > 0 ? ` → También conocido como: ${p.aliases.join(', ')}` : ''}`
        ).join('\n')
      : 'No hay productos registrados aún.';

    const systemPrompt = `Eres un sistema avanzado de visión por computadora para identificación automática de inventario.

CATÁLOGO DE PRODUCTOS CONOCIDOS:
${catalogText}

INSTRUCCIONES:
1. Analiza la imagen y detecta TODOS los productos visibles
2. Para cada producto, intenta hacer match con el catálogo conocido
3. Si un producto visible NO está en el catálogo, repórtalo como desconocido con is_known: false
4. Cuenta las unidades de cada producto detectado
5. Describe brevemente la escena general

RESPONDE EN JSON:
{
  "products": [
    {
      "product_id": "uuid del catálogo o null si es desconocido",
      "product_name": "nombre del producto",
      "detected_count": number,
      "confidence": 0.0-1.0,
      "bounding_boxes": [{"x": 0, "y": 0, "width": 0, "height": 0, "label": "string"}],
      "is_known": true/false
    }
  ],
  "total_items": number,
  "scene_description": "descripción breve de la escena",
  "image_quality": "good|fair|poor"
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

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    analysis.timestamp = new Date().toISOString();

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Video identify error:', error);
    return NextResponse.json(
      { error: 'Failed to identify products' },
      { status: 500 }
    );
  }
}
