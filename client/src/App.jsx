import React, { useState } from "react";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import SummarySection from "./components/SummarySection";
import ChatSection from "./components/ChatSection";
import ConfirmationModal from "./components/ConfirmationModal";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [pdfId, setPDFId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(false);

  // --- Handlers ---

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setSummary("");
    setChatHistory([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setPDFId(data.pdf_id);
      setSummary(data.summary);
    } catch (error) {
      console.error("Upload failed", error);
      setChatHistory([
        { role: "bot", content: "⚠️ Failed to process PDF. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion("");
    setLoadingResponse(true);

    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: currentQuestion },
    ]);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdf_id: pdfId,
          question: currentQuestion,
        }),
      });
      const data = await response.json();

      setChatHistory((prev) => [
        ...prev,
        { role: "bot", content: data.answer },
      ]);
    } catch (error) {
      console.error("Chat failed", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Unable to retrieve answer. Please try again.",
        },
      ]);
    } finally {
      setLoadingResponse(false);
    }
  };

  const handleClearConversation = () => {
    setChatHistory([]);
    setShowConfirmation(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 overflow-hidden">
        <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full">
          <UploadSection
            file={file}
            loading={loading}
            onFileChange={handleFileChange}
            onUpload={handleUpload}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          <SummarySection summary={summary} loading={loading} />
        </div>

        <div className="w-full lg:w-1/2 h-full">
          <ChatSection
            chatHistory={chatHistory}
            question={question}
            setQuestion={setQuestion}
            onAskQuestion={handleAskQuestion}
            onClearChat={() => setShowConfirmation(true)}
            pdfId={pdfId}
            loadingResponse={loadingResponse}
          />
        </div>
      </main>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleClearConversation}
        title="Clear Conversation?"
        message="This will remove all messages from your current chat session."
        type="danger"
      />
    </div>
  );
}

export default App;
