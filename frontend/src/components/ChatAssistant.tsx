import { useState } from "react";
import { FiMessageCircle, FiX } from "react-icons/fi";
import axios from "axios";

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠ Bạn chưa đăng nhập nên không dùng được chatbot." },
      ]);
      setInput("");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "/api/chat",
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.reply || "Không có phản hồi",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lỗi rồi :(( không gọi được server." },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="p-3 bg-blue-600 text-white flex items-center justify-between rounded-t-xl">
            <span className="font-semibold">Carbon Price Assistant</span>
            <button onClick={() => setIsOpen(false)}>
              <FiX size={22} />
            </button>
          </div>

          {/* Message List */}
          <div className="p-3 h-80 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm max-w-[80%] ${
                  m.role === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-100 text-gray-800 mr-auto"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              className="border p-2 rounded w-full text-sm"
              placeholder="Hỏi điều gì đó..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
