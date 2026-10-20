
const MODEL =
  process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export const llmConfigured = Boolean(
  process.env.GROQ_API_KEY?.trim()
);

export async function summariseCall(call) {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'Groq API key is missing. Set GROQ_API_KEY in backend/.env.'
    );
  }

  if (!call || typeof call !== 'object') {
    throw new Error('Call information is missing.');
  }

  const prompt = `
You are an assistant for a cold-calling application.

Analyze the supplied call record. Use only the information provided.
Never invent prospect statements, outcomes, or completed stages.

Return valid JSON with exactly these fields:
{
  "summary": "A concise summary of the call",
  "outcome": "The latest known call outcome",
  "key_points": ["Important facts from the call"],
  "next_steps": ["Practical next actions"],
  "suggestions": ["Suggestions for the next conversation"]
}

If information is unavailable, say so clearly.
Keep the advice professional and concise.

CALL INFORMATION:
${JSON.stringify(call, null, 2)}
`;

  let response;

  try {
    response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content:
                'Return only valid JSON. Do not include Markdown fences.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          response_format: {
            type: 'json_object'
          }
        })
      }
    );
  } catch (error) {
    throw new Error(
      `Could not connect to Groq: ${error.message}`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.error?.message || 'Unknown Groq API error';

    throw new Error(
      `Groq API error (${response.status}): ${message}`
    );
  }

  const generatedText =
    data?.choices?.[0]?.message?.content?.trim();

  if (!generatedText) {
    throw new Error('Groq returned an empty response.');
  }

  try {
    return JSON.parse(generatedText);
  } catch {
    throw new Error(
      'Groq returned invalid JSON. Please try again.'
    );
  }
}
