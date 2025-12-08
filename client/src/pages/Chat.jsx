import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../context/api";

// Components
import Sidebar from "../components/chat/Sidebar"; // Ensure this is the updated version from previous steps
import SummaryPanel from "../components/chat/SummaryPanel"; // Ensure this is the updated version

// Icons
import { 
  PanelLeftOpen, 
  PanelRightOpen, 
  Send, 
  Bot, 
  User as UserIcon,
  Menu,
  UploadCloud,
  Loader2
} from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null); // Ref for hidden file upload

  // --- UI State (Toggles) ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  // --- Data State ---
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  
  // --- Loading States ---
  const [loading, setLoading] = useState(false); // For chat response
  const [uploading, setUploading] = useState(false); // For file upload

  // --- 1. Fetch Documents on Load ---
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  // --- 2. Handle Document Selection ---
  const handleSelectDocument = async (pdfId) => {
    // Optimistic UI update
    const doc = documents.find((d) => d.pdf_id === pdfId);
    setActiveDoc(doc);
    setSummary(doc?.summary || "Loading summary...");
    setMessages([]); // Clear previous messages while loading

    // If on mobile, close sidebar on select
    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    try {
      const res = await api.get(`/history/${pdfId}`);
      // Ensure backend history matches UI format (role: 'user'/'assistant')
      const formattedHistory = (res.data.history || []).map(msg => ({
        ...msg,
        role: msg.role === 'bot' ? 'assistant' : msg.role // Normalize 'bot' to 'assistant'
      }));
      setMessages(formattedHistory);
      setSummary(doc?.summary || "No summary available.");
      
      // Auto-open summary on desktop when doc is selected
      if (window.innerWidth >= 1280) setIsSummaryOpen(true);
      
    } catch (err) {
      console.error("Failed to load history", err);
      setMessages([{ role: "assistant", content: "Failed to load chat history." }]);
    }
  };

  // --- 3. Handle File Upload ---
  // Triggered by the hidden input
  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newDoc = {
        pdf_id: res.data.pdf_id,
        title: res.data.title,
        file_name: res.data.file_name,
        summary: res.data.summary,
      };

      setDocuments([newDoc, ...documents]);
      setActiveDoc(newDoc);
      setSummary(res.data.summary);
      setMessages([]);
      setIsSummaryOpen(true); // Open summary panel on new upload
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload PDF");
    } finally {
      setUploading(false);
      // Reset input value to allow uploading same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- 4. Handle Sending Message ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeDoc) return;

    const currentQ = inputMessage;
    setInputMessage(""); // Clear input immediately
    
    // Optimistic User Message
    setMessages((prev) => [...prev, { role: "user", content: currentQ }]);
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        pdf_id: activeDoc.pdf_id,
        question: currentQ,
      });

      // Add Bot Response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error getting response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Handle Delete ---
  const handleDeleteDocument = async (pdfId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      await api.delete(`/document/${pdfId}`);
      setDocuments(docs => docs.filter(d => d.pdf_id !== pdfId));
      
      if (activeDoc && activeDoc.pdf_id === pdfId) {
        setActiveDoc(null);
        setMessages([]);
        setSummary("");
      }
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Could not delete document.");
    }
  };

  // --- 6. Helper for "New Chat" Button ---
  const handleNewChatClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };


  // --- RENDER ---
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative text-slate-200 font-sans">
      
      {/* Hidden Input for File Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        className="hidden" 
        accept="application/pdf"
      />

      {/* --- 1. LEFT SIDEBAR --- */}
      <Sidebar
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        documents={documents}
        activeId={activeDoc?.pdf_id}
        onSelect={handleSelectDocument}
        onDelete={handleDeleteDocument}
        onNewChat={handleNewChatClick} // Connects to hidden input
        userToken={user?.token}
      />

      {/* --- 2. MAIN CONTENT AREA --- */}
      <main 
        className={`
          flex-1 flex flex-col h-full transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-0'} 
          ${isSummaryOpen ? 'xl:mr-96' : 'xl:mr-0'}
        `}
      >
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
           
           <div className="flex items-center gap-3">
             {/* Toggle Sidebar Button */}
             {!isSidebarOpen && (
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                 title="Open Sidebar"
               >
                 <PanelLeftOpen className="w-5 h-5" />
               </button>
             )}
             
             {/* Mobile Menu Button */}
             <button 
                className="lg:hidden p-2 text-slate-400"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             >
                <Menu className="w-6 h-6" />
             </button>

             <h1 className="font-medium text-slate-200 truncate max-w-[200px] md:max-w-md">
               {activeDoc?.title || "Select a document"}
             </h1>
           </div>

           {/* Toggle Summary Button */}
           <div className="flex items-center">
             {!isSummaryOpen && activeDoc && (
               <button 
                 onClick={() => setIsSummaryOpen(true)}
                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 transition-all"
               >
                 <PanelRightOpen className="w-4 h-4" />
                 <span className="hidden sm:inline">View Summary</span>
               </button>
             )}
           </div>
        </header>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth">
           {!activeDoc ? (
             // --- EMPTY STATE / WELCOME SCREEN ---
             <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    {uploading ? (
                         <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    ) : (
                         <UploadCloud className="w-10 h-10 text-slate-400" />
                    )}
                </div>
                <h2 className="text-xl font-semibold text-slate-300">
                    {uploading ? "Analyzing Document..." : "Start Your Research"}
                </h2>
                <p className="max-w-md text-center text-sm">
                    {uploading 
                        ? "Please wait while we process your PDF and generate a summary."
                        : "Upload a PDF document to generate a summary and start chatting with our AI assistant."
                    }
                </p>
                {!uploading && (
                    <button 
                        onClick={handleNewChatClick}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Upload PDF
                    </button>
                )}
             </div>
           ) : (
             // --- CHAT MESSAGES ---
             <>
                {messages.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Bot className="w-12 h-12 mb-2" />
                        <p>Ask a question about this document.</p>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                        ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-700'}
                        `}>
                            {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        {/* Bubble */}
                        <div className={`
                        p-4 rounded-2xl text-sm leading-relaxed
                        ${msg.role === 'user' 
                            ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/20 rounded-tr-sm' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-sm'}
                        `}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Loading Indicator for Chat */}
                {loading && (
                   <div className="flex gap-4 max-w-3xl mx-auto">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-700">
                             <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                             </div>
                        </div>
                   </div>
                )}
             </>
           )}
        </div>

        {/* Chat Input Area */}
        {activeDoc && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/30">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={loading ? "Waiting for response..." : "Ask about your document..."}
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-lg disabled:opacity-50"
                />
                <button 
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
            <p className="text-center text-xs text-slate-500 mt-2">
                ScholarSense can make mistakes. Consider checking important information.
            </p>
            </div>
        )}

      </main>

      {/* --- 3. RIGHT SUMMARY PANEL --- */}
      <SummaryPanel 
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        summary={summary}
        title={activeDoc?.title}
      />

    </div>
  );
}