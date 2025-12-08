import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span>ScholarSense</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#features"
              className="hover:text-indigo-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-indigo-600 transition-colors"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="hover:text-indigo-600 transition-colors"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-200/30 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-indigo-600 text-xs font-medium mb-8 shadow-sm animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight text-slate-900">
            Chat with your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient">
              Research Papers
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop skimming endless PDFs. Upload your documents and let our AI
            generate summaries, answer questions, and extract insights in
            seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Start Researching Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              View Demo
            </a>
          </div>

          {/* Abstract UI Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="relative rounded-xl bg-white/60 border border-white/40 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-lg bg-white border border-slate-200 overflow-hidden aspect-[16/9] flex flex-col relative shadow-inner">
                {/* Fake Chat UI */}
                <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="ml-4 w-64 h-2 bg-slate-200 rounded-full" />
                </div>
                <div className="flex-1 p-8 flex flex-col gap-6 justify-center max-w-3xl mx-auto w-full bg-white">
                  {/* Bot Bubble */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-indigo-600 rounded-full" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  {/* User Bubble */}
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="space-y-2 flex-1 flex flex-col items-end">
                      <div className="h-8 bg-indigo-600 rounded-2xl w-2/3 shadow-md shadow-indigo-200" />
                    </div>
                  </div>
                </div>
                {/* Floating Badges */}
                <div className="absolute bottom-10 right-10 bg-white border border-slate-100 p-4 rounded-xl shadow-xl animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="text-sm font-bold text-slate-900">
                        Analysis Complete
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Superpowers for your reading list
            </h2>
            <p className="text-slate-500 text-lg">
              Everything you need to digest complex information faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="Instant Summaries"
              desc="Get key takeaways, methodology, and conclusions extracted automatically from any PDF."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Interactive Q&A"
              desc="Ask specific questions about the data. It's like having the author available to chat 24/7."
            />
            <FeatureCard
              icon={FileText}
              title="Citation Extraction"
              desc="Need references? The AI pinpoints exactly where information comes from within the document."
            />
            <FeatureCard
              icon={Shield}
              title="Private & Secure"
              desc="Your research data is encrypted and stored securely. We respect your intellectual property."
            />
            <FeatureCard
              icon={Cpu}
              title="Advanced RAG Models"
              desc="Powered by state-of-the-art Embeddings and LLMs for high-accuracy responses."
            />
            <FeatureCard
              icon={CheckCircle2}
              title="History Tracking"
              desc="Never lose a thought. Access your previous chats and document summaries anytime."
            />
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-indigo-600 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">
              Ready to accelerate your research?
            </h2>
            <p className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto relative z-10">
              Join thousands of students and researchers using ScholarSense to
              save time and learn more.
            </p>
            <Link
              to="/register"
              className="relative z-10 inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span>ScholarSense</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 ScholarSense AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all group">
      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-600">
        <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
