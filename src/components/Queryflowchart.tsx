'use client';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';

// ========== SOUND MANAGER ========== //
const CustomNode = ({ id, data, selected }: { id: string; data: any; selected?: boolean }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: selected ? 1.05 : 1, // Slightly larger when selected
      opacity: 1 
    }}
    transition={{ type: "spring", stiffness: 300 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`p-3 bg-white rounded-lg shadow-md transition-all
      ${selected 
        ? 'border-2 border-purple-600 shadow-lg' // Purple border when selected
        : 'border-2 border-purple-500'}`} // Normal purple border
  >
    {data.label}
  </motion.div>
);
const sounds = {
  connect: new Howl({ src: ['/sounds/connect.mp3'], volume: 0.7 }),
  success: new Howl({ src: ['/sounds/success.mp3'] }),
  error: new Howl({ src: ['/sounds/error.mp3'], volume: 0.5 })
};

// Node templates for Query Flow
const nodeTemplates = [
  { 
    label: 'User', 
    description: 'Initiates the query and receives final results' 
  },
  { 
    label: 'Knowledge Base', 
    description: 'Structured data repository for information retrieval' 
  },
  { 
    label: 'AI Engine (Chain)', 
    description: 'Orchestrates the query processing pipeline' 
  },
  { 
    label: 'Retriever', 
    description: 'Fetches relevant information from knowledge base' 
  },
  { 
    label: 'LLM Model', 
    description: 'Generates responses using language understanding' 
  },
  { 
    label: 'Prompt Template', 
    description: 'Structures the input for consistent LLM processing' 
  },
  { 
    label: 'Output/Results Formatted', 
    description: 'Final presentation-ready response to user' 
  },
  { 
    label: 'Evaluation', 
    description: 'Assesses quality of generated responses' 
  },
  { 
    label: 'API Endpoints', 
    description: 'System integration points for external applications' 
  },
  { 
    label: 'Human Feedback', 
    description: 'User corrections to improve future responses' 
  }
];

// Expected flow connections
const expectedFlow = [
  ['User', 'Knowledge Base'],
  ['Knowledge Base', 'AI Engine (Chain)'],
  ['AI Engine (Chain)', 'Retriever'],
  ['Retriever', 'LLM Model'],
  ['LLM Model', 'Prompt Template'],
  ['Prompt Template', 'Output/Results Formatted'],
  ['Output/Results Formatted', 'User'],
  ['Output/Results Formatted', 'Evaluation'],
  ['Evaluation', 'Human Feedback'],
  ['Human Feedback', 'Prompt Template'],
  ['AI Engine (Chain)', 'API Endpoints']
];

const learningGoals = [
  "Trace the complete query lifecycle from user input to formatted response",
  "Understand how retrieval-augmented generation combines knowledge bases with LLMs",
  "Recognize the role of feedback loops in improving response quality"
];

const workflowTips = [
  "Start with User → Knowledge Base as entry point",
  "Connect AI Engine to both Retriever and API Endpoints",
  "Ensure Evaluation receives Output and feeds to Human Feedback",
  "Close the loop by connecting Human Feedback back to Prompt Template"
];

interface NodeInfo {
  x: number;
  y: number;
  label: string;
  description: string;
}

interface ResultData {
  accuracy: string;
  correct: number;
  total: number;
  feedback: string;
}

const FloatingText = ({ text, x, y }: { text: string; x: number; y: number }) => (
  <motion.div
    className="fixed pointer-events-none text-lg font-bold text-purple-600"
    style={{ left: x, top: y }}
    initial={{ y: 0, opacity: 1 }}
    animate={{ y: -50, opacity: 0 }}
    transition={{ duration: 1 }}
  >
    {text}
  </motion.div>
);

