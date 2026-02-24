const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// 初始化 OpenAI 客户端
const client = new OpenAI({
    apiKey: process.env.SILICONFLOW_API_KEY,
    baseURL: process.env.SILICONFLOW_BASE_URL
});

// 系统提示词配置
const SYSTEM_PROMPTS = {
    default: "你是一个专业的 Markdown 技术文档写作助手。请直接输出内容，不要包含'好的'、'这是结果'等废话。严格遵循 Markdown 语法。如果用户要求生成代码，请使用正确的代码块格式。数学公式请使用 LaTeX 格式（$$...$$）。",
    polishing: "你是一个专业的编辑。请优化以下文本的语言表达，使其更加流畅、专业，保持原意不变。直接输出修改后的文本，不要有任何解释。",
    continuation: "你是一个富有创意的作家。根据上下文，继续完成后续内容的撰写。保持风格一致。",
    explain: "你是一个耐心的老师。请解释选中的文本或概念，用通俗易懂的语言，必要时给出例子。"
};

// 流式接口
router.post('/stream', async (req, res) => {
    const { prompt, selection, type = 'default' } = req.body;

    // 设置 SSE 头部
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.default;
        
        let userContent = prompt;
        if (selection) {
            userContent = `Context/Selection:\n${selection}\n\nTask:\n${prompt}`;
        }

        const stream = await client.chat.completions.create({
            model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V3',
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            stream: true,
            temperature: 0.7,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                // 发送数据块，格式为 data: <content>\n\n
                // 注意需要转义换行符，或者直接发送 JSON
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('AI Stream Error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

module.exports = router;
