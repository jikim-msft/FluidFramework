/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import {
	makeStyles,
	shorthands,
	Button,
	Input,
	Card,
	Text,
	tokens,
} from "@fluentui/react-components";
import { Send24Regular } from "@fluentui/react-icons";
import React, { useCallback, useEffect, useRef, useState, type ReactElement } from "react";

const useStyles = makeStyles({
	container: {
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
		height: "100%",
		backgroundColor: tokens.colorNeutralBackground1,
	},
	messagesContainer: {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		overflowY: "auto",
		...shorthands.padding("12px"),
		...shorthands.gap("8px"),
	},
	inputContainer: {
		display: "flex",
		...shorthands.gap("8px"),
		...shorthands.padding("12px"),
		borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
		backgroundColor: tokens.colorNeutralBackground2,
	},
	message: {
		maxWidth: "80%",
		...shorthands.padding("8px", "12px"),
		...shorthands.borderRadius("8px"),
		boxShadow: tokens.shadow2,
	},
	userMessage: {
		alignSelf: "flex-end",
		backgroundColor: tokens.colorBrandBackgroundInverted,
		color: "#FFFFFF",
		borderColor: "transparent",
	},
	aiMessage: {
		alignSelf: "flex-start",
		backgroundColor: tokens.colorNeutralBackground3,
	},
	sendButton: {
		minWidth: "32px !important",
		width: "32px !important",
		height: "32px !important",
		padding: "4px !important",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
});

/**
 * Represents a chat message in the conversation.
 */
interface Message {
	/**
	 * Unique identifier for the message
	 */
	id: string;

	/**
	 * Content of the message
	 */
	text: string;

	/**
	 * Indicates whether the message is from the user or AI
	 */
	sender: "user" | "ai";

	/**
	 * When the message was sent
	 */
	timestamp: Date;
}

/**
 * ChatPane component that displays a chat interface for user-AI interaction.
 * @param props - Component properties including container key
 * @returns A React element representing the chat interface
 *
 * @internal
 */
export function ChatPane(): ReactElement {
	const styles = useStyles();
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	/**
	 * Handles sending a new message and simulates an AI response
	 */
	const handleSend = useCallback(() => {
		if (inputText.trim()) {
			const newMessage: Message = {
				id: Date.now().toString(),
				text: inputText,
				sender: "user",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, newMessage]);
			setInputText("");

			// Simulate AI response (this should be replaced with actual AI interaction)
			setTimeout(() => {
				const aiResponse: Message = {
					id: (Date.now() + 1).toString(),
					text: "This is a simulated AI response.",
					sender: "ai",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, aiResponse]);
			}, 1000);
		}
	}, [inputText]);

	/**
	 * Auto-scrolls to the bottom of the chat when new messages are added
	 */
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className={styles.container}>
			<div ref={scrollRef} className={styles.messagesContainer}>
				{messages.map((message) => (
					<Card
						key={message.id}
						className={`${styles.message} ${
							message.sender === "user" ? styles.userMessage : styles.aiMessage
						}`}
					>
						<Text>{message.text}</Text>
					</Card>
				))}
			</div>
			<div className={styles.inputContainer}>
				<Input
					value={inputText}
					onChange={(e) => setInputText(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							handleSend();
						}
					}}
					placeholder="Type a message..."
					style={{ flexGrow: 1 }}
				/>
				<Button
					appearance="primary"
					icon={<Send24Regular />}
					onClick={handleSend}
					disabled={!inputText.trim()}
					className={styles.sendButton}
				/>
			</div>
		</div>
	);
}