export default function QueryFlowchart() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showNodeInfo, setShowNodeInfo] = useState<NodeInfo | null>(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [feedback, setFeedback] = useState<{text: string, x: number, y: number} | null>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Preload sounds
  useEffect(() => {
    sounds.connect.load();
    sounds.success.load();
    sounds.error.load();

    return () => {
      sounds.connect.unload();
      sounds.success.unload();
      sounds.error.unload();
    };
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    sounds.connect.play();
    setEdges((eds) => addEdge({ ...connection, markerEnd: { type: MarkerType.Arrow } }, eds));
  }, [setEdges]);

  const addNode = (label: string) => {
    const id = uuidv4();
    const x = 250 + Math.random() * 400;
    const y = 100 + nodes.length * 80;
    const newNode: Node = {
      id,
      type: 'custom',
      position: { x, y },
      data: { 
        label,
        onMouseEnter: (event: React.MouseEvent) => {
          const nodeTemplate = nodeTemplates.find(t => t.label === label);
          if (nodeTemplate) {
            setShowNodeInfo({
              x: event.clientX + 10,
              y: event.clientY + 10,
              label: nodeTemplate.label,
              description: nodeTemplate.description
            });
          }
        },
        onMouseLeave: () => setShowNodeInfo(null)
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSubmit = () => {
    let correct = 0;
    expectedFlow.forEach(([srcLabel, tgtLabel]) => {
      const srcNode = nodes.find((n) => n.data.label === srcLabel);
      const tgtNode = nodes.find((n) => n.data.label === tgtLabel);
      if (srcNode && tgtNode) {
        const match = edges.find((e) => e.source === srcNode.id && e.target === tgtNode.id);
        if (match) correct++;
      }
    });

    // Play appropriate sound
    if (correct / expectedFlow.length >= 0.7) {
      sounds.success.play();
      triggerConfetti();
    } else {
      sounds.error.play();
    }

    const accuracy = ((correct / expectedFlow.length) * 100).toFixed(1);
    let feedback = '';
    if (parseFloat(accuracy) >= 90) {
      feedback = 'Excellent! You perfectly understand the query flow.';
    } else if (parseFloat(accuracy) >= 70) {
      feedback = 'Good job! You understand most key connections.';
    } else if (parseFloat(accuracy) >= 50) {
      feedback = 'Partial understanding. Review the solution.';
    } else {
      feedback = 'Keep trying! Study the components and try again.';
    }

    setResult({
      accuracy,
      correct,
      total: expectedFlow.length,
      feedback
    });
    setShowResultOverlay(true);
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setResult(null);
    setShowSolution(false);
    setShowResultOverlay(false);
  };

  const handleShowSolution = () => {
    const nodeMap: Record<string, Node> = {};
    const createdNodes: Node[] = [];
    const solutionEdges: Edge[] = [];
  
    const nodePositions: Record<string, { x: number; y: number }> = {
      'User': { x: 400, y: 50 },
      'Knowledge Base': { x: 200, y: 150 },
      'AI Engine (Chain)': { x: 400, y: 250 },
      'Retriever': { x: 250, y: 350 },
      'LLM Model': { x: 400, y: 350 },
      'Prompt Template': { x: 400, y: 450 },
      'Output/Results Formatted': { x: 400, y: 550 },
      'Evaluation': { x: 250, y: 650 },
      'Human Feedback': { x: 150, y: 750 },
      'API Endpoints': { x: 550, y: 350 }
    };
  
    expectedFlow.forEach(([srcLabel, tgtLabel], index) => {
      if (!nodeMap[srcLabel]) {
        const node = {
          id: uuidv4(),
          type: 'custom', // Changed from 'default' to 'custom'
          position: nodePositions[srcLabel],
          data: { 
            label: srcLabel,
            onMouseEnter: (event: React.MouseEvent) => {
              const nodeTemplate = nodeTemplates.find(t => t.label === srcLabel);
              if (nodeTemplate) {
                setShowNodeInfo({
                  x: event.clientX + 10,
                  y: event.clientY + 10,
                  label: nodeTemplate.label,
                  description: nodeTemplate.description
                });
              }
            },
            onMouseLeave: () => setShowNodeInfo(null)
          },
        };
        nodeMap[srcLabel] = node;
        createdNodes.push(node);
      }
      if (!nodeMap[tgtLabel]) {
        const node = {
          id: uuidv4(),
          type: 'custom', // Changed from 'default' to 'custom'
          position: nodePositions[tgtLabel],
          data: { 
            label: tgtLabel,
            onMouseEnter: (event: React.MouseEvent) => {
              const nodeTemplate = nodeTemplates.find(t => t.label === tgtLabel);
              if (nodeTemplate) {
                setShowNodeInfo({
                  x: event.clientX + 10,
                  y: event.clientY + 10,
                  label: nodeTemplate.label,
                  description: nodeTemplate.description
                });
              }
            },
            onMouseLeave: () => setShowNodeInfo(null)
          },
        };
        nodeMap[tgtLabel] = node;
        createdNodes.push(node);
      }
  
      solutionEdges.push({
        id: `e-${index}`,
        source: nodeMap[srcLabel].id,
        target: nodeMap[tgtLabel].id,
        markerEnd: {
          type: MarkerType.Arrow,
          color: '#8b5cf6' // Purple arrowhead
        },
        animated: true, // This enables the drawing animation
        style: {
          stroke: '#8b5cf6', // Purple line color
          strokeWidth: 2
        },
      });
    });
  
    setNodes(createdNodes);
    setEdges(solutionEdges);
    setResult(null);
    setShowSolution(true);
  };

  return (
    <ReactFlowProvider>
      <div className="fixed inset-0 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Image 
                src="/assets/hidevss.png" 
                alt="HiDevs Logo" 
                width={40} 
                height={40} 
                className="rounded-md" 
                priority
              />
              <span className="text-xl font-bold text-gray-700">HiDevs</span>
            </div>
            <h1 className="text-lg font-extrabold text-gray-800 leading-snug">
              Query Processing Flow
            </h1>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200">
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${!showTips ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setShowTips(false)}
            >
              Nodes
            </button>
            <button 
              className={`flex-1 py-2 px-4 text-sm font-medium ${showTips ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setShowTips(true)}
            >
              Tips & Goals
            </button>
          </div>
          
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {!showTips ? (
              <div className="px-4 py-3">
                <h2 className="text-md font-semibold mb-2 text-black">Components</h2>
                <div className="space-y-0.5">
                  {nodeTemplates.map((node, index) => (
                    <button
                      key={index}
                      className="block w-full text-left bg-purple-600 hover:bg-purple-700 text-white font-medium shadow p-1.5 rounded-md text-sm transition-all"
                      onClick={() => addNode(node.label)}
                    >
                      <span className="mr-1">+</span>{node.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="mb-4">
                  <h2 className="text-md font-semibold mb-2 text-purple-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Learning Goals
                  </h2>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {learningGoals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-md font-semibold mb-2 text-purple-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Workflow Tips
                  </h2>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {workflowTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col space-y-1">
              <button onClick={handleSubmit} className="w-full py-1.5 px-3 rounded-md font-semibold text-sm flex items-center justify-center text-purple-600 border border-gray-300 bg-white hover:bg-gray-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Check my workflow
              </button>

              <button onClick={handleShowSolution} className="w-full py-1.5 px-3 rounded-md font-semibold text-sm flex items-center justify-center text-purple-600 border border-gray-300 bg-white hover:bg-gray-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Show Solution
              </button>

              <button onClick={handleReset} className="w-full py-1.5 px-3 rounded-md font-semibold text-sm flex items-center justify-center text-purple-600 border border-gray-300 bg-white hover:bg-gray-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 relative h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="h-full bg-white"
          >
            <MiniMap />
            <Controls />
            <Background variant="dots" gap={16} size={1} />
          </ReactFlow>

          {/* Node info tooltip */}
          {showNodeInfo && (
            <div 
              className="fixed z-50 bg-white shadow-lg border border-purple-300 rounded p-2 w-64"
              style={{ left: `${showNodeInfo.x}px`, top: `${showNodeInfo.y}px` }}
            >
              <h3 className="font-bold text-purple-700 text-sm">{showNodeInfo.label}</h3>
              <p className="text-xs text-gray-600 mt-1">{showNodeInfo.description}</p>
            </div>
          )}

          {/* Floating feedback */}
          <AnimatePresence>
            {feedback && (
              <FloatingText 
                text={feedback.text} 
                x={feedback.x} 
                y={feedback.y} 
              />
            )}
          </AnimatePresence>
        </main>

        {/* Result Overlay */}
        {showResultOverlay && result && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto"
          >
            <div className="bg-white rounded-lg shadow-xl p-4 animate-fadeIn border-2 border-purple-500" style={{maxWidth: '350px'}}>
              <div className="flex">
                <div className="mr-4">
                  <div className="w-20 h-20 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                      <circle 
                        className={`${
                          parseFloat(result.accuracy) >= 75 ? 'text-green-500' : 
                          parseFloat(result.accuracy) >= 50 ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}
                        strokeWidth="10" 
                        strokeDasharray={`${2 * Math.PI * 40 * parseFloat(result.accuracy) / 100} ${2 * Math.PI * 40}`}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-800">{result.accuracy}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Results</h3>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold text-purple-600">{result.correct}</span> of <span className="font-semibold">{result.total}</span> connections correct
                  </p>
                  <p className="text-xs text-gray-600">{result.feedback}</p>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => setShowResultOverlay(false)} 
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ReactFlowProvider>
  );
}