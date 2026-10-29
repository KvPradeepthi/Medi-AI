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
  Stethoscope,
  HeartPulse,
  Brain,
  ShieldAlert,
  Apple,
} from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

// Intelligent Clinical Fallback Engine when FastAPI microservice is offline or sleeping
const generateClinicalAssistantResponse = (query: string, currentMode: string, currentUser: any): string => {
  const q = query.toLowerCase();

  // 1. Emergency triggers
  if (
    currentMode === "EMERGENCY" ||
    q.includes("chest pain") ||
    q.includes("heart attack") ||
    q.includes("cannot breathe") ||
    q.includes("shortness of breath") ||
    q.includes("stroke") ||
    q.includes("severe bleed") ||
    q.includes("unconscious") ||
    q.includes("emergency")
  ) {
    return (
      "🚨 **EMERGENCY MEDICAL ADVISORY** 🚨\n\n" +
      "If you or someone around you is experiencing acute symptoms such as severe chest pressure, radiating arm or jaw pain, sudden shortness of breath, sudden facial drooping, speech difficulty, or severe bleeding, please **take immediate action**:\n\n" +
      "• **Call emergency services immediately (911 / 112 / 108)** or head to the nearest Emergency Room.\n" +
      "• **Do not drive yourself**; request an ambulance or have someone drive you.\n" +
      "• Sit down comfortably in an upright or slightly reclined position.\n" +
      "• Loosen tight clothing around the neck and waist.\n" +
      "• If prescribed emergency medication (such as nitroglycerin or an inhaler), use it as instructed by your doctor.\n\n" +
      "*(You can also use MediAI's [Emergency SOS](/emergency) button to notify your designated emergency contact directly.)*\n\n" +
      "*Disclaimer: MediAI provides rapid clinical triage guidance and does not replace emergency medical response services.*"
    );
  }

  // 2. CBC / Lab Report analysis
  if (
    currentMode === "REPORTS" ||
    q.includes("cbc") ||
    q.includes("hemoglobin") ||
    q.includes("platelet") ||
    q.includes("wbc") ||
    q.includes("rbc") ||
    q.includes("report")
  ) {
    return (
      `📊 **Clinical Laboratory Markers Guide (CBC & Blood Panels)**\n\n` +
      `Hello ${currentUser?.name || "there"}, here is an interpretation guide for standard diagnostic markers:\n\n` +
      `• **Hemoglobin (Hb):** Reference range is **12.0 – 16.0 g/dL** (females) and **13.5 – 17.5 g/dL** (males). Levels below 12.0 g/dL indicate anemia (often iron or B12 deficiency), which causes fatigue or paleness.\n` +
      `• **White Blood Cells (WBC):** Reference range is **4,000 – 11,000 /µL**. Elevated levels usually signal an active immune response, infection, or inflammation.\n` +
      `• **Platelets:** Reference range is **150,000 – 450,000 /µL**. Essential for blood clotting; low counts (thrombocytopenia) may cause easy bruising.\n` +
      `• **RBC Count:** Reference range is **4.2 – 5.9 million/µL**. Carries oxygen to tissues.\n\n` +
      `💡 *To view your full automated AI breakdown, visit your [Report History](/history) or upload a new file on the [Report Upload](/upload) page.*\n\n` +
      `*Disclaimer: MediAI clinical guidance is educational. Consult your physician for medical diagnosis.*`
    );
  }

  // 3. Diabetes / Blood Sugar / Glucose / HbA1c
  if (
    q.includes("diabet") ||
    q.includes("sugar") ||
    q.includes("glucose") ||
    q.includes("hba1c") ||
    q.includes("insulin")
  ) {
    return (
      `🩺 **Glycemic Health & Diabetes Assessment**\n\n` +
      `Here is the clinical reference breakdown for glucose monitoring:\n\n` +
      `• **Fasting Blood Glucose:**\n` +
      `  - Normal: Under 100 mg/dL\n` +
      `  - Prediabetes: 100 – 125 mg/dL\n` +
      `  - Diabetes: 126 mg/dL or higher (confirmed on repeat testing)\n\n` +
      `• **HbA1c (3-Month Glycemic Average):**\n` +
      `  - Normal: Below 5.7%\n` +
      `  - Prediabetes: 5.7% – 6.4%\n` +
      `  - Target for managed diabetes: Usually under 7.0%\n\n` +
      `🥗 **Actionable Nutrition Steps:**\n` +
      `1. Focus on complex carbohydrates with a low glycemic index (lentils, oats, chia seeds, leafy greens).\n` +
      `2. Minimize refined sugars, white flour, and sweetened sodas.\n` +
      `3. Pair carbohydrates with fiber and protein to slow absorption.\n` +
      `4. Aim for 30 minutes of brisk walking after main meals.\n\n` +
      `*Disclaimer: MediAI clinical guidance is educational. Consult your physician for medical diagnosis.*`
    );
  }

  // 4. Diet / Nutrition / Weight management
  if (
    currentMode === "DIET" ||
    q.includes("diet") ||
    q.includes("food") ||
    q.includes("nutrition") ||
    q.includes("eat") ||
    q.includes("meal") ||
    q.includes("weight")
  ) {
    const allergies = currentUser?.allergies?.length > 0 ? currentUser.allergies.join(", ") : "none logged";
    return (
      `🥗 **Personalized Clinical Diet & Nutrition Guidance**\n\n` +
      `Based on healthy metabolic protocols:\n\n` +
      `• **Breakfast:** Steel-cut oatmeal with blueberries, ground flaxseeds, and unsweetened Greek yogurt or boiled eggs.\n` +
      `• **Lunch:** Mediterranean bowl with quinoa, grilled chicken or tofu, mixed dark greens (spinach, arugula), cucumbers, olive oil, and lemon dressing.\n` +
      `• **Snack:** A handful of raw almonds or walnuts paired with an apple or sliced carrots with hummus.\n` +
      `• **Dinner:** Steamed salmon or lentil dal with roasted broccoli, bell peppers, and brown rice.\n` +
      `• **Hydration Target:** Minimum **2.5 to 3 Liters** of water per day. Limit caffeinated and sugary beverages.\n\n` +
      `*Profile Note: Considering logged allergies (${allergies}), please ensure to substitute conflicting ingredients.*\n\n` +
      `*Disclaimer: MediAI clinical guidance is educational. Consult your physician for medical diagnosis.*`
    );
  }

  // 5. Medicine / Prescription / Dosage
  if (
    currentMode === "MEDICINE" ||
    q.includes("medicine") ||
    q.includes("medication") ||
    q.includes("pill") ||
    q.includes("dose") ||
    q.includes("tablet") ||
    q.includes("prescription")
  ) {
    return (
      `💊 **Medication Safety & Regimen Protocols**\n\n` +
      `When managing pharmaceutical treatments:\n\n` +
      `• **Adherence:** Take your medications at the same time each day to maintain steady therapeutic blood levels.\n` +
      `• **Food Interactions:** Check whether your prescription requires a full meal (to prevent gastric irritation, e.g. NSAIDs) or an empty stomach (e.g. levothyroxine).\n` +
      `• **Missed Dose:** Take it as soon as remembered, unless it is close to your next scheduled dose. **Never double up doses**.\n` +
      `• **Reminders:** Check your active medication alarms on your [Dashboard Reminders](/dashboard).\n\n` +
      `⚠️ *Always consult your prescribing doctor or pharmacist before starting, stopping, or altering any medication dosage.*\n\n` +
      `*Disclaimer: MediAI clinical guidance is educational. Consult your physician for medical diagnosis.*`
    );
  }

  // 6. Blood Pressure / Cardiac
  if (
    q.includes("blood pressure") ||
    q.includes("hypertension") ||
    q.includes("bp") ||
    q.includes("heart") ||
    q.includes("cardio")
  ) {
    return (
      `❤️ **Cardiovascular & Blood Pressure Guidelines**\n\n` +
      `Blood pressure categories recognized by international cardiological standards:\n\n` +
      `• **Normal:** Systolic < 120 mmHg and Diastolic < 80 mmHg\n` +
      `• **Elevated:** Systolic 120 – 129 mmHg and Diastolic < 80 mmHg\n` +
      `• **Stage 1 Hypertension:** Systolic 130 – 139 mmHg or Diastolic 80 – 89 mmHg\n` +
      `• **Stage 2 Hypertension:** Systolic ≥ 140 mmHg or Diastolic ≥ 90 mmHg\n\n` +
      `🌿 **Protective Daily Habits:**\n` +
      `• Restrict sodium intake to less than 2,000 mg daily (avoid processed snacks and canned soups).\n` +
      `• Engage in 150 minutes of aerobic physical activity weekly (brisk walking, swimming, cycling).\n` +
      `• Practice stress-reduction breathing (e.g. 5 minutes of deep diaphragmatic breathing).\n\n` +
      `*Disclaimer: MediAI clinical guidance is educational. Consult your physician for medical diagnosis.*`
    );
  }

  // 7. Mental Wellness / Stress / Sleep
  if (
    currentMode === "MENTAL_WELLNESS" ||
    q.includes("stress") ||
    q.includes("anxiety") ||
    q.includes("sleep") ||
    q.includes("depress") ||
    q.includes("mental") ||
    q.includes("insomnia")
  ) {
    return (
      `🧘 **Mental Wellness & Restorative Health**\n\n` +
      `Self-care protocols for managing stress, cognitive load, and restorative sleep:\n\n` +
      `• **4-7-8 Relaxation Technique:** Inhale through the nose for 4 seconds, hold breath for 7 seconds, exhale completely through the mouth for 8 seconds. Repeat 4 cycles.\n` +
      `• **Circadian Sleep Hygiene:** Stop screen exposure 60 minutes before bed; keep your sleeping room dark and cool (around 18-20°C / 65-68°F).\n` +
      `• **Cognitive Offloading:** Write down pending worries or tasks on a notepad before bed to calm racing thoughts.\n` +
      `• **Support Connection:** Talking to friends, family, or a licensed therapist makes a meaningful clinical difference.\n\n` +
      `*Disclaimer: MediAI clinical guidance is educational. Consult your physician for medical diagnosis.*`
    );
  }

  // 8. General Health / Default
  return (
    `🩺 **MediAI Clinical Guidance**\n\n` +
    `Hello ${currentUser?.name || "Patient"}. Thank you for asking: *"${query}"*.\n\n` +
    `Here are essential health recommendations for optimal wellbeing:\n\n` +
    `• **Daily Vitals:** Maintain consistent hydration (at least 8 glasses of water) and aim for 7 to 8 hours of uninterrupted sleep.\n` +
    `• **Active Monitoring:** Keep your health logs up-to-date in your [Patient Dashboard](/dashboard) to track your wellness score trends.\n` +
    `• **Specialist Consultation:** For specific medical symptoms, diagnosis, or prescription modifications, you can connect directly with our certified physicians on the [Doctor Chat](/chat) page.\n\n` +
    `Feel free to ask more specific questions about **diet plans**, **CBC lab reports**, **blood pressure**, or **medication reminders**!\n\n` +
    `*Disclaimer: MediAI Assistant provides educational health guidance based on clinical standards and does not substitute for a professional physician consultation.*`
  );
};

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
      alert("Speech Recognition API is not supported in this browser. Please use Chrome or Edge.");
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
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\-]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 300));
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
      console.warn("AI service unavailable, activating clinical fallback engine:", err);
      // Clinical fallback engine responds immediately
      const fallbackResponse = generateClinicalAssistantResponse(query, mode, user);
      const assistantMessage: Message = {
        role: "model",
        content: fallbackResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      if (speakOnResponse) {
        speakText(fallbackResponse);
      }
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
            <span className="block text-[10px] text-emerald-400 font-semibold">Active Clinical Intelligence</span>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  active
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Text to Speech toggle */}
        <button
          onClick={() => setSpeakOnResponse(!speakOnResponse)}
          className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
            speakOnResponse
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
          }`}
          title="Toggle Read Response Aloud"
        >
          {speakOnResponse ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-[10px] hidden sm:inline">Voice</span>
        </button>
      </div>

      {/* Chat Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 border border-slate-700 text-emerald-400"
                }`}
              >
                {isUser ? user?.name?.charAt(0) || "U" : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 whitespace-pre-line ${
                  isUser
                    ? "bg-emerald-500 text-slate-950 font-semibold rounded-tr-none shadow-md shadow-emerald-500/10"
                    : "bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none font-medium"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tl-none">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions shortcuts */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-slate-800/60 bg-slate-950/30">
          {suggestedQuestions.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(q.text, q.activeMode)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-slate-400 font-semibold truncate group-hover:text-white">
                  {q.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer Textbox */}
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
