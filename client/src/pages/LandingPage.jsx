import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  Zap, 
  Shield, 
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span>ScholarSense</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-white text-slate-950 text-sm font-bold rounded-full hover:bg-indigo-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 animate-fadeIn">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Chat with your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient">
              Research Papers
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop skimming endless PDFs. Upload your documents and let our AI generate summaries, answer questions, and extract insights in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              Start Researching Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              View Demo
            </a>
          </div>

          {/* Abstract UI Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="relative rounded-xl bg-slate-900/50 border border-white/10 p-2 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden aspect-[16/9] flex flex-col relative">
                 {/* Fake Chat UI */}
                 <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"/>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"/>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"/>
                    </div>
                    <div className="ml-4 w-64 h-2 bg-slate-800 rounded-full" />
                 </div>
                 <div className="flex-1 p-8 flex flex-col gap-6 justify-center max-w-3xl mx-auto w-full">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-800 rounded w-3/4" />
                            <div className="h-4 bg-slate-800 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="flex gap-4 flex-row-reverse">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0" />
                        <div className="space-y-2 flex-1 flex flex-col items-end">
                            <div className="h-4 bg-indigo-900/50 rounded w-2/3" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-800 rounded w-full" />
                            <div className="h-4 bg-slate-800 rounded w-5/6" />
                            <div className="h-4 bg-slate-800 rounded w-4/6" />
                        </div>
                    </div>
                 </div>
                 {/* Floating Badges */}
                 <div className="absolute bottom-10 right-10 bg-slate-900 border border-indigo-500/30 p-4 rounded-xl shadow-xl animate-bounce">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Status</p>
                            <p className="text-sm font-bold text-white">Analysis Complete</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Superpowers for your reading list</h2>
            <p className="text-slate-400">Everything you need to digest complex information faster.</p>
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
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.1] -z-10" />
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to accelerate your research?
            </h2>
            <p className="text-slate-300 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of students and researchers using ScholarSense to save time and learn more.
            </p>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-slate-400" />
            </div>
            <span>ScholarSense</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 ScholarSense AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group">
      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-600">
        <Icon className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}