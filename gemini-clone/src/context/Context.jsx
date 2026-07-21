import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

// Converts Gemini markdown-style response to formatted HTML
const formatResponse = (text) => {
    // Handle code blocks (```code```)
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="code-block">${code.trim()}</code></pre>`;
    });

    // Handle inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Handle bold (**text** or __text__)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Handle italic (*text* or _text_)
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');

    // Handle headers (## Heading)
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Handle unordered lists (- item or * item)
    text = text.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    // Collapse consecutive </ul><ul> pairs
    text = text.replace(/<\/ul>\s*<ul>/g, '');

    // Handle numbered lists (1. item)
    text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Handle line breaks — double newline becomes paragraph, single becomes <br>
    const lines = text.split('\n');
    let formatted = '';
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line === '') {
            i++;
            continue;
        }
        // Already an HTML block element, don't wrap
        if (
            line.startsWith('<h1>') ||
            line.startsWith('<h2>') ||
            line.startsWith('<h3>') ||
            line.startsWith('<pre>') ||
            line.startsWith('<ul>') ||
            line.startsWith('<li>')
        ) {
            formatted += line + '\n';
        } else {
            formatted += `<p>${line}</p>\n`;
        }
        i++;
    }

    return formatted;
};

const ContextProvider = (props) => {

    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowresult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [error, setError] = useState(null);

    const onSent = async (prompt) => {
        setResultData("");
        setLoading(true);
        setShowresult(true);
        setError(null);

        try {
            let response;
            if (prompt !== undefined) {
                response = await runChat(prompt);
                setRecentPrompt(prompt);
            } else {
                setPrevPrompts(prev => [...prev, input]);
                setRecentPrompt(input);
                response = await runChat(input);
            }
            setResultData(formatResponse(response));
        } catch (err) {
            console.error("Gemini API error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            setResultData("");
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const newChat = () => {
        setLoading(false);
        setShowresult(false);
        setResultData("");
        setError(null);
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        recentPrompt,
        setRecentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        error,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
