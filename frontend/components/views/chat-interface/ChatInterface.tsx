"use client";

import { useState } from "react";

// Declaring the structure of a message
type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

export default function ChatInterface() {
  // State stores a list of messages.
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      text: "I have 10,000 USDC on the Arbitrum network. Please find me a safe strategy with an APY above 10%.",
      timestamp: "10:24 AM",
    },
  ]);

  // State stores the content the user is typing in the Input field.
  const [inputValue, setInputValue] = useState("");

  // This function handles the response when the user clicks Submit (or Enter).
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    //Prevent the browser from reloading the page.

    if (!inputValue.trim()) return;
    //Not send blank messages.

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    //Create new messages for user
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: currentTime,
    };

    //Update the message array (keep the old messages, add new ones to the end).
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    //Clear the input field after submitting.

    // 5. Giả lập AI Dolfin đang suy nghĩ và trả lời sau 3 giây
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Dolfin is analyzing liquidity on Arbitrum... The system has recorded your request.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black text-white p-8 font-sans max-w-4xl mx-auto">
      <div className="border-b border-[#262626] pb-6 mb-10 flex justify-between items-end">
        <h1 className="text-xl font-normal uppercase tracking-[4px] text-white">
          Intelligence Console
        </h1>
        <span className="text-[#666666] text-[11px] font-mono uppercase tracking-[3px]">
          System: Online
        </span>
      </div>

      {/* Chat History: Iterate through the message array to render. */}
      <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar mb-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <span className="text-[#666666] text-[11px] font-mono uppercase tracking-[4px] mb-3">
              {msg.sender === "user" ? "User" : "System"} — {msg.timestamp}
            </span>
            <p
              className={`font-serif text-xl leading-relaxed ${msg.sender === "user" ? "text-white" : "text-blue-400"}`}
            >
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="relative mt-auto pt-8">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="ENTER COMMAND OR QUERY..."
          className="
      w-full 
      bg-transparent 
      border-t-0 border-l-0 border-r-0 border-b 
      border-[#3a3a3a] 
      focus:ring-0 focus:border-white focus:outline-none
      
      py-3 pl-0 pr-12 
      text-white 
      font-mono 
      text-[11px] 
      uppercase 
      tracking-[2.5px] 
      
      placeholder:text-[#666666] 
      transition-all duration-500
    "
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="
      absolute right-0 top-1/2 -translate-y-1/2 
      text-[#999999] hover:text-white 
      transition-colors 
      disabled:opacity-0 
    "
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="square" />
          </svg>
        </button>
      </form>
    </div>
  );
}
