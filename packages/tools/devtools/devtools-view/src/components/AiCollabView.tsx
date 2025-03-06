/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	makeStyles,
	tokens,
	Card,
	CardHeader,
	CardFooter,
	Input,
	Button,
	Text,
} from "@fluentui/react-components";
import { SendRegular } from "@fluentui/react-icons";
import React from "react";

const chatStyles = makeStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalM,
		width: "100%",
		maxWidth: "400px",
		border: `1px solid ${tokens.colorNeutralStroke1}`,
		borderRadius: tokens.borderRadiusMedium,
		backgroundColor: tokens.colorNeutralBackground1,
		padding: tokens.spacingVerticalM,
	},
	messages: {
		flexGrow: 1,
		maxHeight: "300px",
		overflowY: "auto",
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalS,
	},
	messageBubble: {
		padding: tokens.spacingHorizontalM,
		borderRadius: tokens.borderRadiusMedium,
		maxWidth: "80%",
	},
	sent: {
		alignSelf: "flex-end",
		backgroundColor: tokens.colorPaletteRoyalBlueBackground2,
		color: tokens.colorNeutralForegroundOnBrand,
	},
	received: {
		alignSelf: "flex-start",
		backgroundColor: tokens.colorNeutralBackground2,
	},
	inputContainer: {
		display: "flex",
		gap: tokens.spacingHorizontalS,
	},
});

/**
 * TODO
 */
export interface ChatMessage {
	id: string;
	content: string;
	sender: "user" | "bot";
}

/**
 * TODO
 */
export interface ChatProps {
	messages: ChatMessage[];
	onSendMessage: (message: string) => void;
}

/**
 * Chat component for displaying messages and sending new ones.
 *
 * @remarks {@link ThemeContext} must be set in order to use this component.
 */
export function Chat({ messages, onSendMessage }: ChatProps): React.ReactElement {
	const [input, setInput] = React.useState("");
	const styles = chatStyles();

	const handleSend = (): void => {
		if (input.trim()) {
			onSendMessage(input.trim());
			setInput("");
		}
	};

	return (
		<Card className={styles.container}>
			<CardHeader>
				<Text weight="semibold">Chat</Text>
			</CardHeader>
			<div className={styles.messages}>
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`${styles.messageBubble} ${
							msg.sender === "user" ? styles.sent : styles.received
						}`}
					>
						<Text>{msg.content}</Text>
					</div>
				))}
			</div>
			<CardFooter>
				<div className={styles.inputContainer}>
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message..."
						onKeyDown={(e) => e.key === "Enter" && handleSend()}
					/>
					<Button icon={<SendRegular />} onClick={handleSend} />
				</div>
			</CardFooter>
		</Card>
	);
}
