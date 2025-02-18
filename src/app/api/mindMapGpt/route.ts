import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// const MODEL = "gpt-3.5-turbo";
const MODEL = "gpt-4o";
// const MODEL = "gpt-4o-mini";
const DEFAULT_ERROR_MESSAGE = "An error occurred.";
const DEFAULT_EMPTY_RESPONSE = "No response received.";

const SYSTEM_MESSAGE = `You are an assistant that performs word associations based on specific genres.
When given a word and a genre, return a single word that is:
1. Associated with the input word
2. Relevant to the specified genre
3. Appropriate for brainstorming and ideation
Please return only one word in Japanese.
No explanation needed.`;

interface ChatResponse {
	content: string;
	error?: string;
}

export async function POST(request: Request) {
	try {
		const { message, usedWords, genre } = await request.json();

		if (!message) {
			return NextResponse.json(
				{ error: "A message is required." },
				{ status: 400 },
			);
		}

		const completion = await openai.chat.completions.create({
			messages: [
				{ role: "system", content: SYSTEM_MESSAGE },
				{
					role: "user",
					content: `Please provide one word associated with "${message}" in the genre of "${genre}" in Japanese language.
					Avoid using these previously used words:
					${usedWords.join(", ")}`,
				},
			],
			model: MODEL,
			temperature: 0.7,
		});

		const response: ChatResponse = {
			content:
				completion.choices[0]?.message?.content || DEFAULT_EMPTY_RESPONSE,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("OpenAI API error:", error);

		return NextResponse.json({ error: DEFAULT_ERROR_MESSAGE }, { status: 500 });
	}
}
