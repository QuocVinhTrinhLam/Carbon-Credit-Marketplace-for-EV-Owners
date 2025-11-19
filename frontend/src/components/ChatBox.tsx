import { useState } from "react";
import axios from "axios";
import { FiMessageCircle, FiX } from "react-icons/fi";

const ChatBox = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Thêm tin nhắn user vào UI
    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const token = localStorage.getItem("token"); // lấy token để gửi cho backend

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
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lỗi rồi, thử lại giúp mình nhé! 😢" },
      ]);
    }

    setInput("");
  };

  return (
    <>
      {/* BUTTON FLOATING */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* POPUP CHAT */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-xl border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-xl">
            <span>Carbon Assistant</span>
            <button onClick={() => setOpen(false)}>
              <FiX size={22} />
            </button>
          </div>

          {/* Messages */}
          <div className="p-3 h-80 overflow-y-auto space-y-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg text-sm ${
                  m.role === "user"
                    ? "bg-blue-500 text-white ml-auto max-w-[80%]"
                    : "bg-gray-100 text-gray-800 mr-auto max-w-[80%]"
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
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
