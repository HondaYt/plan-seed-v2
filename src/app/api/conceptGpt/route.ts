import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
	try {
		const { words } = await request.json();

		const prompt = `与えられたキーワードを基に、3つの革新的なプロジェクトコンセプトを日本語で生成してください。
各コンセプトは、核となるアイデアを1つの簡潔な文章で表現してください。

要件:
- 正確に3つのコンセプトを生成
- 各コンセプトは創造的でユニークであること
- プロフェッショナルなトーンを維持
- 日本語で出力
- 番号や接頭辞は含めない
- キーワードを厳密に含める必要はないが、それらに触発された関連するアイデアであること

キーワード: ${words.join(", ")}

以下の形式で厳密に返答してください:
[
  "コンセプト1の内容",
  "コンセプト2の内容",
  "コンセプト3の内容"
]`;

		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content:
						"あなたは正確なJSON形式でのみ応答するアシスタントです。余分な説明や装飾は一切付けずに、配列形式で3つのコンセプトを返してください。",
				},
				{ role: "user", content: prompt },
			],
			model: "gpt-4-turbo",
			temperature: 0.8,
			response_format: { type: "json_object" },
		});

		// nullチェックを追加
		const content = completion.choices[0]?.message?.content;
		if (!content) {
			throw new Error("APIからの応答が不正です");
		}

		try {
			// レスポンスからコンセプトの配列を取得
			const parsedContent = JSON.parse(content);
			const concepts = Array.isArray(parsedContent)
				? parsedContent
				: parsedContent.concepts;

			if (!Array.isArray(concepts) || concepts.length !== 3) {
				throw new Error("不正な形式の応答です");
			}

			return NextResponse.json({ concepts });
		} catch (parseError) {
			console.error("Parse Error:", parseError);
			throw new Error("応答のパースに失敗しました");
		}
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "企画案の生成中にエラーが発生しました" },
			{ status: 500 },
		);
	}
}
