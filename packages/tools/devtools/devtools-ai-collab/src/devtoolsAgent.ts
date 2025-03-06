/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { OpenAI } from "openai";

/**
 * TODO
 * @public
 */
export interface DevtoolsAgentProps {
	/**
	 * The prompt sent by the user
	 */
	prompt: string;

	/**
	 * Topic of the prompt (e.g., "DDS", "Telemetry", etc.) to help the agent understand the context of the prompt
	 */
	promptTopic?: string;
}

/**
 * @public
 */
export class DevtoolsAgent {
	private readonly openai: OpenAI;

	public constructor() {
		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in environment variables
		});
	}

	public async getUserRequest(userRequest: DevtoolsAgentProps): Promise<string | undefined> {
		const body = {
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system" as const,
					content:
						"You are a helpful assistant to the Fluid Framework DevTools, for real-time collaboration across applications.",
				},
				{
					role: "user" as const,
					content: `${userRequest.promptTopic === undefined ? "" : `topic: ${userRequest.promptTopic}\n`}${userRequest.prompt}`,
				},
			],
		};

		try {
			const result = await this.openai.chat.completions.create(body);
			return result.choices[0]?.message?.content ?? undefined;
		} catch (error) {
			console.error("Error fetching response from OpenAI:", error);
			return undefined;
		}
	}
}
