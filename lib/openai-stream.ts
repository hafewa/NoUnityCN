import { Message, StreamResponse } from '@/types/chat';

// 强制使用 Edge Runtime 以获得最佳流式支持并禁用 Vercel 缓冲
export const runtime = 'edge';

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
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      // --- 关键：用于存储不完整数据块的缓冲区 ---
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          // 将新读取的二进制数据解码并追加到缓冲区
          buffer += decoder.decode(value, { stream: true });

          // SSE 协议通过换行符 \n 或 \n\n 分隔消息块
          const lines = buffer.split('\n');
          
          // 重要：pop() 弹出最后一行，如果它不完整，就留在 buffer 里等下一轮拼接
          // 如果 buffer 正好以 \n 结尾，那么 pop() 出来的是空字符串，buffer 也会被清空
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // 跳过空行
            if (!trimmedLine) continue;

            // 检查流是否结束
            if (trimmedLine === 'data: [DONE]') {
              controller.close();
              return;
            }

            // 只处理以 data: 开头的内容
            if (trimmedLine.startsWith('data: ')) {
              const rawJson = trimmedLine.slice(6);
              
              try {
                const json: StreamResponse = JSON.parse(rawJson);
                const content = json.choices[0]?.delta?.content;
                
                if (content) {
                  // 将提取出的文字重新编码并推入 ReadableStream
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // 如果解析失败，说明 split 可能切错了（极少见），尝试把这行放回 buffer
                console.error('Error parsing JSON chunk:', e);
                buffer = trimmedLine + '\n' + buffer;
              }
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