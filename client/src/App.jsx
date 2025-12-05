import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, Send, Bot, User, Loader2 } from 'lucide-react';

import './app.css';

const API_URL = "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setSummary("");
    setChatHistory([]);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSessionId(response.data.session_id);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to process PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !sessionId) return;

    const currentQuestion = question;
    setQuestion(""); // Clear input immediately
    
    // Add user message to history
    setChatHistory(prev => [...prev, { role: 'user', content: currentQuestion }]);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        session_id: sessionId,
        question: currentQuestion
      });

      // Add bot response to history
      setChatHistory(prev => [...prev, { role: 'bot', content: response.data.answer }]);
    } catch (error) {
      console.error("Chat failed", error);
      setChatHistory(prev => [...prev, { role: 'bot', content: "Error: Could not get answer." }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center gap-2">
          <FileText size={28} />
          <h1 className="text-2xl font-bold">Research Assistant AI</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        
        {/* Left Panel: Upload & Summary */}
        <div className="w-full md:w-1/2 flex flex-col gap-4 overflow-hidden">
          
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">1. Upload Research Paper</h2>
            <div className="flex gap-4 items-center">
              <input 
                type="file" 
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition
                  ${!file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20}/>}
                Analyze
              </button>
            </div>
          </div>

          {/* Summary Display */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 sticky top-0 bg-white pb-2 border-b">
              Document Summary
            </h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <Loader2 className="animate-spin mb-2" size={32}/>
                <p>Reading paper and generating summary...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-indigo max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-400 text-center mt-10 italic">
                Upload a PDF to see the structured summary here.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chatbot */}
        <div className="w-full md:w-1/2 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-100 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Bot size={24} className="text-indigo-600"/> 
              Ask Questions
            </h2>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                <p>Ask anything about the uploaded paper.</p>
                <p className="text-sm mt-2">e.g., "What is the accuracy of the proposed model?"</p>
              </div>
            )}
            
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={sessionId ? "Type your question..." : "Upload a file to start chatting"}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                disabled={!sessionId}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              />
              <button 
                onClick={handleAskQuestion}
                disabled={!sessionId || !question.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;