import { OpenAIStream } from '@/lib/openai-stream';
import { Message } from '@/types/chat';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const runtime = 'edge'; // 强制使用边缘运行时

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Message[] };

  const systemMessage: Message = {
    role: 'system',
    content: ''
  };

  const stream = await OpenAIStream([systemMessage, ...messages]);
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // 禁用缓冲区
    },
  });
}