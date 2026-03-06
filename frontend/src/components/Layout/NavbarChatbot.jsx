import { useEffect, useRef, useState } from "react";
import apiClient from "../../lib/apiClient";

export default function NavbarChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I am your LearnSphere assistant. Ask me anything about your learning.",
    },
  ]);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    try {
      const res = await apiClient.post("/chat", { message: text });
      const reply =
        typeof res?.data?.reply === "string" && res.data.reply.trim()
          ? res.data.reply.trim()
          : "I could not generate a reply right now.";
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="text-sm font-medium text-slate-700 hover:text-blue-700"
        onClick={() => setOpen((prev) => !prev)}
      >
        Chatbot
      </button>

      {open ? (
        <div className="absolute right-0 top-9 z-30 w-[340px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 border-b border-slate-100 pb-2">
            <p className="text-sm font-semibold text-slate-900">LearnSphere Assistant</p>
            <p className="text-xs text-slate-500">Powered by Hugging Face</p>
          </div>

          <div ref={listRef} className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {message.role === "assistant" ? (
                  <AssistantMessage content={message.content} />
                ) : (
                  message.content
                )}
              </div>
            ))}
            {sending ? <p className="text-xs text-slate-500">Thinking...</p> : null}
          </div>

          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your question..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function AssistantMessage({ content }) {
  const text = typeof content === "string" ? content : "";
  return <p className="whitespace-pre-wrap">{text}</p>;
}
