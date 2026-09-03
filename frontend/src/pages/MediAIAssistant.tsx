import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { aiAPI } from "../services/api";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Stethoscope,
  HeartPulse,
  Brain,
  ShieldAlert,
  Apple
} from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

const MediAIAssistant: React.FC = () => {
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I am your MediAI Assistant. How can I help you today? You can ask about your symptoms, request a custom diet plan, explain blood test markers, or review your logs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"GENERAL" | "MEDICINE" | "DIET" | "MENTAL_WELLNESS" | "REPORTS" | "EMERGENCY">("GENERAL");
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice Assistant states
  const [isListening, setIsListening] = useState(false);
  const [speakOnResponse, setSpeakOnResponse] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Web Speech API - Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(text);
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error: ", event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Web Speech API - Text to Speech synthesis helper
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel active voice first
      window.speechSynthesis.cancel();
      
      // Strip markdown tags for clean synthesis
      const cleanText = text.replace(/[*#`_\-]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 300)); // cap duration for ease of use
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim() || !user) return;

    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Filter history context payload (last 6 messages to prevent overflow)
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await aiAPI.chatAssistant(
        user._id,
        query,
        mode,
        historyPayload
      );
      
      const assistantMessage: Message = {
        role: "model",
        content: response.data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      if (speakOnResponse) {
        speakText(response.data.response);
      }
    } catch (err) {
      console.error("AI assistant chatbot failure: ", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I am having trouble connecting to the FastAPI AI service. Please make sure the AI service is running at http://localhost:8000.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    { text: "Explain my CBC report", icon: Stethoscope, activeMode: "REPORTS" as const },
    { text: "Analyze my diabetes risk", icon: HeartPulse, activeMode: "GENERAL" as const },
    { text: "Recommend a low-glycemic diet plan", icon: Apple, activeMode: "DIET" as const },
    { text: "Emergency guidelines for chest pain", icon: ShieldAlert, activeMode: "EMERGENCY" as const },
  ];

  const handleSuggestedQuestion = (text: string, activeMode: any) => {
    setMode(activeMode);
    handleSendMessage(text);
  };

  const modeTabs = [
    { key: "GENERAL", name: "General", icon: Brain },
    { key: "MEDICINE", name: "Medicine", icon: Stethoscope },
    { key: "DIET", name: "Diet", icon: Apple },
    { key: "MENTAL_WELLNESS", name: "Mental Care", icon: Sparkles },
    { key: "REPORTS", name: "Reports", icon: HeartPulse },
    { key: "EMERGENCY", name: "Emergency", icon: ShieldAlert },
  ] as const;

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 flex flex-col h-[calc(100vh-160px)] min-h-[500px]">
      
      {/* Top Header Controls */}
      <div className="p-4 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">MediAI Assistant</h3>
            <span className="block text-[10px] text-slate-500">ChromaDB RAG context activated</span>
          </div>
        </div>

        {/* Mode Selector pills */}
        <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 border border-slate-850 rounded-xl">
          {modeTabs.map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                  active
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Audio Synthesis Toggle */}
        <button
          onClick={() => {
            setSpeakOnResponse(!speakOnResponse);
            if (speakOnResponse) window.speechSynthesis.cancel();
          }}
          className={`p-2 rounded-xl border transition ${
            speakOnResponse
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-slate-900 text-slate-500 border-slate-800"
          }`}
          title="Toggle Voice Responses Reading Aloud"
        >
          {speakOnResponse ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* Messages Workspace */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-[80%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                isUser ? "bg-emerald-500 text-slate-950" : "bg-slate-850 text-emerald-400 border border-slate-700/60"
              }`}>
                {isUser ? user?.name.charAt(0).toUpperCase() : "AI"}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isUser
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-slate-100"
                  : "bg-slate-900/40 border border-slate-850 text-slate-300"
              }`}>
                {/* Preformatted text with line breaks */}
                <div className="whitespace-pre-line font-medium">{msg.content}</div>
                
                {/* Voice play button for individual bubbles */}
                {!isUser && (
                  <button
                    onClick={() => speakText(msg.content)}
                    className="mt-2 text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    Read aloud
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="w-8 h-8 rounded-lg bg-slate-850 text-emerald-400 border border-slate-700/60 font-bold text-xs flex items-center justify-center animate-pulse">
              AI
            </div>
            <div className="px-4 py-3 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Quick Panel (Shown only when chat is empty or fresh) */}
      {messages.length <= 1 && (
        <div className="px-6 py-3 border-t border-slate-800/40 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {suggestedQuestions.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.text}
                onClick={() => handleSuggestedQuestion(q.text, q.activeMode)}
                className="p-3 bg-slate-900/40 border border-slate-850 hover:border-emerald-500/20 rounded-xl text-left hover:bg-slate-900/80 transition flex items-center gap-2 group"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-slate-400 font-semibold truncate group-hover:text-white">
                  {q.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer Textbox Box */}
      <div className="p-4 border-t border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-slate-900/50 border border-slate-800 focus-within:border-emerald-500 rounded-2xl"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask MediAI assistant... (Active mode: ${mode.toLowerCase()})`}
            className="w-full pl-4 pr-24 py-3.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {/* Mic trigger voice input */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? "bg-rose-500 text-white pulse-glow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Speak Question"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!input.trim() && !isLoading}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default MediAIAssistant;
