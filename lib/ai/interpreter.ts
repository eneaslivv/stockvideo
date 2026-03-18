import OpenAI from 'openai';
import type { AudioInterpretation, Product } from '@/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function interpretStockCommand(
  text: string,
  products: Product[]
): Promise<AudioInterpretation> {
  const systemPrompt = `Eres un asistente de gestión de stock. Tu trabajo es interpretar instrucciones de voz del usuario y convertirlas en movimientos de stock.

PRODUCTOS DISPONIBLES DEL USUARIO:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, aliases: p.aliases, unit: p.unit })), null, 2)}

REGLAS:
1. Siempre mapear a un producto existente (usa aliases y fuzzy matching)
2. Si no hay match claro, devolver "needs_clarification": true
3. Tipos de movimiento:
   - "entry": palabras como "entraron", "llegaron", "recibí", "compré", "agregué"
   - "exit": "vendí", "salieron", "entregué", "despachamos", "envié"
   - "loss": "se rompió", "perdimos", "venció", "dañado", "tiramos"
4. Siempre extraer la cantidad numérica
5. Si la cantidad es ambigua, pedir confirmación

RESPONDE SIEMPRE EN JSON:
{
  "product_match": "nombre exacto del producto",
  "product_id": "uuid si lo encontraste",
  "movement_type": "entry|exit|loss",
  "quantity": number,
  "confidence": 0.0-1.0,
  "needs_clarification": boolean,
  "clarification_message": "string si necesita aclaración",
  "raw_interpretation": "resumen en español de lo que entendiste"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 500,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
