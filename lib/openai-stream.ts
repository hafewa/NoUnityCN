import { Message, StreamResponse } from '@/types/chat';

export async function OpenAIStream(messages: Message[]) {
  if (!process.env.OPENAI_API_URL || !process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_URL or OPENAI_API_KEY is not defined');
  }
  const response = await fetch(process.env.OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') {
              controller.close();
              return;
            }
            if (!line.startsWith('data: ')) continue;

            try {
              const json: StreamResponse = JSON.parse(line.slice(6));
              const content = json.choices[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
              continue;
            }
          }
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return stream;
} 