import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const anglePrompts: Record<string, string> = {
  unboxing: 'El ángulo es UNBOXING: La persona acaba de recibir el producto, lo abre con emoción natural y lo descubre por primera vez frente a la cámara.',
  'problem-solution': 'El ángulo es PROBLEMA/SOLUCIÓN: La persona menciona brevemente un problema que tenía y cómo este producto lo resolvió de forma inesperada.',
  'asmr-lifestyle': 'El ángulo es ASMR LIFESTYLE: La persona muestra cómo integra el producto en su rutina diaria de forma casual y natural, con énfasis en los sonidos y texturas.',
  testimonial: 'El ángulo es TESTIMONIAL: La persona comparte su experiencia personal con el producto después de usarlo por un tiempo, mostrando resultados reales.',
  'doctor-recommended': 'El ángulo es RECOMENDACIÓN EXPERTA: La persona menciona que un profesional (médico, nutricionista, coach) le recomendó el producto y comparte su experiencia.'
};

const marketDialects: Record<string, string> = {
  MX: 'Español mexicano coloquial. Usa expresiones como "está muy bueno", "la neta", "órale", "wey" (solo si es muy casual). Tono cálido y cercano.',
  ES: 'Español peninsular. Usa "tío/tía", "mola", "guay", "flipar". Tono directo y auténtico.',
  CO: 'Español colombiano. Usa "chévere", "bacano", "parcero". Tono amigable y espontáneo.'
};

function buildPrompt(data: any): string {
  const { productName, productFeatures, avatarDescription, aiModel, duration, market, angle } = data;
  const clipsCount = duration <= 30 ? (aiModel === 'heygen' ? 1 : 2) : (aiModel === 'heygen' ? 2 : 4);
  const clipDuration = aiModel === 'heygen' ? 30 : 15;

  return `Eres un experto en producción de contenido UGC orgánico hiper-realista para Meta Ads. Tu especialidad es crear prompts para IA generativa de video (VEo3, Kling, Seedance, HeyGen) que parezcan videos reales de usuarios reales, NO publicidad.

PRODUCTO: ${productName}
CARACTERÍSTICAS: ${productFeatures || 'No especificadas'}
AVATAR: ${avatarDescription}
MODELO DE IA: ${aiModel}
DURACIÓN TOTAL: ${duration} segundos
NÚMERO DE CLIPS: ${clipsCount} clips de ${clipDuration}s cada uno
MERCADO: ${market}
DIALECTO: ${marketDialects[market] || marketDialects['MX']}
ÁNGULO: ${anglePrompts[angle] || anglePrompts['unboxing']}

REGLAS DE ORO DEL UGC ORGÁNICO (CRÍTICAS):
- Perspectiva selfie de celular SIEMPRE (POV o cámara frontal levantada con el brazo visible)
- El brazo de quien graba DEBE estar visible en el encuadre
- SIN b-rolls, SIN cortes de escena, SIN efectos visuales
- SIN slow motion, SIN zoom digital, SIN filtros
- Luz natural SIEMPRE (ventana, exterior), nunca estudio
- Fondo REAL (cocina, baño, sala, calle), nunca fondo neutro
- La persona habla directo a cámara de forma CASUAL y ESPONTÁNEA
- El guión NO puede sonar como publicidad, debe sonar como conversación real
- Imperfecciones son bienvenidas: mano temblorosa leve, reencuadre natural
- Una sola toma continua por clip (sin cortes internos)

Genera el siguiente JSON con la estructura EXACTA (sin markdown, solo JSON puro):

{
  "initialFramePrompt": "Prompt ultra-detallado para generar el fotograma inicial del video. En inglés para mejor compatibilidad con IA. Descripción del personaje, encuadre, luz, fondo, expresión, postura. Sin mencionar el producto todavía.",
  "finalFramePrompt": "Prompt para el fotograma final. El personaje ya mostró el producto y tiene expresión de satisfacción o resultado positivo. En inglés.",
  "fullScript": "El guión completo del video en ${marketDialects[market] ? 'español para mercado ' + market : 'español'}. Conversacional, sin sonar a anuncio. Máximo ${duration === 30 ? '60' : duration === 45 ? '90' : '120'} palabras.",
  "clips": [
    ${Array.from({ length: clipsCount }, (_, i) => `{
      "number": ${i + 1},
      "timestamp": "${i * clipDuration}s - ${(i + 1) * clipDuration}s",
      "script": "Texto exacto que dice la persona en este clip",
      "wordCount": 0,
      "videoPrompt": "Prompt completo en inglés para generar este clip con ${aiModel}. Incluye: descripción del personaje, acción específica, encuadre selfie, luz, fondo, movimiento de cámara natural, expresión facial, qué hace con el producto en este momento."
    }`).join(',\n    ')}
  ],
  "productionNotes": {
    "tool": "Recomendación específica de cómo usar ${aiModel} para este proyecto",
    "avatarConfig": "Cómo configurar el avatar o personaje en ${aiModel} basado en la descripción dada",
    "generationTips": "3-4 tips específicos para generar estos clips con ${aiModel} y obtener el look más orgánico",
    "editingTips": "3-4 tips de edición para ensamblar los clips y hacer el video final más orgánico",
    "tools": ["Lista", "de", "herramientas", "recomendadas", "para", "producción", "y", "edición"]
  }
}`;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.productName) {
      return NextResponse.json({ error: 'Nombre del producto requerido' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: buildPrompt(data)
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return NextResponse.json({ error: 'Error al llamar a la API de IA' }, { status: 500 });
    }

    const result = await response.json();
    const rawText = result.content?.[0]?.text || '';

    // Clean and parse JSON
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Calculate word counts for clips
    if (parsed.clips) {
      parsed.clips = parsed.clips.map((clip: any) => ({
        ...clip,
        wordCount: clip.script ? clip.script.split(/\s+/).length : 0
      }));
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Route error:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
