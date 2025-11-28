import AskAI from "@/components/section/AskAI";

export default function DiscussPage() {
  return (
    <div className="min-h-screen  text-white flex flex-col items-center justify-center p-6">
      {/* Header */}
      <header className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">DSA Chat Assistant</h1>
        <p className="text-gray-400">
          Ask anything related to Data Structures & Algorithms
        </p>
      </header>

      {/* Chat Container */}
      <main className="w-full   rounded-2xl shadow-xl p-6 flex flex-col justify-center max-w-7xl gap-6">
        <AskAI />
      </main>

      {/* Footer / Info */}
      
    </div>
  );
}
