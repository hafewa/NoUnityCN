import { OpenAIStream } from '@/lib/openai-stream';
import { Message } from '@/types/chat';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Message[] };

  const systemMessage: Message = {
    role: 'system',
    content: '你是NoUnityCN Copilot，一个Unity下载助手。你可以帮助用户下载Unity和相关组件。请用中文回答。'
  };

  const stream = await OpenAIStream([systemMessage, ...messages]);
  return new Response(stream);
} 