"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, RotateCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface ChatbotWidgetProps {
  className?: string;
}

export default function ChatbotWidget({ className = "" }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm EventHub Assistant. How can I help you today? You can ask me about events, booking, or navigating the platform.",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();

  // tRPC mutations
  const chatMutation = api.chatbot.chat.useMutation();
  const quickHelpQuery = api.chatbot.getQuickHelp.useQuery(
    { currentPage: pathname },
    { enabled: isOpen }
  );

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Prepare context
      const context = {
        currentPage: pathname,
        sessionData: session ? {
          isLoggedIn: true,
          userRole: (session.user?.role as "USER" | "ADMIN") || "USER",
          userName: session.user?.name || undefined,
        } : {
          isLoggedIn: false,
        },
      };

      // Get conversation history (last 6 messages to keep context manageable)
      const conversationHistory = messages
        .slice(-6)
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await chatMutation.mutateAsync({
        message: inputMessage.trim(),
        context,
        conversationHistory,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp,
        error: response.error,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble processing your message right now. Please try again later.",
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hi! I'm EventHub Assistant. How can I help you today? You can ask me about events, booking, or navigating the platform.",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-200 ${
        isMinimized ? "w-80" : "w-96"
      }`} style={{ height: isMinimized ? "60px" : "500px" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">EventHub Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearConversation}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "360px" }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : message.error
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {quickHelpQuery.data?.suggestions && (
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Quick help:</p>
                <div className="flex flex-wrap gap-1">
                  {quickHelpQuery.data.suggestions.slice(0, 2).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="text-xs bg-white border border-gray-200 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
