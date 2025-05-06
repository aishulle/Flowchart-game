'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import FlowchartGame from '@/components/FlowchartGame';
import Queryflowchart from '@/components/Queryflowchart';

type Question = {
  id: number;
  title: string;
  description: string;
};

const questions: Question[] = [
  {
    id: 1,
    title: 'Multiple data sources',
    description: 'Transformation of multiple data sources to knowledge base',
  },
  {
    id: 2,
    title: 'Query Processing and AI Engine',
    description: 'Route user queries through a processing pipeline for AI response generation.',
  },
];

export default function DragDropPage() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  return (
    <main className="min-h-screen bg-purple-900 text-white">
      <header className="flex items-center justify-between px-6 py-3 bg-purple-800 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-full p-1">
            <Image src="/assets/hidevss.png" alt="Logo" width={36} height={36} />
          </div>
          <span className="text-xl font-bold text-white">Hidevs</span>
        </div>
      </header>

      {!selectedQuestion ? (
        <section
          className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 text-center"
          role="main"
        >
          <h1 className="text-2xl font-bold mb-2">Choose a Flowchart Challenge</h1>
          <p className="text-sm text-white/80 mb-6 max-w-xl">
            Drag components from the canvas and connect them to build the correct workflow.
            Submit your flow to get feedback. Use "Show Solution" if you're stuck!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuestion(q)}
                className="cursor-pointer p-6 bg-white text-black border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-200"
              >
                <h2 className="text-xl font-semibold mb-2">{q.title}</h2>
                <p className="text-sm text-gray-700">{q.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : selectedQuestion.id === 1 ? (
        <FlowchartGame question={selectedQuestion} onBack={() => setSelectedQuestion(null)} />
      ) : selectedQuestion.id === 2 ? (
        <Queryflowchart question={selectedQuestion} onBack={() => setSelectedQuestion(null)} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center">
          <h2 className="text-xl font-bold mb-2">Unknown Question</h2>
          <button
            onClick={() => setSelectedQuestion(null)}
            className="mt-4 px-4 py-2 bg-white text-purple-900 rounded-lg shadow hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      )}
    </main>
  );
}
