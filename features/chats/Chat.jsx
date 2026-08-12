import { useEffect, useState, useRef } from "react";
import FeatureLayout from "../../src/components/FeatureLayout";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  
  // State variables
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [initialFetching, setInitialFetching] = useState(true);
  const [error, setError] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages, sendingMessage]);

  // Initial fetch of chat list
  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch all chat threads for user
  const fetchChats = async () => {
    try {
      setInitialFetching(true);
      const res = await fetch(`${BACKEND_URL}/chat`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.chats) {
        setChats(data.chats);
        if (data.chats.length > 0) {
          await fetchChatDetail(data.chats[0]._id);
        }
      } else {
        setError(data.message || "Failed to load chat conversations.");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Unable to connect to server to load chats.");
    } finally {
      setInitialFetching(false);
    }
  };

  // Fetch a specific chat thread with full message history
  const fetchChatDetail = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/chat/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.chat) {
        setSelectedChat(data.chat);
      } else {
        setError(data.message || "Failed to fetch chat details.");
      }
    } catch (err) {
      console.error(`Error fetching chat ${id}:`, err);
      setError("Failed to fetch conversation details.");
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setError("");
    setSendingMessage(true);

    const targetChatId = isCreatingNew ? null : selectedChat?._id;

    if (selectedChat && !isCreatingNew) {
      setSelectedChat((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          { userMessage: messageText, aiResponse: null },
        ],
      }));
    }

    try {
      const res = await fetch(`${BACKEND_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: messageText,
          chatId: targetChatId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send message.");
        if (selectedChat?._id) fetchChatDetail(selectedChat._id);
        return;
      }

      const updatedChatsRes = await fetch(`${BACKEND_URL}/chat`, {
        credentials: "include",
      });
      const updatedChatsData = await updatedChatsRes.json();
      if (updatedChatsData.chats) setChats(updatedChatsData.chats);

      await fetchChatDetail(data.chatId);
      setIsCreatingNew(false);

    } catch (err) {
      console.error("Error sending message:", err);
      setError("Unable to communicate with AI Assistant. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Open modal for deleting chat
  const openDeleteModal = (chat, e) => {
    e?.stopPropagation();
    setChatToDelete(chat);
    setShowDeleteModal(true);
  };

  // Execute deletion after modal confirmation
  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`${BACKEND_URL}/chat/${chatToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const updated = chats.filter((c) => c._id !== chatToDelete._id);
        setChats(updated);
        
        if (selectedChat?._id === chatToDelete._id) {
          if (updated.length > 0) {
            await fetchChatDetail(updated[0]._id);
          } else {
            setSelectedChat(null);
          }
        }
        setShowDeleteModal(false);
        setChatToDelete(null);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete chat.");
      }
    } catch (err) {
      console.error(`Error deleting chat ${chatToDelete._id}:`, err);
      setError("Error deleting conversation.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear all messages in current chat
  const handleClearChat = async () => {
    if (!selectedChat?._id) return;
    if (!window.confirm("Are you sure you want to clear message history for this chat?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/chat/${selectedChat._id}/clear`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        setSelectedChat((prev) => ({ ...prev, messages: [] }));
      } else {
        const data = await res.json();
        setError(data.message || "Failed to clear chat history.");
      }
    } catch (err) {
      console.error("Error clearing chat:", err);
      setError("Error clearing messages.");
    }
  };

  const renderForm = () => (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden transition-all max-w-3xl mx-auto text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-sky-400 mx-auto flex items-center justify-center text-white text-2xl shadow-md">
        💬
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
          Start a new AI Chat Session
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Ask questions, brainstorm ideas, get code explanations, or explore complex topics with Gemini AI.
        </p>
      </div>

      <form onSubmit={handleSendMessage} className="space-y-4 text-left pt-2">
        <div className="relative">
          <textarea
            rows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message or prompt here..."
            disabled={sendingMessage}
            className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition resize-y text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 justify-end">
          {chats.length > 0 && isCreatingNew && (
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={sendingMessage || !inputMessage.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
          >
            {sendingMessage ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Initializing Chat...
              </>
            ) : (
              <>
                <span>Start Conversation</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderHero = () => {
    if (!selectedChat || isCreatingNew) return null;

    return (
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-sky-500 rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase inline-block">
              Active Thread
            </span>
            <span className="text-xs text-indigo-200 truncate">
              • Created {new Date(selectedChat.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-serif font-bold truncate">
            {selectedChat.title || "Chat Conversation"}
          </h2>
        </div>

        {selectedChat.messages?.length > 0 && (
          <button
            onClick={handleClearChat}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white backdrop-blur-md transition cursor-pointer flex items-center gap-1.5"
            title="Clear message history"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear History
          </button>
        )}
      </div>
    );
  };

  const renderSidebar = () => (
    <>
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
        Recent Chats ({chats.length})
      </h3>

      <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
        {chats.map((chat) => {
          const isSelected = selectedChat?._id === chat._id && !isCreatingNew;

          return (
            <div
              key={chat._id}
              onClick={async () => {
                setIsCreatingNew(false);
                await fetchChatDetail(chat._id);
              }}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? "bg-indigo-50/80 border-indigo-200/80 shadow-xs ring-2 ring-indigo-200/50"
                  : "bg-white/60 border-slate-200/80 hover:bg-indigo-50/30 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0">
                <span
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs transition-colors ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  💬
                </span>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {chat.title || "Chat Conversation"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                    {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => openDeleteModal(chat, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 transition cursor-pointer shrink-0"
                title="Delete Chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderTabContent = () => {
    if (isCreatingNew || !selectedChat) return null;

    const messages = selectedChat.messages || [];

    return (
      <div className="flex flex-col h-[520px] justify-between">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <span className="text-3xl">✨</span>
              <p className="text-xs font-medium">No messages yet. Send a message to start chatting!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg._id || idx} className="space-y-3">
                {msg.userMessage && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-gradient-to-r from-indigo-600 to-sky-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs leading-relaxed shadow-xs">
                      {msg.userMessage}
                    </div>
                  </div>
                )}

                {msg.aiResponse ? (
                  <div className="flex justify-start items-start gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      🤖
                    </div>
                    <div className="max-w-[80%] bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-xs leading-relaxed shadow-2xs whitespace-pre-wrap">
                      {msg.aiResponse}
                    </div>
                  </div>
                ) : (
                  sendingMessage && idx === messages.length - 1 && (
                    <div className="flex justify-start items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 animate-bounce">
                        🤖
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                        <span>Gemini is thinking...</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sendingMessage}
            className="flex-1 px-4 py-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={sendingMessage || !inputMessage.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-sky-400 hover:opacity-95 text-white font-semibold text-xs shadow-md disabled:opacity-50 transition cursor-pointer shrink-0"
          >
            {sendingMessage ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    );
  };

  return (
    <>
      <FeatureLayout
        badgeText="AI Assistant"
        title="Gemini AI Chat"
        subtitle="Interactive conversational assistant powered by Gemini 2.5 Flash"
        onBack={() => navigate("/dashboard")}
        loading={loading}
        initialFetching={initialFetching}
        error={error}
        setError={setError}
        isCreatingNew={isCreatingNew}
        setIsCreatingNew={setIsCreatingNew}
        hasItems={chats.length > 0}
        renderForm={renderForm}
        renderHero={renderHero}
        renderSidebar={renderSidebar}
        tabs={[]}
        renderTabContent={renderTabContent}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Delete Chat Conversation?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete <strong className="text-slate-700">"{chatToDelete?.title || "this chat"}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setChatToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteChat}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}