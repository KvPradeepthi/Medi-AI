import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { chatAPI, userAPI } from "../services/api";
import { IChatMessage, IUser } from "../types";
import { io, Socket } from "socket.io-client";
import { MessageSquare, Send, Paperclip, ArrowLeft, Volume2 } from "lucide-react";

const DoctorChat: React.FC = () => {
  const { user } = useAuth();

  const [contacts, setContacts] = useState<IUser[]>([]);
  const [selectedContact, setSelectedContact] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [input, setInput] = useState("");
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat contacts list depending on role
  useEffect(() => {
    const loadContacts = async () => {
      try {
        if (user?.role === "patient") {
          // Patients chat with approved doctors
          const res = await userAPI.getDoctorsList("approved");
          setContacts(res.data);
        } else if (user?.role === "doctor") {
          // Doctors chat with active patients
          const res = await userAPI.getPatientsList();
          setContacts(res.data);
        }
      } catch (err) {
        console.error("Failed to load contacts list: ", err);
      }
    };
    loadContacts();
  }, [user]);

  // Setup Socket.io client gateway connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on("receive_message", (message: IChatMessage) => {
      // Append message if it belongs to active thread
      if (
        (message.senderId === user?._id && message.receiverId === selectedContact?._id) ||
        (message.senderId === selectedContact?._id && message.receiverId === user?._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedContact, user]);

  // Join Socket.io room on contact selection
  const handleSelectContact = async (contact: IUser) => {
    setSelectedContact(contact);
    setMessages([]);

    if (user && socketRef.current) {
      socketRef.current.emit("join_room", {
        senderId: user._id,
        receiverId: contact._id,
      });
    }

    try {
      const historyRes = await chatAPI.getHistory(contact._id);
      setMessages(historyRes.data);
    } catch (err) {
      console.error("Failed to fetch chat logs: ", err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !selectedContact || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      senderId: user._id,
      receiverId: selectedContact._id,
      messageType: "text",
      content: input,
    });

    setInput("");
  };

  // Web Speech Text to Speech for read aloud in chat bubbles
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 flex h-[calc(100vh-160px)] min-h-[500px] overflow-hidden">
      
      {/* Contacts List sidebar drawer */}
      <div className="w-80 border-r border-slate-800/80 bg-slate-950/20 flex flex-col">
        <div className="p-4 border-b border-slate-800/85">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-emerald-400" />
            Active Consultations
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No active chat contacts available.</p>
          ) : (
            contacts.map((contact) => {
              const active = selectedContact?._id === contact._id;
              return (
                <div
                  key={contact._id}
                  onClick={() => handleSelectContact(contact)}
                  className={`p-3 border rounded-2xl cursor-pointer transition flex items-center gap-3 ${
                    active ? "bg-emerald-500/10 border-emerald-500/40" : "bg-slate-900/30 border-slate-850 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{contact.name}</h4>
                    <p className="text-[9px] text-slate-500 capitalize">{contact.role} • {contact.specialization || "General"}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Workspace */}
      <div className="flex-1 flex flex-col bg-slate-950/10 justify-between">
        {!selectedContact ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 h-full">
            <MessageSquare className="w-12 h-12 text-slate-650 mb-4" />
            <h4 className="text-sm font-bold text-white tracking-tight">Select Chat Partner</h4>
            <p className="text-xs text-slate-600 mt-1">Select a patient or doctor to start real-time messaging consultation.</p>
          </div>
        ) : (
          <>
            {/* Active Contact Info bar */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-xs">
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{selectedContact.name}</h4>
                <p className="text-[9px] text-slate-500 capitalize">{selectedContact.role} • Online</p>
              </div>
            </div>

            {/* Message Bubble Panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg) => {
                const isMine = msg.senderId === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex gap-3 max-w-[70%] ${isMine ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div className={`p-4.5 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? "bg-emerald-500 text-slate-950 font-semibold"
                        : "bg-slate-900 border border-slate-850 text-slate-300 font-medium"
                    }`}>
                      <div>{msg.content}</div>
                      
                      {/* TTS read aloud for chat messages */}
                      <button
                        onClick={() => speakText(msg.content)}
                        className={`mt-1 text-[9px] flex items-center gap-1.5 ${isMine ? "text-slate-900/60 hover:text-slate-950" : "text-slate-500 hover:text-slate-300"}`}
                      >
                        <Volume2 className="w-3 h-3" />
                        Listen
                      </button>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Text Input field */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
              <form onSubmit={handleSendMessage} className="relative flex items-center bg-slate-900/40 border border-slate-800 focus-within:border-emerald-500 rounded-2xl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full pl-4 pr-16 py-3.5 bg-transparent text-xs text-white focus:outline-none"
                />

                <div className="absolute right-2.5 flex items-center gap-1">
                  <button type="submit" className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default DoctorChat;
