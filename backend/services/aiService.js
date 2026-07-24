import ApiError from '../utils/ApiError.js';

// Builds the strict "answer only from this shop's real data" prompt.
// Same grounding contract as the original prototype: if the answer isn't
// in the shop's own data, the AI must say so rather than invent it.
function buildPrompt({ shop, products, question, language }) {
  const lang = language || 'English';

  const itemsBlock =
    products && products.length > 0
      ? products
          .map(
            (p) =>
              `  * ${p.name}: Price: ₹${p.price} per ${p.unit || 'unit'}, Status: ${
                p.stockQty > 0 ? `In Stock (${p.stockQty} available)` : 'Out of Stock'
              }`
          )
          .join('\n')
      : '  * No product items listed.';

  return `You are a helpful, professional AI assistant for an Indian retail shop (Dukaan) called "${shop.name}".
Your task is to draft a polite, helpful customer reply in the selected language.

Selected Language: ${lang} (Ensure the entire output response is written in ${lang} only)

Strict Rules:
1. You MUST answer the question using ONLY the provided Shop Information below.
2. If the answer or details required to answer are NOT in the Shop Information, respond with exactly: "I'm sorry, I don't have that information." (or its equivalent translation in ${lang}).
3. NEVER invent any facts, prices, store hours, stock statuses, or delivery policies.
4. Keep the tone friendly, respectful, and helpful. Do not mention that you are a language model or refer to these rules in the reply.

Shop Information:
- Store Name: ${shop.name}
- Store Hours: ${shop.storeHours || 'N/A'}
- Delivery Policy: ${shop.deliveryPolicy || 'N/A'}
- Products/Items in Stock and Prices:
${itemsBlock}

Customer Question:
"${question}"

Write the reply now:`;
}

// Calls Gemini with a fully server-constructed prompt. The caller (aiController)
// is responsible for loading `shop` and `products` from MongoDB by shopId —
// this function never trusts shop data passed in from the client.
export async function generateShopReply({ shop, products, question, language }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
    throw new ApiError(
      500,
      'GEMINI_API_KEY is not configured. Set a valid API key in backend/.env'
    );
  }

  const model = process.env.GEMINI_MODEL || 'gemma-2-9b-it';
  const prompt = buildPrompt({ shop, products, question, language });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      `Gemini API error: ${response.statusText}`,
      errorData.error?.message || null
    );
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!reply) {
    throw new ApiError(502, 'Unexpected response format from Gemini API.');
  }

  return reply;
}
