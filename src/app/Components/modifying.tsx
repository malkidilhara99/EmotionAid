"use client";
import React, { useState,useEffect , useRef } from "react";
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Mic,
  Camera,
  User,
  Settings,
  BarChart3,
  History,
  Home,
  CameraOff,
  Bell,
  Zap,
  Heart,
  CheckCircle,
  Database,
  Music,
  Brain,
  Target,
  MicOff,
  Sun,
  Moon,
  Calendar,
  TrendingUp,
  Clock,
  X,
  Trophy,
  Award,
  Star,
  Flame
} from "lucide-react";
import Image from 'next/image';

// Beautiful brown square nodes neural network - horizontal left-to-right animation
const NeuralNetwork: React.FC<{ 
  size?: number; 
  nodes?: number; 
  className?: string; 
  horizontal?: boolean;
  color?: string;
  lineColor?: string;
}> = ({ 
  size = 100, 
  nodes = 9, 
  className,
  horizontal = false,
  color = '#14b8a6',
  lineColor = '#5eead4'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    
    // Add glow filter for depth
    const defs = document.createElementNS(NS, 'defs');
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', `glow-${Math.random()}`);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const feGaussianBlur = document.createElementNS(NS, 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '1.5');
    feGaussianBlur.setAttribute('result', 'coloredBlur');
    
    const feMerge = document.createElementNS(NS, 'feMerge');
    const feMergeNode1 = document.createElementNS(NS, 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS(NS, 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    defs.appendChild(filter);
    svg.appendChild(defs);
    
    const filterId = filter.getAttribute('id') || 'glow';
    const N = Math.max(6, Math.min(12, nodes));
    const nodesData: { x: number; y: number; phase: number; speed: number; size: number; pulsePhase: number }[] = [];
    
    // Create nodes - spread evenly for horizontal movement
    for (let i = 0; i < N; i++) {
      nodesData.push({
        x: horizontal ? size * (i / (N - 1)) : size * (0.15 + Math.random() * 0.7),
        y: horizontal ? size * (0.3 + Math.random() * 0.4) : size * (0.15 + Math.random() * 0.7),
        phase: Math.random() * Math.PI * 2,
        speed: horizontal ? 0.15 + Math.random() * 0.2 : 0.2 + Math.random() * 0.3,
        size: 3.5 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    const group = document.createElementNS(NS, 'g');
    svg.appendChild(group);

    const squares: SVGRectElement[] = [];
    const lines: SVGLineElement[] = [];

    // Create nodes with eye-friendly colors
    for (let i = 0; i < N; i++) {
      const square = document.createElementNS(NS, 'rect');
      const squareSize = nodesData[i].size;
      square.setAttribute('x', String(nodesData[i].x - squareSize / 2));
      square.setAttribute('y', String(nodesData[i].y - squareSize / 2));
      square.setAttribute('width', String(squareSize));
      square.setAttribute('height', String(squareSize));
      square.setAttribute('fill', color); // Use prop color
      square.setAttribute('fill-opacity', '0.7');
      square.setAttribute('rx', '1.5');
      square.setAttribute('filter', `url(#${filterId})`);
      square.setAttribute('data-base-size', String(squareSize));
      group.appendChild(square);
      squares.push(square);
    }

    // Create connecting lines
    const threshold = horizontal ? size * 0.6 : size * 0.4;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const a = nodesData[i];
        const b = nodesData[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < threshold) {
          const line = document.createElementNS(NS, 'line');
          line.setAttribute('stroke', lineColor); // Use prop lineColor
          line.setAttribute('stroke-width', '1');
          line.setAttribute('stroke-opacity', '0');
          line.setAttribute('stroke-linecap', 'round');
          line.setAttribute('data-i', String(i));
          line.setAttribute('data-j', String(j));
          group.appendChild(line);
          lines.push(line);
        }
      }
    }

    let raf = 0;
    const t0 = performance.now();

    const animate = (t: number) => {
      const elapsed = (t - t0) / 1000;
      
      // Horizontal left-to-right flow or gentle circular movement
      for (let i = 0; i < N; i++) {
        const n = nodesData[i];
        let nx, ny;
        
        if (horizontal) {
          // Left-to-right flowing movement
          const flowSpeed = 0.08;
          const baseX = (n.x + elapsed * size * flowSpeed) % size;
          const waveAmplitude = 2;
          nx = baseX;
          ny = n.y + Math.sin(elapsed * n.speed + n.phase) * waveAmplitude;
        } else {
          const amplitude = 3.5;
          nx = n.x + Math.sin(elapsed * n.speed + n.phase) * amplitude;
          ny = n.y + Math.cos(elapsed * (n.speed * 0.8) + n.phase) * amplitude;
        }
        
        // Subtle breathing/pulsing effect
        const baseSize = n.size;
        const pulse = Math.sin(elapsed * 0.8 + n.pulsePhase) * 0.4;
        const currentSize = baseSize + pulse;
        
        squares[i].setAttribute('x', String(nx - currentSize / 2));
        squares[i].setAttribute('y', String(ny - currentSize / 2));
        squares[i].setAttribute('width', String(currentSize));
        squares[i].setAttribute('height', String(currentSize));
      }

      // Update connecting lines
      lines.forEach((line) => {
        const iIdx = Number(line.getAttribute('data-i'));
        const jIdx = Number(line.getAttribute('data-j'));
        const xi = Number(squares[iIdx].getAttribute('x')) + nodesData[iIdx].size / 2;
        const yi = Number(squares[iIdx].getAttribute('y')) + nodesData[iIdx].size / 2;
        const xj = Number(squares[jIdx].getAttribute('x')) + nodesData[jIdx].size / 2;
        const yj = Number(squares[jIdx].getAttribute('y')) + nodesData[jIdx].size / 2;
        
        line.setAttribute('x1', String(xi));
        line.setAttribute('y1', String(yi));
        line.setAttribute('x2', String(xj));
        line.setAttribute('y2', String(yj));
        
        const dist = Math.hypot(xi - xj, yi - yj);
        const baseOpacity = 0.25 * (1 - Math.min(dist / threshold, 1));
        const wave = Math.sin(elapsed * 0.5 + iIdx + jIdx) * 0.1;
        const opacity = Math.max(0, Math.min(0.3, baseOpacity + wave));
        line.setAttribute('stroke-opacity', String(opacity));
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      if (svg.contains(defs)) svg.removeChild(defs);
      if (svg.contains(group)) svg.removeChild(group);
    };
  }, [size, nodes, horizontal, color, lineColor]);

  return (
    <div className={className} style={{ width: size, height: size, pointerEvents: 'none' }} aria-hidden="true">
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} />
    </div>
  );
};


// Define comprehensive emotion types and interfaces
type Emotion = 'Happy' | 'Sad' | 'Angry' | 'Surprised' | 'Neutral' | 'Fearful' | 'Disgusted';

interface Cause {
  id: number;
  name: string;
  category: 'personal' | 'work' | 'health' | 'relationships';
}

interface Solution {
  causeId: number;
  causeName: string;
  solutionType: 'Temporary' | 'Permanent' | 'Professional';
  solution: string;
  priority: 'high' | 'medium' | 'low';
}

interface AvoidanceMethods {
  emotion: Emotion;
  temporaryMethods: string[];
  permanentMethods: string[];
}

// Enhanced database content
const causesData: Cause[] = [
  { id: 1, name: 'Breakup', category: 'relationships' },
  { id: 2, name: 'Loss of a Loved One', category: 'personal' },
  { id: 3, name: 'Health Issues', category: 'health' },
  { id: 4, name: 'Work Failure', category: 'work' },
  { id: 5, name: 'Financial Struggles', category: 'personal' },
  { id: 6, name: 'Loneliness', category: 'relationships' },
  { id: 7, name: 'Work Pressure', category: 'work' },
  { id: 8, name: 'Argument with Partner', category: 'relationships' },
  { id: 9, name: 'Unexpected Change', category: 'personal' },
  { id: 10, name: 'Loss of Job', category: 'work' },
  { id: 11, name: 'Criticism', category: 'work' },
  { id: 12, name: 'Injustice', category: 'personal' }
];

const emotionCauseMapping: { emotion: Emotion; causeIds: number[] }[] = [
  { emotion: 'Sad', causeIds: [1, 2, 3, 4, 5, 6] },
  { emotion: 'Angry', causeIds: [7, 8, 11, 12] },
  { emotion: 'Happy', causeIds: [] }, // Happy doesn't need causes
  { emotion: 'Fearful', causeIds: [3, 9, 10] },
  { emotion: 'Surprised', causeIds: [9] },
  { emotion: 'Disgusted', causeIds: [11, 12] },
  { emotion: 'Neutral', causeIds: [] }
];

// (kept intentionally minimal)

const solutionsData: Solution[] = [
  {
    causeId: 1, causeName: 'Breakup', solutionType: 'Temporary',
    solution: 'Practice no-contact rule for 30 days. Focus on self-care activities like exercise, meditation, or hobbies.',
    priority: 'high'
  },
  {
    causeId: 1, causeName: 'Breakup', solutionType: 'Permanent',
    solution: 'Build emotional independence through therapy, develop new relationships, and focus on personal growth goals.',
    priority: 'high'
  },
  {
    causeId: 2, causeName: 'Loss of a Loved One', solutionType: 'Temporary',
    solution: 'Allow yourself to grieve naturally. Reach out to support groups or trusted friends for emotional support.',
    priority: 'high'
  },
  {
    causeId: 2, causeName: 'Loss of a Loved One', solutionType: 'Professional',
    solution: 'Consider grief counseling or therapy to process complex emotions and develop healthy coping mechanisms.',
    priority: 'high'
  },
  {
    causeId: 7, causeName: 'Work Pressure', solutionType: 'Temporary',
    solution: 'Take regular breaks, practice time management techniques, and delegate tasks when possible.',
    priority: 'medium'
  },
  {
    causeId: 7, causeName: 'Work Pressure', solutionType: 'Permanent',
    solution: 'Set clear work boundaries, improve communication with supervisors, and develop stress management skills.',
    priority: 'medium'
  }
];

const avoidanceMethodsData: AvoidanceMethods[] = [
  {
    emotion: 'Sad',
    temporaryMethods: [
      'Listen to uplifting music or podcasts',
      'Take a walk in nature or do light exercise',
      'Write down feelings in a journal.',
      'Call a friend or family member for support',
      'Practice deep breathing or meditation for 5-10 minutes',
      'Think of 3 things you are grateful for'
    ],
    permanentMethods: [
      'Develop a regular exercise routine for mental health',
      'Build a strong support network of friends and family',
      'Practice mindfulness and emotional awareness daily',
      'Consider therapy for deeper emotional processing'
    ]
  },
  {
    emotion: 'Angry',
    temporaryMethods: [
      'Count to 10 and take deep breaths before reacting',
      'Step away from the triggering situation temporarily',
      'Use physical activity to release tension (punch a pillow, run)',
      'Practice the 5-4-3-2-1 grounding technique'
    ],
    permanentMethods: [
      'Learn anger management techniques through classes or therapy',
      'Practice regular mindfulness meditation',
      'Develop better communication and conflict resolution skills',
      'Address underlying stress factors in your life'
    ]
  },
  {
    emotion: 'Fearful',
    temporaryMethods: [
      'Focus on your breathing and ground yourself in the present',
      'Use positive self-talk to challenge fearful thoughts',
      'Reach out to someone you trust for reassurance',
      'Practice progressive muscle relaxation'
    ],
    permanentMethods: [
      'Gradually expose yourself to feared situations in safe ways',
      'Build confidence through small daily achievements',
      'Consider cognitive behavioral therapy for persistent fears',
      'Develop resilience through stress management techniques'
    ]
  }
];

// Music therapy recommendations
const musicTherapy = {
  'Sad': {
    videoId: 'WZScSeuasQw',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Gentle Acoustic Uplift',
    description: 'Soothing background music for emotional relief'
  },
  'Angry': {
    videoId: 'fJ9rUzIMcZQ',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/29/audio_2d91a373df.mp3',
    title: 'Calming Piano Flow',
    description: 'Relaxing music to calm intense emotions'
  },
  'Fearful': {
    videoId: 'ZToicYcHIOU',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/12/20/audio_1f26e2f246.mp3',
    title: 'Peaceful Nature Soundscape',
    description: 'Ambient nature-inspired audio for inner peace'
  },
  'Happy': {
    videoId: 'd-diB65scQU',
    audioUrl: null,
    title: 'Energy Boost!',
    description: 'High-energy motivation mix to stay on track'
  },
  'Surprised': {
    videoId: 'tAGnKpE4NCI',
    audioUrl: null,
    title: 'Breathe and Ground Yourself',
    description: 'Soft piano to re-center your surprise'
  },
  'Disgusted': {
    videoId: 'DSYDCpWn7x0',
    audioUrl: null,
    title: 'Cleanse and Let Go',
    description: 'Piano + ambient mix to relax and refresh'
  },
  'Neutral': {
    videoId: '4xDzrJKXOOY',
    audioUrl: null,
    title: 'Mindfulness Calm',
    description: 'Perfect for quiet background balance'
  }
}

// Get emotion-based theme function
const getEmotionTheme = (emotion: string, darkMode: boolean = false) => {
  const emotionType = emotion.toLowerCase();
  
  if (emotionType.includes('sad')) {
    return darkMode ? {
      name: 'Comfort',
      bg: 'from-slate-900 via-blue-950 to-slate-900',
      cardBg: 'bg-slate-800/90',
      sidebarBg: 'bg-slate-800/80',
      navBg: 'bg-slate-900/95',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-blue-400',
      accent: 'from-blue-500 to-cyan-600',
      border: 'border-blue-900/50',
      statusBg: 'bg-blue-950/50',
      statusText: 'text-blue-300'
    } : {
      name: 'Comfort',
      bg: 'from-blue-50 via-sky-50 to-cyan-50',
      cardBg: 'bg-white/90',
      sidebarBg: 'bg-white/80',
      navBg: 'bg-white/95',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-blue-700',
      accent: 'from-blue-400 to-cyan-500',
      border: 'border-blue-200',
      statusBg: 'bg-blue-100',
      statusText: 'text-blue-800'
    };
  } else if (emotionType.includes('angry')) {
    return darkMode ? {
      name: 'Calming',
      bg: 'from-slate-900 via-rose-950 to-slate-900',
      cardBg: 'bg-slate-800/90',
      sidebarBg: 'bg-slate-800/80',
      navBg: 'bg-slate-900/95',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-rose-400',
      accent: 'from-rose-500 to-pink-600',
      border: 'border-rose-900/50',
      statusBg: 'bg-rose-950/50',
      statusText: 'text-rose-300'
    } : {
      name: 'Calming',
      bg: 'from-rose-50 via-pink-50 to-red-50',
      cardBg: 'bg-white/90',
      sidebarBg: 'bg-white/80',
      navBg: 'bg-white/95',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-rose-700',
      accent: 'from-rose-400 to-pink-500',
      border: 'border-rose-200',
      statusBg: 'bg-rose-100',
      statusText: 'text-rose-800'
    };
  } else if (emotionType.includes('happy')) {
    return darkMode ? {
      name: 'Joyful',
      bg: 'from-slate-900 via-amber-950 to-slate-900',
      cardBg: 'bg-slate-800/90',
      sidebarBg: 'bg-slate-800/80',
      navBg: 'bg-slate-900/95',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-amber-400',
      accent: 'from-amber-500 to-orange-600',
      border: 'border-amber-900/50',
      statusBg: 'bg-amber-950/50',
      statusText: 'text-amber-300'
    } : {
      name: 'Joyful',
      bg: 'from-yellow-50 via-amber-50 to-orange-50',
      cardBg: 'bg-white/90',
      sidebarBg: 'bg-white/80',
      navBg: 'bg-white/95',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-amber-700',
      accent: 'from-amber-400 to-orange-500',
      border: 'border-amber-200',
      statusBg: 'bg-amber-100',
      statusText: 'text-amber-800'
    };
  } else if (emotionType.includes('fear')) {
    return darkMode ? {
      name: 'Secure',
      bg: 'from-slate-900 via-purple-950 to-slate-900',
      cardBg: 'bg-slate-800/90',
      sidebarBg: 'bg-slate-800/80',
      navBg: 'bg-slate-900/95',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-purple-400',
      accent: 'from-purple-500 to-violet-600',
      border: 'border-purple-900/50',
      statusBg: 'bg-purple-950/50',
      statusText: 'text-purple-300'
    } : {
      name: 'Secure',
      bg: 'from-purple-50 via-violet-50 to-indigo-50',
      cardBg: 'bg-white/90',
      sidebarBg: 'bg-white/80',
      navBg: 'bg-white/95',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-purple-700',
      accent: 'from-purple-400 to-violet-500',
      border: 'border-purple-200',
      statusBg: 'bg-purple-100',
      statusText: 'text-purple-800'
    };
  } else {
    return darkMode ? {
      name: 'Balanced',
      bg: 'from-slate-900 via-slate-800 to-slate-900',
      cardBg: 'bg-slate-800/90',
      sidebarBg: 'bg-slate-800/80',
      navBg: 'bg-slate-900/95',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-400',
      accent: 'from-slate-500 to-gray-600',
      border: 'border-slate-700/50',
      statusBg: 'bg-slate-800/50',
      statusText: 'text-slate-300'
    } : {
      name: 'Balanced',
      bg: 'from-slate-50 via-gray-50 to-zinc-50',
      cardBg: 'bg-white/90',
      sidebarBg: 'bg-white/80',
      navBg: 'bg-white/95',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-slate-600',
      accent: 'from-slate-400 to-gray-500',
      border: 'border-slate-200',
      statusBg: 'bg-slate-100',
      statusText: 'text-slate-800'
    };
  }
};

// YouTube Embed Component
const YouTubeEmbed: React.FC<{ videoId: string; title: string }> = ({ videoId, title }) => {
  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

// Smart Recommendations Component
const SmartRecommendations: React.FC<{ 
  currentEmotion: string;
  theme: {
    name: string;
    bg: string;
    cardBg: string;
    sidebarBg: string;
    navBg: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    border: string;
    statusBg: string;
    statusText: string;
  };
  setUserDescription: (desc: string) => void;
}> = ({ currentEmotion, theme, setUserDescription }) => {
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);
  
  const emotion = currentEmotion.replace(/[^\w]/g, '') as Emotion;
  
  // Get relevant causes for this emotion
  const relevantCauses = emotionCauseMapping
    .find(mapping => mapping.emotion === emotion)
    ?.causeIds.map(id => causesData.find(cause => cause.id === id))
    .filter((cause): cause is Cause => cause !== undefined) || [];
  
  // Get avoidance methods for this emotion
  // (removed unused variable to fix compile error)
  
  // Get solutions for selected cause
  const getSolutionsForCause = (causeId: number) => {
    return solutionsData.filter(solution => solution.causeId === causeId);
  };
  
  // Get music therapy for this emotion
  const musicRec = musicTherapy[emotion as keyof typeof musicTherapy];

  if (emotion === 'Happy') {
    return (
      <div className="space-y-4">
        <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold ${theme.textPrimary} mb-3 flex items-center`}>
            <Heart className={`mr-2 ${theme.textSecondary}`} size={20} />
            Maintain Your Positive Energy
          </h3>
          <div className="space-y-3">
            <div className={`p-4 ${theme.statusBg} rounded-xl border ${theme.border}`}>
              <h4 className={`font-semibold ${theme.textSecondary} mb-2`}>Keep the Momentum Going:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className={`mr-2 mt-0.5 ${theme.textSecondary}`} size={16} />
                  <span>Practice gratitude - acknowledge what&apos;s making you happy</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className={`mr-2 mt-0.5 ${theme.textSecondary}`} size={16} />
                  <span>Share your positive energy with others</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className={`mr-2 mt-0.5 ${theme.textSecondary}`} size={16} />
                  <span>Engage in activities that sustain your joy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Removed unused setUserDescription function to fix compile error.

  return (
    <div className="space-y-4">
      {/* Cause Selection */}
      {relevantCauses.length > 0 && (
        <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}>
            <Database className={`mr-2 ${theme.textSecondary}`} size={20} />
            What might be causing this feeling?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {relevantCauses.map(cause => {
              const isSelectedCause = selectedCause?.id === cause.id;
              const causeClass = isSelectedCause
                ? `bg-gradient-to-r ${theme.accent} text-white border-4 border-transparent shadow-lg`
                : `bg-white ${theme.textSecondary} ${theme.border} hover:opacity-90`;

              return (
                <button
                  key={cause.id}
                  onClick={() => {
                    setSelectedCause(cause);
                    setShowSolutions(true);
                    if (typeof window !== 'undefined' && document.getElementById('crew-ai-input')) {
                      const input = document.getElementById('crew-ai-input') as HTMLTextAreaElement;
                      if (input) input.value = cause.name;
                    }
                    setUserDescription(cause.name);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${causeClass}`}
                  style={{ fontWeight: isSelectedCause ? 'bold' : 'normal', fontSize: '1rem' }}
                >
                  <span className="font-medium">{cause.name}</span>
                  <div className="text-xs opacity-75 mt-1 capitalize">{cause.category}</div>
                </button>
              );
            })}
          </div>
          
          {/* General tips toggle removed per design */}
        </div>
      )}
      

      {/* Specific Solutions */}
      {selectedCause && showSolutions && (
        <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}>
            <Target className={`mr-2 ${theme.textSecondary}`} size={20} />
            Targeted Solutions for {selectedCause.name}
          </h3>
          <div className="space-y-4">
            {getSolutionsForCause(selectedCause.id).map((solution, index) => (
              <div key={index} className={`p-4 rounded-xl ${theme.statusBg} border ${theme.border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${theme.textSecondary} px-2 py-1 rounded-full bg-white/70`}>
                    {solution.solutionType}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    solution.priority === 'high' ? 'bg-red-100 text-red-800' :
                    solution.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {solution.priority} priority
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{solution.solution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Music Therapy */}
      {musicRec && (
        <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}>
            <Music className={`mr-2 ${theme.textSecondary}`} size={20} />
            Music Therapy for {emotion}
          </h3>
          <div className="space-y-4">
            <YouTubeEmbed videoId={musicRec.videoId} title={musicRec.title} />
            <div className="text-center">
              <h4 className={`font-semibold ${theme.textPrimary}`}>{musicRec.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{musicRec.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedEmotionAid = () => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectionMode, setDetectionMode] = useState("face");
  const [currentEmotion, setCurrentEmotion] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice instruction states
  const [showVoiceInstruction, setShowVoiceInstruction] = useState(false);
  const [voiceCountdown, setVoiceCountdown] = useState(6);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Emotion history tracking
  type EmotionRecord = {
    id: string;
    emotion: Emotion;
    confidence: number;
    timestamp: number;
    detectionMode: 'face' | 'voice' | 'both';
  };

  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // Gamification & Achievements
  type Achievement = {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: number;
    progress?: number;
    target?: number;
    category: 'streak' | 'detection' | 'wellness' | 'mastery';
  };

  type UserStats = {
    totalDetections: number;
    currentStreak: number;
    longestStreak: number;
    lastDetectionDate: string; // YYYY-MM-DD
    level: number;
    xp: number;
    unlockedAchievements: string[];
    emotionGoals: {
      targetEmotion: Emotion;
      currentCount: number;
      targetCount: number;
      startDate: number;
    }[];
  };

  const [userStats, setUserStats] = useState<UserStats>({
    totalDetections: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastDetectionDate: '',
    level: 1,
    xp: 0,
    unlockedAchievements: [],
    emotionGoals: []
  });

  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);
  const [showGoalsPanel, setShowGoalsPanel] = useState(false);

  // Define all achievements (memoized to prevent re-renders)
  const allAchievements: Achievement[] = React.useMemo(() => [
    // Streak Achievements
    { id: 'streak_3', title: 'Getting Started', description: 'Check your emotions for 3 days in a row', icon: '🔥', category: 'streak' as const, target: 3 },
    { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', category: 'streak' as const, target: 7 },
    { id: 'streak_14', title: 'Two Week Champion', description: '14 days of consistent tracking', icon: '💪', category: 'streak' as const, target: 14 },
    { id: 'streak_30', title: 'Monthly Master', description: '30 days straight - incredible!', icon: '👑', category: 'streak' as const, target: 30 },
    { id: 'streak_100', title: 'Century Club', description: '100 day streak - legendary!', icon: '🏆', category: 'streak' as const, target: 100 },
    
    // Detection Count Achievements
    { id: 'detect_10', title: 'First Steps', description: 'Complete 10 emotion detections', icon: '🎯', category: 'detection' as const, target: 10 },
    { id: 'detect_50', title: 'Emotion Explorer', description: 'Reach 50 detections', icon: '🔍', category: 'detection' as const, target: 50 },
    { id: 'detect_100', title: 'Emotion Enthusiast', description: '100 detections milestone', icon: '🌟', category: 'detection' as const, target: 100 },
    { id: 'detect_500', title: 'Emotion Expert', description: '500 detections - you\'re dedicated!', icon: '💎', category: 'detection' as const, target: 500 },
    { id: 'detect_1000', title: 'Emotion Master', description: '1000 detections - absolute legend!', icon: '🎖️', category: 'detection' as const, target: 1000 },
    
    // Wellness Achievements
    { id: 'happy_10', title: 'Joyful Journey', description: 'Experience happiness 10 times', icon: '😊', category: 'wellness' as const, target: 10 },
    { id: 'happy_50', title: 'Happiness Hero', description: '50 happy moments captured', icon: '🌈', category: 'wellness' as const, target: 50 },
    { id: 'balanced_week', title: 'Emotional Balance', description: 'Experience all 7 emotions in a week', icon: '⚖️', category: 'wellness' as const, target: 7 },
    { id: 'positive_streak_5', title: 'Positivity Streak', description: '5 positive emotions in a row', icon: '✨', category: 'wellness' as const, target: 5 },
    
    // Mastery Achievements
    { id: 'multimodal_10', title: 'Tech Savvy', description: 'Use both face and voice detection 10 times', icon: '🎤', category: 'mastery' as const, target: 10 },
    { id: 'early_bird', title: 'Early Bird', description: 'Check emotions before 8 AM', icon: '🌅', category: 'mastery' as const, target: 1 },
    { id: 'night_owl', title: 'Night Owl', description: 'Check emotions after 10 PM', icon: '🌙', category: 'mastery' as const, target: 1 },
    { id: 'weekend_warrior', title: 'Weekend Warrior', description: 'Track emotions on both weekend days', icon: '🎉', category: 'mastery' as const, target: 2 },
  ], []);

  // Load dark mode preference, emotion history, and user stats from localStorage
  useEffect(() => {
    try {
      const savedDarkMode = localStorage.getItem('emotionAidDarkMode');
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }

      const savedHistory = localStorage.getItem('emotionAidHistory');
      if (savedHistory !== null) {
        setEmotionHistory(JSON.parse(savedHistory));
      }

      const savedStats = localStorage.getItem('emotionAidStats');
      if (savedStats !== null) {
        setUserStats(JSON.parse(savedStats));
      }
    } catch (err) { void err; }
  }, []);

  // Save dark mode preference to localStorage
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      localStorage.setItem('emotionAidDarkMode', JSON.stringify(newMode));
    } catch (err) { void err; }
  };

  // Log emotion detection to history
  const logEmotionToHistory = React.useCallback((emotion: Emotion, confidence: number, mode: 'face' | 'voice' | 'both') => {
    const record: EmotionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      emotion,
      confidence,
      timestamp: Date.now(),
      detectionMode: mode
    };

    setEmotionHistory(prev => {
      const updated = [record, ...prev].slice(0, 100); // Keep last 100 records
      try {
        localStorage.setItem('emotionAidHistory', JSON.stringify(updated));
      } catch (err) { void err; }
      return updated;
    });

    // Update stats and check for achievements
    updateStatsAndCheckAchievements(emotion, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user stats and check for new achievements
  const updateStatsAndCheckAchievements = React.useCallback((emotion: Emotion, mode: 'face' | 'voice' | 'both') => {
    setUserStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastDetectionDate !== today;
      
      // Calculate streak
      let newStreak = prev.currentStreak;
      if (isNewDay) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStreak = prev.lastDetectionDate === yesterday ? prev.currentStreak + 1 : 1;
      }

      // Calculate XP gain (10 XP per detection, bonus for streaks)
      const baseXP = 10;
      const streakBonus = Math.floor(newStreak / 7) * 5; // +5 XP per week streak
      const xpGain = baseXP + streakBonus;
      const newXP = prev.xp + xpGain;
      
      // Calculate level (every 100 XP = 1 level)
      const newLevel = Math.floor(newXP / 100) + 1;

      const updated: UserStats = {
        ...prev,
        totalDetections: prev.totalDetections + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastDetectionDate: today,
        level: newLevel,
        xp: newXP
      };

      // Save to localStorage
      try {
        localStorage.setItem('emotionAidStats', JSON.stringify(updated));
      } catch (err) { void err; }

      // Check for new achievements
      checkNewAchievements(updated, emotion, mode);

      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if user has unlocked new achievements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkNewAchievements = React.useCallback((stats: UserStats, _emotion: Emotion, _mode: 'face' | 'voice' | 'both') => {
    const newAchievements: Achievement[] = [];

    allAchievements.forEach(achievement => {
      // Skip if already unlocked
      if (stats.unlockedAchievements.includes(achievement.id)) return;

      let shouldUnlock = false;

      // Check streak achievements
      if (achievement.category === 'streak' && achievement.target) {
        shouldUnlock = stats.currentStreak >= achievement.target;
      }

      // Check detection count achievements
      if (achievement.category === 'detection' && achievement.target) {
        shouldUnlock = stats.totalDetections >= achievement.target;
      }

      // Check wellness achievements
      if (achievement.category === 'wellness') {
        if (achievement.id === 'happy_10' || achievement.id === 'happy_50') {
          const happyCount = emotionHistory.filter(r => r.emotion === 'Happy').length;
          const target = achievement.id === 'happy_10' ? 10 : 50;
          shouldUnlock = happyCount >= target;
        }
      }

      // Check mastery achievements
      if (achievement.category === 'mastery') {
        if (achievement.id === 'multimodal_10') {
          const multiCount = emotionHistory.filter(r => r.detectionMode === 'both').length;
          shouldUnlock = multiCount >= 10;
        } else if (achievement.id === 'early_bird') {
          const hour = new Date().getHours();
          shouldUnlock = hour < 8;
        } else if (achievement.id === 'night_owl') {
          const hour = new Date().getHours();
          shouldUnlock = hour >= 22;
        }
      }

      if (shouldUnlock) {
        newAchievements.push({ ...achievement, unlockedAt: Date.now() });
      }
    });

    // Show popup for first new achievement
    if (newAchievements.length > 0) {
      const firstNew = newAchievements[0];
      setNewlyUnlockedAchievement(firstNew);
      setShowAchievementPopup(true);

      // Add notification
      try {
        const addNotif = (title: string, message?: string) => {
          const n: Notification = { id: String(Date.now()) + Math.random().toString(36).slice(2,6), title, message, time: Date.now(), read: false };
          setNotifications(prev => { const next = [n, ...(prev || [])].slice(0, 50); try { localStorage.setItem('emotionAidNotifications', JSON.stringify(next.slice(0, 50))); } catch (e) { void e; } return next; });
        };
        addNotif(`🏆 Achievement Unlocked!`, firstNew.title);
      } catch (err) { void err; }

      // Update stats with new achievements
      setUserStats(prev => {
        const updated = {
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, ...newAchievements.map(a => a.id)]
        };
        try {
          localStorage.setItem('emotionAidStats', JSON.stringify(updated));
        } catch (err) { void err; }
        return updated;
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => setShowAchievementPopup(false), 5000);
    }
  }, [emotionHistory, allAchievements]);

  // Helper function to generate consistent avatar colors based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
      'from-cyan-500 to-cyan-600',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // profile for user avatar
  const [profile, setProfile] = useState<{ name: string; email?: string; gender: string; photoDataUrl?: string | null; age_group?: string; ageGroup?: string; age?: number } | null>(null);
  const [agePredicting, setAgePredicting] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('emotionAidUser');
      if (raw) setProfile(JSON.parse(raw));
    } catch (err) { void err; }
  }, []);

  // Track last prediction attempt per photo to avoid tight retry loops when backend fails
  const lastPredictedPhotoRef = useRef<string | null>(null);
  const lastAttemptTimeRef = useRef<number | null>(null);

  // If profile has a photo but no age_group, request prediction from backend once
  useEffect(() => {
    const run = async () => {
      if (!profile) return;
      if (!profile.photoDataUrl) return;
      if (profile.age_group || typeof profile.age === 'number') return; // already have prediction
      if (agePredicting) return; // already in progress

      const photo = profile.photoDataUrl;
      const lastPhoto = lastPredictedPhotoRef.current;
      const lastTime = lastAttemptTimeRef.current;
      const now = Date.now();

      // If we've attempted this same photo recently (cooldown), skip
      const COOLDOWN_MS = 60_000; // 60 seconds
      if (lastPhoto && photo === lastPhoto && lastTime && (now - lastTime) < COOLDOWN_MS) {
        return;
      }

      // mark attempt
      lastPredictedPhotoRef.current = photo;
      lastAttemptTimeRef.current = now;

      setAgePredicting(true);
      try {
        // prepare image blob: if photo is a data URL, convert locally to avoid an extra fetch call
        let blob: Blob;
        if (typeof photo === 'string' && photo.startsWith('data:')) {
          // convert data URL to blob
          const dataURLToBlob = (dataURL: string) => {
            const parts = dataURL.split(',');
            const meta = parts[0] || '';
            const base64 = parts[1] || '';
            const mimeMatch = meta.match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            const binary = atob(base64);
            const len = binary.length;
            const u8 = new Uint8Array(len);
            for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
            return new Blob([u8], { type: mime });
          };
          blob = dataURLToBlob(photo);
        } else {
          // remote URL: fetch the image and convert to blob
          const res = await fetch(photo);
          if (!res.ok) throw new Error('Failed to fetch photo for age prediction: ' + res.status);
          blob = await res.blob();
        }

        const form = new FormData();
        form.append('image', blob, 'avatar.png');

        const resp = await fetch('http://127.0.0.1:5000/predict_age', { method: 'POST', body: form });
        if (!resp.ok) {
          console.warn('predict_age returned non-ok', resp.status, await resp.text().catch(() => '')); 
          return;
        }
        const json = await resp.json();
        const updated = { ...profile } as typeof profile;
        if (json.age_group) updated.age_group = json.age_group;
        else if (typeof json.age === 'number') updated.age = json.age;

        // persist updated profile locally
        try {
          localStorage.setItem('emotionAidUser', JSON.stringify(updated));
        } catch (e) { void e; }
        setProfile(updated);
      } catch (err) {
        // Provide richer diagnostic hints for common failure modes
        console.warn('Age prediction failed', err);
        // Typical causes:
        // - Backend not running or unreachable (server process stopped, wrong host/port, firewall)
        // - CORS blocking the POST from the browser (check browser console network/console for CORS errors)
        // - Mixed-content blocking when app served over HTTPS and backend uses HTTP
        // - If photo is remote, the initial fetch(photo) could fail due to cross-origin or network
        // Check: is the Flask backend running on port 5000? Try visiting http://127.0.0.1:5000/ in a browser or check server logs.
      } finally {
        setAgePredicting(false);
        lastAttemptTimeRef.current = Date.now();
      }
    };

    void run();
  }, [profile, agePredicting]);

  // listen for cross-component profile updates (Auth component dispatches this)
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const ce = e as CustomEvent;
        const detail = ce.detail;
        if (!detail) {
          setProfile(null);
        } else {
          setProfile(detail as { name: string; gender: string; photoDataUrl?: string | null });
        }
      } catch (err) { void err; }
    };

    window.addEventListener('emotionAidUserChanged', handler as EventListener);
    return () => window.removeEventListener('emotionAidUserChanged', handler as EventListener);
  }, []);
  // profile menu state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null); // legacy ref on avatar container
  const avatarRef = useRef<HTMLDivElement | null>(null); // ref to the clickable avatar element
  const menuRef = useRef<HTMLDivElement | null>(null); // ref to the portal menu element
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  // Notifications portal refs & position
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationsMenuRef = useRef<HTMLDivElement | null>(null);
  const [notificationsPosition, setNotificationsPosition] = useState<{ top: number; left: number } | null>(null);
  // Notifications state (dynamic, persisted to localStorage)
  type Notification = { id: string; title: string; message?: string; time: number; read?: boolean };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempPhotoDataUrl, setTempPhotoDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // close profile menu when clicking outside
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      const target = e.target as Node;
      // If click is inside avatar OR inside the portal menu, don't close
      if (avatarRef.current && avatarRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
  // If click is inside notifications button or its menu, don't close profile menu
  if (notificationsButtonRef.current && notificationsButtonRef.current.contains(target)) return;
  if (notificationsMenuRef.current && notificationsMenuRef.current.contains(target)) return;
  setIsProfileMenuOpen(false);
  // close notifications when clicking elsewhere
  setIsNotificationsOpen(false);
    }

    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // compute anchored menu position based on avatar bounding rect
  const computeMenuPosition = () => {
    if (!avatarRef.current) return null;
    const rect = avatarRef.current.getBoundingClientRect();
    const menuWidth = 256; // corresponds to w-64
    const padding = 8;
    let left = rect.right - menuWidth; // try align right edges
    if (left < padding) left = rect.left; // if overflow left, align to left edge
    const maxLeft = window.innerWidth - menuWidth - padding;
    if (left > maxLeft) left = maxLeft;
    const top = rect.bottom + 8; // small gap below avatar
    return { top, left };
  };

  // compute anchored notifications position based on bell/button bounding rect
  const computeNotificationsPosition = () => {
    if (!notificationsButtonRef.current) return null;
    const rect = notificationsButtonRef.current.getBoundingClientRect();
    const menuWidth = 320; // corresponds to w-80
    const padding = 8;
    let left = rect.right - menuWidth; // align right edges to the menu
    if (left < padding) left = rect.left;
    const maxLeft = window.innerWidth - menuWidth - padding;
    if (left > maxLeft) left = maxLeft;
    const top = rect.bottom + 8;
    return { top, left };
  };

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    // compute initial position
    setMenuPosition(computeMenuPosition());

    const onScroll = () => setMenuPosition(computeMenuPosition());
    const onResize = () => setMenuPosition(computeMenuPosition());
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isProfileMenuOpen]);
  
  // Notifications positioning & lifecycle (recompute on open/scroll/resize)
  useEffect(() => {
    if (!isNotificationsOpen) return;
    setNotificationsPosition(computeNotificationsPosition());

    const onScroll = () => setNotificationsPosition(computeNotificationsPosition());
    const onResize = () => setNotificationsPosition(computeNotificationsPosition());
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsNotificationsOpen(false); };
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
    };
  }, [isNotificationsOpen]);
    // CrewAI solutions state
    const [, setCrewAILongTerm] = useState<string[]>([]);
    const [crewAISolutionFetched, setCrewAISolutionFetched] = useState<string | null>(null);

  const [confidence, setConfidence] = useState(0);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [cameraError, setCameraError] = useState<string | null>(null);
  // Notifications state helpers (state declared earlier near refs)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('emotionAidNotifications');
      if (raw) setNotifications(JSON.parse(raw));
    } catch (e) { void e; }
  }, []);

  const persistNotifications = (ns: Notification[]) => {
    try { localStorage.setItem('emotionAidNotifications', JSON.stringify(ns.slice(0, 50))); } catch (e) { void e; }
  };

  const addNotification = React.useCallback((title: string, message?: string) => {
    const n: Notification = { id: String(Date.now()) + Math.random().toString(36).slice(2,6), title, message, time: Date.now(), read: false };
    setNotifications(prev => { const next = [n, ...(prev || [])].slice(0, 50); persistNotifications(next); return next; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markNotificationRead = (id?: string) => {
    setNotifications(prev => {
      const next = (prev || []).map(n => id && n.id === id ? { ...n, read: true } : id ? n : { ...n, read: true });
      persistNotifications(next);
      return next;
    });
  };
  // store raw prediction scores (from backend) as a map: { Happy: 0.94, Sad: 0.06, ... }
  const [detectedEmotionScores, setDetectedEmotionScores] = useState<Record<string, number> | null>(null);
  // Keep separate source predictions so we can fuse them
  const [facePredictions, setFacePredictions] = useState<Record<string, number> | null>(null);
  const [audioPredictions, setAudioPredictions] = useState<Record<string, number> | null>(null);

  // Normalize label names between models
  const normalizeLabel = React.useCallback((label: string) => {
    if (!label) return label;
    const l = label.toLowerCase().trim();
    if (l === 'disgust' || l === 'disgusted') return 'Disgusted';
    if (l === 'fear') return 'Fearful';
    if (l === 'surprise') return 'Surprised';
    if (l === 'neutral') return 'Neutral';
    if (l === 'happy') return 'Happy';
    if (l === 'sad') return 'Sad';
    if (l === 'angry') return 'Angry';
    // fallback: capitalize first letter
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, []);

  // Fuse face and audio predictions into a single map and update UI state
  const computeAndSetFusion = React.useCallback((face: Record<string, number> | null, audio: Record<string, number> | null) => {
    const keys = new Set<string>();
    if (face) Object.keys(face).forEach(k => keys.add(k));
    if (audio) Object.keys(audio).forEach(k => keys.add(k));

    if (keys.size === 0) {
      setDetectedEmotionScores(null);
      setConfidence(0);
      return;
    }

    const fused: Record<string, number> = {};
    // weights: face 0.6, audio 0.4 when both present
    const wFace = face ? 0.6 : 0;
    const wAudio = audio ? 0.4 : 0;

    keys.forEach(key => {
      const f = face && typeof face[key] === 'number' ? face[key] : 0;
      const a = audio && typeof audio[key] === 'number' ? audio[key] : 0;
      const val = wFace + wAudio > 0 ? (f * wFace + a * wAudio) / (wFace + wAudio) : 0;
      fused[key] = Number(val);
    });

    // normalize so values sum to 1 (for nicer display)
    const total = Object.values(fused).reduce((s, v) => s + v, 0) || 1;
    Object.keys(fused).forEach(k => { fused[k] = fused[k] / total; });

  setDetectedEmotionScores(fused);
    // set top emotion and confidence
    const topKey = Object.entries(fused).reduce((best, cur) => cur[1] > best[1] ? cur : best, ['', -Infinity])[0];
    if (topKey) {
      const conf = Math.round((fused[topKey] || 0) * 100);
      setCurrentEmotion(topKey);
      setConfidence(conf);
      
      // Log to history - determine detection mode
      const mode: 'face' | 'voice' | 'both' = (face && audio) ? 'both' : face ? 'face' : 'voice';
      logEmotionToHistory(topKey as Emotion, conf, mode);
    }
  }, [logEmotionToHistory]);

  // Description state for user problem
  const [userDescription, setUserDescription] = useState("");
  const [crewAISolution, setCrewAISolution] = useState<string | null>(null);
  const [isCrewAILoading, setIsCrewAILoading] = useState(false);
  // Track completion state for steps inside the CrewAI details view
  const [crewAIStepCompleted, setCrewAIStepCompleted] = useState<Record<number, boolean>>({});
  // Smart CrewAI popup state: control a focused modal for long-term recommendations
  const [showCrewAIPopup, setShowCrewAIPopup] = useState(false);
  // Immediate popup for short-term solutions
  const [showImmediatePopup, setShowImmediatePopup] = useState(false);
  const [immediateSolutions, setImmediateSolutions] = useState<string[] | null>(null);
  const [isImmediateLoading, setIsImmediateLoading] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // primary action focus and progressive disclosure for immediate popup
  const primaryActionRef = useRef<HTMLButtonElement | null>(null);
  const [showMoreTips, setShowMoreTips] = useState(false);

  // Helpers for immediate-popup UI (must live inside component so currentEmotion is available)
  const primaryColorClass = currentEmotion
    ? (currentEmotion.toLowerCase().includes('sad') ? 'bg-blue-600 hover:bg-blue-700' :
       currentEmotion.toLowerCase().includes('angry') ? 'bg-rose-600 hover:bg-rose-700' :
       currentEmotion.toLowerCase().includes('happy') ? 'bg-yellow-500 hover:bg-yellow-600' :
       currentEmotion.toLowerCase().includes('fear') ? 'bg-purple-600 hover:bg-purple-700' :
       'bg-slate-700 hover:bg-slate-800')
    : 'bg-slate-700 hover:bg-slate-800';

  

  // autofocus primary CTA and close on Escape when popup shown
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowImmediatePopup(false);
    }

    if (showImmediatePopup) {
      // focus primary after a tiny delay to allow mount
      setTimeout(() => primaryActionRef.current?.focus(), 50);
      document.addEventListener('keydown', onKey);
    }

    return () => document.removeEventListener('keydown', onKey);
  }, [showImmediatePopup]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Audio capture refs for voice-mode recording
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cameraTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, setStrategyData] = useState<Record<string, unknown>>({});
  
  // Get the theme - only if emotion is detected, with dark mode support
  const theme = currentEmotion ? getEmotionTheme(currentEmotion, isDarkMode) : getEmotionTheme("neutral", isDarkMode);

  // cleaned emotion for UI/YouTube mapping
  const cleanEmotionForUI = currentEmotion ? currentEmotion.replace(/[^\w]/g, '') as Emotion : 'Neutral' as Emotion;

  // Utility to check for negative emotions
  const isNegativeEmotion = (emotion: string) => {
    const negativeEmotions = ['Sad', 'Angry', 'Fearful', 'Disgusted'];
    return negativeEmotions.some(e => emotion.toLowerCase().includes(e.toLowerCase()));
  };

  // Note: emotion confidence values will be populated from backend via `detectedEmotionScores`.

  // Build a display list that prefers backend scores when available; otherwise fall back to a 0% default
  const displayEmotionList = React.useMemo(() => {
    const emotionLabelMap: Record<string, string> = {
      Angry: '😠 Angry',
      Disgusted: '🤢 Disgusted',
      Fearful: '😨 Fearful',
      Happy: '😊 Happy',
      Sad: '😢 Sad',
      Surprised: '😲 Surprised',
      Neutral: '😐 Neutral'
    };

    const canonical = ['Angry','Disgusted','Fearful','Happy','Sad','Surprised','Neutral'];
    return canonical.map((key) => {
      const label = emotionLabelMap[key] || key;
      let pct = 0;
      if (detectedEmotionScores && typeof detectedEmotionScores === 'object') {
        const raw = detectedEmotionScores[key];
        pct = typeof raw === 'number' ? Math.round(raw * 100) : 0;
      } else {
        pct = 0; // no backend scores available
      }
      return { key, label, confidence: pct };
    });
  }, [detectedEmotionScores]);

  // Detection modes
  const detectionModes = [
    { 
      id: "face", 
      label: "Face", 
      icon: <Camera className="w-5 h-5" />, 
      status: "Ready",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      id: "voice", 
      label: "Voice", 
      icon: <Mic className="w-5 h-5" />, 
      status: "Ready",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    { 
      id: "both", 
      label: "Both", 
      icon: <Zap className="w-5 h-5" />, 
      status: "Ready",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const menuItems = [
    { id: "dashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { id: "analytics", icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
    { id: "history", icon: <History className="w-5 h-5" />, label: "History" },
    { id: "goals", icon: <Trophy className="w-5 h-5" />, label: "Goals & Achievements" },
    { id: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

  // Camera functionality
const startCamera = async () => {
  try {
    setCameraError(null);
    console.log("[CAMERA] Attempting to access user camera...");

    // Cleanup
    if (cameraTimeoutRef.current) clearTimeout(cameraTimeoutRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Request new stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
    });

    console.log("[CAMERA] Stream acquired ✅");

    // Assign and play video
    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      // Force play manually — some browsers need this!
      try {
        await videoRef.current.play();
        console.log("[CAMERA] Video playing ✅");
      } catch (err) { console.warn(err);
        console.error("[CAMERA ERROR] video.play() failed:", err);
        setCameraError("Camera connected, but video cannot play. Try refreshing or granting permission.");
      }
    }

    streamRef.current = stream;
    setIsCameraActive(true);

    // Check if video starts after 3 seconds
    setTimeout(() => {
      const ready = videoRef.current?.readyState;
      console.log("[CAMERA] Video readyState after 3s:", ready);
      if (ready === 0 || ready === 1) {
        setCameraError("Video stream is not active. Browser may be blocking autoplay.");
        stopCamera();
      }
    }, 3000);

    // Auto-stop safety
    cameraTimeoutRef.current = setTimeout(() => stopCamera(), 60000);

  } catch (err) { console.warn(err);
    console.error("[CAMERA ERROR] getUserMedia failed:", err);
    setCameraError("Camera access failed. Please allow permissions or try a different browser.");
    setIsCameraActive(false);
  }
};





const stopCamera = () => {
  // Stop all media tracks
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    streamRef.current = null;
  }

  // Clear the video element
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }

  // 🔒 Clear the auto-stop timeout if it's set
  if (cameraTimeoutRef.current) {
    clearTimeout(cameraTimeoutRef.current);
    cameraTimeoutRef.current = null;
  }

  // Reset state
  setIsCameraActive(false);
  setCameraError(null);
};

const unlockAudio = () => {
  const audio = new Audio();
  audio.play().catch(() => {}); // intentionally silent
};

  // Toggle camera
const toggleCamera = () => {
  if (isCameraActive) {
    stopCamera();
  } else {
    unlockAudio(); // ✅ Unlock audio right before user-triggered camera start
    startCamera();
  }
};

const handleImageUpload = React.useCallback(async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append("image", imageBlob);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("Top Emotion:", result.top_emotion);
    setCurrentEmotion(result.top_emotion ? normalizeLabel(String(result.top_emotion)) : '');
    // store predictions map (if provided) and set top confidence
    try {
      if (result.predictions && typeof result.predictions === 'object') {
        // normalize keys and store as face predictions
        const normalized: Record<string, number> = {};
        Object.entries(result.predictions).forEach(([k, v]) => { normalized[normalizeLabel(k)] = Number(v); });
        setFacePredictions(normalized);
        // compute fusion (may use only face preds if audio missing)
        computeAndSetFusion(normalized, audioPredictions);
      } else {
        setFacePredictions(null);
        computeAndSetFusion(null, audioPredictions);
      }
    } catch (err) { console.warn(err); setFacePredictions(null); computeAndSetFusion(null, audioPredictions); }
  } catch (err) { console.warn(err);
    console.error("Error uploading image:", err);
  }
}, [normalizeLabel, audioPredictions, computeAndSetFusion]);


const captureAndSendFrame = React.useCallback(async () => {
  if (!videoRef.current || videoRef.current.readyState < 2) return;  // ensure video is ready

  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth || 640;
  canvas.height = videoRef.current.videoHeight || 480;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    if (blob) {
      await handleImageUpload(blob);
    }
  }, "image/jpeg");
}, [videoRef, handleImageUpload]);

// Record a short audio clip (2s) and send to backend predict_audio endpoint
const recordAndSendAudio = React.useCallback(async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  try {
    if (!audioStreamRef.current) {
      audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    const stream = audioStreamRef.current;
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];
    recorder.ondataavailable = (ev) => { if (ev.data && ev.data.size) audioChunksRef.current.push(ev.data); };
    recorder.start();

    // Record for 6 seconds to capture enough audio for MFCC Mel spectrum analysis
    setTimeout(async () => {
      try {
        recorder.stop();
        setIsRecordingVoice(false);
      } catch (err) { void err; }
    }, 6000);

    recorder.onstop = async () => {
      try {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const form = new FormData();
        form.append('audio', blob, 'clip.webm');

        const res = await fetch('http://127.0.0.1:5000/predict_audio', { method: 'POST', body: form });
        if (!res.ok) {
          console.warn('Audio predict failed', await res.text());
          return;
        }
        const data = await res.json();
        if (data.predictions && typeof data.predictions === 'object') {
          const normalized: Record<string, number> = {};
          Object.entries(data.predictions).forEach(([k, v]) => { normalized[normalizeLabel(k)] = Number(v); });
          setAudioPredictions(normalized);
          computeAndSetFusion(facePredictions, normalized);
        }
        if (data.top_emotion) {
          // normalize and set top emotion as well
          setCurrentEmotion(normalizeLabel(String(data.top_emotion)));
        }
      } catch (err) {
        console.warn('Error sending audio prediction', err);
      }
    };
  } catch (err) { console.warn('Audio capture failed', err); }
}, [facePredictions, computeAndSetFusion, normalizeLabel]);

// Voice instruction countdown and recording trigger
useEffect(() => {
  if (!showVoiceInstruction) return;

  const countdownInterval = setInterval(() => {
    setVoiceCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(countdownInterval);
        // Start recording after countdown
        setIsRecordingVoice(true);
        setShowVoiceInstruction(false);
        // Trigger audio recording
        recordAndSendAudio();
        return 6;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(countdownInterval);
}, [showVoiceInstruction, recordAndSendAudio]);

useEffect(() => {
  const fetchStrategyData = async () => {
    try {
      const res = await fetch('/emotion_strategies.json');
      const data = await res.json();
      console.log("Loaded strategies:", data);
      // Do something with the data
    } catch (err) { console.warn(err);
      console.error("Failed to load strategy JSON:", err);
    }
  };

  fetchStrategyData();
  // No return value (void)
}, []);

useEffect(() => {
  const fetchStrategyData = async () => {
    try {
      const res = await fetch('/emotion_strategies.json');
      const data = await res.json();
      setStrategyData(data);
    } catch (err) { console.warn(err);
      console.error("Failed to load strategy JSON:", err);
    }
  };

  fetchStrategyData();
}, []);

useEffect(() => {
  // Only call CrewAI for long-term recommendations when user has provided a description
  if (currentEmotion && isNegativeEmotion(currentEmotion) && crewAISolutionFetched !== currentEmotion && userDescription.trim().length > 0) {
    (async () => {
      try {
        // Prepare user context for personalized recommendations
        const userContext = {
          emotion: currentEmotion,
          reason: userDescription,
          name: profile?.name || undefined,
          email: profile?.email || undefined,
          gender: profile?.gender || undefined,
          ageGroup: profile?.ageGroup || profile?.age_group || undefined,
          age: profile?.age || undefined
        };

        const res = await fetch('http://127.0.0.1:5000/crewai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userContext)
        });

        const data = await res.json();
        // If async job created, poll for result
  if (res.status === 202 && data.job_id) {
          const jobId = data.job_id as string;
          let attempts = 0;
          const maxAttempts = 90; // ~180s with 2s interval
          let finalResult: unknown = null;
          while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 2000));
            attempts += 1;
            try {
              const sres = await fetch(`http://127.0.0.1:5000/crewai/status/${jobId}`);
              const sdata = await sres.json();
              if (sdata.status === 'done') {
                finalResult = sdata.result;
                break;
              } else if (sdata.status === 'error') {
                finalResult = sdata.result || null;
                break;
              }
                          } catch (pollErr) { console.warn(pollErr);
                    console.warn('Auto-poll error', pollErr);
                  }
          }

          if (finalResult) {
            // try parsing if it's JSON-like
            try {
              const parsed = typeof finalResult === 'string' ? JSON.parse(finalResult) : finalResult;
              const longTerm = parsed.long_term || parsed.longTerm || [];
              // If long-term content present, show a loading state for 8s before revealing it
              if (longTerm && (Array.isArray(longTerm) ? longTerm.length > 0 : String(longTerm).trim())) {
                setIsCrewAILoading(true);
                setCrewAISolution(null);
                // wait minimum 8s to show loading to the user
                await new Promise(r => setTimeout(r, 8000));
                if (Array.isArray(longTerm)) setCrewAISolution(longTerm.map(String).join('\n\n'));
                else setCrewAISolution(String(longTerm));
                setIsCrewAILoading(false);
              } else {
                setCrewAILongTerm([]);
              }
            } catch (err) { console.warn(err);
              // fallback to raw string in array: show after loading delay
              setIsCrewAILoading(true);
              setCrewAISolution(null);
              await new Promise(r => setTimeout(r, 8000));
              setCrewAISolution(String(finalResult));
              setIsCrewAILoading(false);
            }
          } else {
            setCrewAILongTerm([]);
          }
        } else {
          const longTerm = data.long_term || data.longTerm || [];
          if (longTerm && (Array.isArray(longTerm) ? longTerm.length > 0 : String(longTerm).trim())) {
            setIsCrewAILoading(true);
            setCrewAISolution(null);
            await new Promise(r => setTimeout(r, 8000));
            if (Array.isArray(longTerm)) setCrewAISolution(longTerm.map(String).join('\n\n'));
            else setCrewAISolution(String(longTerm));
            setIsCrewAILoading(false);
          } else {
            setCrewAILongTerm([]);
          }
        }
      } catch (err) { console.warn(err);
        console.warn('Auto CrewAI call failed', err);
        setCrewAILongTerm([]);
      } finally {
        setCrewAISolutionFetched(currentEmotion);
      }
    })();
  }
}, [currentEmotion, userDescription, crewAISolutionFetched, profile?.name, profile?.email, profile?.gender, profile?.ageGroup, profile?.age_group, profile?.age]);

// Trigger a 6-second stability timer for negative emotions to show immediate popup
const fetchImmediateSolutions = React.useCallback(async (cleanEmotion: Emotion) => {
  setIsImmediateLoading(true);
  setImmediateSolutions(null);

  const localFallback = avoidanceMethodsData.find(a => a.emotion === cleanEmotion)?.temporaryMethods || null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('http://127.0.0.1:5000/crewai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emotion: cleanEmotion, reason: userDescription, immediate: true, name: profile?.name || undefined }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (res.status === 202) {
      // backend accepted async job — show loading and keep localFallback as a temporary view
      setImmediateSolutions(localFallback);
      // poll the job id if provided
      try {
        const dataAck = await res.json();
        const jobId = dataAck.job_id;
        if (jobId) {
          // poll until done or timeout
          let attempts = 0;
          const maxAttempts = 30;
          while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1500));
            attempts += 1;
            try {
              const sres = await fetch(`http://127.0.0.1:5000/crewai/status/${jobId}`);
              const sdata = await sres.json();
              if (sdata.status === 'done' && sdata.result) {
                // expect result to contain short_term/immediate
                try {
                  const parsed = typeof sdata.result === 'string' ? JSON.parse(sdata.result) : sdata.result;
                  const sols = parsed.short_term || parsed.immediate || parsed.solutions || parsed.solution || null;
                  if (sols) {
                    if (Array.isArray(sols)) setImmediateSolutions(sols.map(String));
                    else if (typeof sols === 'string') setImmediateSolutions([sols]);
                    break;
                  }
                } catch { /* ignore parse errors */ }
              }
            } catch { /* ignore poll errors */ }
          }
        }
  } catch { /* ignore ack parse errors */ }
    } else {
      const data = await res.json();
      const sols = data.short_term || data.immediate || data.solution || data.solutions || null;
      if (sols) {
        if (Array.isArray(sols)) setImmediateSolutions(sols.map(String));
        else if (typeof sols === 'string') setImmediateSolutions([sols]);
        else setImmediateSolutions(localFallback);
      } else {
        setImmediateSolutions(localFallback);
      }
    }
  } catch (err) { void err;
    setImmediateSolutions(localFallback);
  } finally {
    setIsImmediateLoading(false);
  }
}, [userDescription, profile?.name]);

  const prevCameraRef = useRef<boolean>(false);

  // Show immediate support 6s after the camera is stopped (true -> false)
  useEffect(() => {
    // clear any existing timer
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }

    const prev = prevCameraRef.current;
    prevCameraRef.current = isCameraActive;

    // If camera transitioned from active to inactive, schedule popup
    if (prev && !isCameraActive) {
      const cleanEmotion = currentEmotion ? currentEmotion.replace(/[^\w]/g, '') : '';
      popupTimerRef.current = setTimeout(() => {
        // only show if camera still inactive
        if (!isCameraActive) {
          setShowImmediatePopup(true);
          fetchImmediateSolutions(cleanEmotion as Emotion);
        }
      }, 6000);
    } else if (isCameraActive) {
      // camera active -> cancel/ensure popup hidden
      setShowImmediatePopup(false);
      setImmediateSolutions(null);
      setIsImmediateLoading(false);
    }

    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
        popupTimerRef.current = null;
      }
    };
  }, [isCameraActive, currentEmotion, fetchImmediateSolutions]);

// (fetchImmediateSolutions implemented above with useCallback)


  // Start emotion detection when camera becomes active
useEffect(() => {
  let interval: NodeJS.Timeout | null = null;

  if (isCameraActive && videoRef.current) {
    interval = setInterval(() => {
      captureAndSendFrame(); // Sends image to backend
    }, 5000);
  }

  // When mic is active and detectionMode includes voice, start periodic short recordings
  if (isMicActive && (detectionMode === 'voice' || detectionMode === 'both')) {
    // immediately record once, then schedule
    recordAndSendAudio();
    audioIntervalRef.current = setInterval(() => recordAndSendAudio(), 5000);
  }

  return () => {
    if (interval) clearInterval(interval);
    if (audioIntervalRef.current) { clearInterval(audioIntervalRef.current); audioIntervalRef.current = null; }

    // stop audio stream if mic not active
    if (!isMicActive && audioStreamRef.current) {
      try { audioStreamRef.current.getTracks().forEach(t => t.stop()); } catch (e) { void e; }
      audioStreamRef.current = null;
    }
  };
}, [isCameraActive, captureAndSendFrame, isMicActive, detectionMode, recordAndSendAudio]);



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);


useEffect(() => {
  const cleanEmotion = currentEmotion.replace(/[^\w]/g, '') as Emotion;
  const musicRec = musicTherapy[cleanEmotion as keyof typeof musicTherapy];

  if (!musicRec || cleanEmotion === 'Happy') {
    // Stop music on happy or undefined emotion
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    return;
  }

  if (musicRec.audioUrl) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(musicRec.audioUrl);
    audio.volume = 0.7;
    audio.loop = false;
  // Do not autoplay background music when emotion is detected.
  // Autoplay was removed to avoid unexpected audio starting; audio is preloaded
  // so a user gesture can start playback if desired.
  audio.preload = 'auto';

    audioRef.current = audio;
  }

  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, [currentEmotion]);

  // Auto-open CrewAI details for long or multiline recommendations
  useEffect(() => {
    if (!crewAISolution) return;
    // only consider auto-open for string solutions
    const shouldOpen = (typeof crewAISolution === 'string') && (crewAISolution.includes('\n') || crewAISolution.length > 220);
    let t: NodeJS.Timeout | null = null;
    if (shouldOpen) {
      t = setTimeout(() => setShowCrewAIPopup(true), 2000);
    }
    return () => { if (t) clearTimeout(t); };
  }, [crewAISolution]);

  // Parse solution text (or array) into discrete steps (split on blank lines) and initialize completion map
  const parseSteps = React.useCallback((input: string | string[] | null | undefined) => {
    if (!input) return [] as string[];
    let text = '';
    if (Array.isArray(input)) text = input.join('\n');
    else text = String(input);
    return text
      .split(/\n{1,}/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.replace(/^\s*\d+\.\s*/, '').replace(/^[-•]\s*/, ''));
  }, []);

  // Heuristic: detect greeting-only lines like "Hey Malki," "Hello," "Hi Alex" so we don't show action buttons
  const isGreetingLine = React.useCallback((s: string | null | undefined) => {
    if (!s) return false;
    const t = String(s).trim();
    // common salutations
    const salutations = /^(hi|hello|hey|dear)\b/i;
    if (salutations.test(t)) return true;
    // single-word name with trailing comma or short greeting like "Hey Malki," or just "Malki,"
    if (/^[A-Za-zÀ-ÖØ-öø-ÿ\-']{2,20},?$/.test(t) && t.length <= 25 && /,$/.test(t)) return true;
    return false;
  }, []);

  useEffect(() => {
    if (!crewAISolution) {
      setCrewAIStepCompleted({});
      return;
    }
    const steps = parseSteps(crewAISolution);
    const initial: Record<number, boolean> = {};
    steps.forEach((_, i) => { initial[i] = false; });
    setCrewAIStepCompleted(initial);
  }, [crewAISolution, parseSteps]);


  return (
    <div className={`w-screen h-screen bg-gradient-to-br ${theme.bg} overflow-hidden transition-all duration-1000`}>
      {/* Top Navigation Bar */}
      <div className={`h-16 ${theme.navBg} backdrop-blur-xl border-b ${theme.border} flex items-center justify-between px-6 shadow-sm`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${theme.accent} rounded-xl flex items-center justify-center shadow-lg`}>
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className={`text-xl font-bold ${theme.textPrimary} tracking-tight`}
             style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>EmotionAid</h1>
            <p className={`text-xs ${theme.textSecondary} font-medium`}
             style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>AI Wellness Platform • {theme.name} Mode</p>
          </div>
        </div>

        {/* Center - Three Neural Network Animations with different colors */}
        <div className="flex-1 flex justify-center items-center gap-4 px-8">
          {/* Gray Animation */}
          <NeuralNetwork 
            size={140} 
            nodes={10} 
            horizontal={true} 
            color="#6b7289" 
            lineColor="#9ca3af"
          />
          {/* Red Animation */}
          <NeuralNetwork 
            size={140} 
            nodes={10} 
            horizontal={true} 
            color="red" 
            lineColor="#fca5a5"
          />
          {/* Yellow Animation */}
          <NeuralNetwork 
            size={140} 
            nodes={10} 
            horizontal={true} 
            color="#eab308" 
            lineColor="#fde047"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 ${theme.statusBg} rounded-full border ${theme.border}`}>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${theme.statusText}`}
             style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Smart Detection</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 ${theme.statusBg} rounded-lg border ${theme.border}`}>
              <Zap className={`w-4 h-4 ${theme.textSecondary}`} />
              <span className={`text-sm font-bold ${theme.textPrimary}`} style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>{confidence}%</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center justify-center w-10 h-10 ${theme.statusBg} rounded-lg border ${theme.border} hover:scale-105 transition-all duration-200`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className={`w-5 h-5 ${theme.textSecondary}`} />
              ) : (
                <Moon className={`w-5 h-5 ${theme.textSecondary}`} />
              )}
            </button>

            <div className="relative">
              <button
                ref={notificationsButtonRef}
                onClick={() => setIsNotificationsOpen(s => !s)}
                className={`flex items-center space-x-2 px-3 py-2 ${theme.statusBg} rounded-lg border ${theme.border}`}
                aria-expanded={isNotificationsOpen}
              >
                <Bell className={`w-4 h-4 ${theme.textSecondary}`} />
                <span className={`text-sm font-bold ${theme.textPrimary}`} style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>{notifications.filter(n => !n.read).length}</span>
              </button>

              {isNotificationsOpen && typeof document !== 'undefined' && createPortal(
                <div
                  ref={notificationsMenuRef}
                  className={`absolute w-80 ${theme.cardBg} rounded-xl shadow-xl border ${theme.border} p-4 z-[99998] text-sm ${theme.textPrimary}`}
                  style={notificationsPosition ? { position: 'fixed', top: notificationsPosition.top, left: notificationsPosition.left } : { position: 'fixed', right: 24, top: 64 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-semibold ${theme.textPrimary}`}>Notifications</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => markNotificationRead()} className={`text-xs ${theme.textSecondary} hover:underline`}>Mark all read</button>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                    {notifications.length === 0 && <div className={`text-sm ${theme.textSecondary}`}>No notifications</div>}
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-lg border ${theme.border} ${n.read ? 'bg-transparent' : isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-3">
                            <div className={`text-sm font-semibold ${theme.textPrimary}`}>{n.title}</div>
                            {n.message && <div className={`text-xs mt-1 ${theme.textSecondary}`}>{n.message}</div>}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} ml-2 whitespace-nowrap`}>{new Date(n.time).toLocaleTimeString()}</div>
                        </div>
                        {!n.read && <div className="mt-2 text-right"><button onClick={() => markNotificationRead(n.id)} className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Mark read</button></div>}
                      </div>
                    ))}
                  </div>
                </div>
              , document.body)}
            </div>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <div
              ref={avatarRef}
              onClick={() => setIsProfileMenuOpen(s => !s)}
              className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-md ${profile?.photoDataUrl ? 'overflow-hidden' : `bg-gradient-to-br ${profile?.name ? getAvatarColor(profile.name) : theme.accent}`}`}
            >
              {profile?.photoDataUrl ? (
                <Image src={profile.photoDataUrl} alt="avatar" width={40} height={40} className="object-cover w-10 h-10 rounded-full" />
              ) : profile?.name ? (
                <div className="text-lg font-bold text-white">{profile.name.charAt(0).toUpperCase()}</div>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>

            {isProfileMenuOpen && typeof document !== 'undefined' && createPortal(
              <div
                ref={menuRef}
                className={`absolute w-64 bg-white rounded-xl shadow-xl border ${theme.border} p-3 z-[99999]`}
                style={menuPosition ? { position: 'fixed', top: menuPosition.top, left: menuPosition.left } : { position: 'fixed', right: 24, top: 64 }}
              >
                {!isEditingProfile ? (
                  <>
                    <div className="flex items-center space-x-3 mb-3">
                      {profile?.photoDataUrl ? (
                        <Image src={profile.photoDataUrl} alt="avatar" width={48} height={48} className="rounded-full object-cover w-12 h-12" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${profile?.name ? getAvatarColor(profile.name) : 'from-slate-400 to-slate-500'} flex items-center justify-center text-lg font-bold text-white shadow-md`}>
                          {profile?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{profile?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">
                          {profile?.email && <div>{profile.email}</div>}
                          <div>
                            {profile?.gender || 'Not specified'}
                            {(profile?.ageGroup || profile?.age_group || profile?.age) ? (
                              <span className="text-xs text-slate-400"> &middot; {profile?.ageGroup || profile?.age_group || `Age ${Math.round(profile.age as number)}`}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setIsEditingProfile(true);
                          setTempPhotoDataUrl(profile?.photoDataUrl || null);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md bg-slate-100 text-slate-800 font-medium hover:bg-slate-200"
                      >
                        Edit Profile Picture
                      </button>

                      <button
                        onClick={() => {
                          try { localStorage.removeItem('emotionAidUser'); } catch (err) { void err; }
                          setProfile(null);
                          setIsProfileMenuOpen(false);
                          router.push('/auth');
                        }}
                        className="w-full text-left px-3 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Change profile picture</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                        {tempPhotoDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tempPhotoDataUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-400">No preview</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              const result = reader.result as string;
                              setTempPhotoDataUrl(result);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="text-xs"
                        />
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={async () => {
                                try {
                                  const existing = profile || { name: 'User', gender: '' };
                                  const updated: { name: string; gender: string; photoDataUrl?: string | null; age_group?: string; age?: number } = { ...existing, photoDataUrl: tempPhotoDataUrl };
                                  // persist immediately
                                  localStorage.setItem('emotionAidUser', JSON.stringify(updated));
                                  setProfile(updated);

                                  // Age prediction will be handled by the centralized effect (prevents duplicate requests)

                                  setIsEditingProfile(false);
                                  setIsProfileMenuOpen(false);
                                } catch (err) { console.warn(err); }
                              }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingProfile(false);
                              setTempPhotoDataUrl(null);
                            }}
                            className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            , document.body)}
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Left Sidebar */}
        <div className={`w-64 ${theme.sidebarBg} backdrop-blur-xl border-r ${theme.border} flex flex-col shadow-sm`}>
          <div className="flex-1 py-6">
            <nav className="space-y-2 px-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'history') {
                      setShowHistoryPanel(true);
                      setShowGoalsPanel(false);
                    } else if (item.id === 'goals') {
                      setShowGoalsPanel(true);
                      setShowHistoryPanel(false);
                    } else {
                      setActiveMenu(item.id);
                      setShowHistoryPanel(false);
                      setShowGoalsPanel(false);
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeMenu === item.id || (item.id === 'history' && showHistoryPanel) || (item.id === 'goals' && showGoalsPanel)
                      ? `${theme.statusBg} ${theme.textSecondary} border ${theme.border}`
                      : `${theme.textPrimary} hover:${theme.statusBg} hover:${theme.textSecondary}`
                  }`}
                  style={{ userSelect: 'none' }}
                >
                  <div className={activeMenu === item.id || (item.id === 'history' && showHistoryPanel) || (item.id === 'goals' && showGoalsPanel) ? theme.textSecondary : "text-slate-500"}>
                    {item.icon}
                  </div>
                  <span style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif', userSelect: 'none' }}>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Detection Mode Selector */}
          <div className="p-4 border-t border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3"
             style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Detection Mode</h3>
            <div className="grid grid-cols-3 gap-2">
              {detectionModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setDetectionMode(mode.id)}
                  className={`flex flex-col items-center p-3 rounded-xl text-xs transition-all relative ${
                    detectionMode === mode.id
                      ? `${mode.bgColor} ${mode.color} border-2 ${mode.color.replace('text-', 'border-')} shadow-md`
                      : `bg-white hover:${mode.bgColor} border-2 border-slate-200 hover:${mode.color.replace('text-', 'border-')} hover:shadow-sm text-slate-600`
                  }`}
                >
                  <div className={`mb-2 ${detectionMode === mode.id ? mode.color : "text-slate-500"}`}>
                    {mode.icon}
                  </div>
                  <span className="font-medium"
                   style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>{mode.label}</span>
                  
                  {/* Status Badge */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${
                    mode.status === "Ready" 
                      ? "bg-emerald-500 text-white" 
                      : "bg-orange-400 text-white"
                  }`}>
                    {mode.status === "Ready" ? "✓" : "⏱"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice/Camera Controls */}
          <div className={`p-4 border-t ${theme.border}`}>
            <div className="space-y-3">
              {(detectionMode === "face" || detectionMode === "both") && (
                <button
                  onClick={toggleCamera}
                  className={`w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isCameraActive
                      ? `bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border border-red-400`
                      : `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border border-blue-400`
                  }`}
                >
                  {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  <span className="text-sm">{isCameraActive ? "Stop Camera" : "Start Camera"}</span>
                </button>
              )}

              {(detectionMode === "voice" || detectionMode === "both") && (
                <button
                  onClick={() => {
                    if (!isMicActive) {
                      // Show voice instruction when turning mic on
                      setShowVoiceInstruction(true);
                      setVoiceCountdown(6);
                      setIsMicActive(true);
                    } else {
                      // Turn off mic
                      setIsMicActive(false);
                      setShowVoiceInstruction(false);
                      setIsRecordingVoice(false);
                    }
                  }}
                  className={`w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isMicActive
                      ? `bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg border border-emerald-400`
                      : `bg-white border ${theme.border} ${theme.textPrimary} hover:bg-slate-50 hover:border-emerald-300`
                  }`}
                >
                  {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span className="text-sm">{isMicActive ? "Mic ON" : "Mic OFF"}</span>
                </button>
              )}

              <div className="text-xs text-slate-500 text-center pt-2">
                {detectionMode === "face" ? "Face detection mode" : 
                 detectionMode === "voice" ? "Voice detection mode" : 
                 "Multi-modal detection active"}
              </div>
            </div>
          </div>
        </div>

  {/* Main Content Area */}
  <div className="flex-1 p-6 grid grid-cols-2 gap-6 overflow-y-auto h-full" style={{ minHeight: 0 }}>
          {/* Left Column */}
          <div className="space-y-6">
            <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Live Emotion Analysis</h2>
                <div className={`px-3 py-1 ${theme.statusBg} rounded-full border ${theme.border}`}>
                  <span className={`text-xs font-medium ${theme.statusText}`}>
                    {currentEmotion ? "DETECTED" : isCameraActive ? "ANALYZING" : "INACTIVE"}
                  </span>
                </div>
              </div>

              {/* Camera Feed */}
              <div className="relative mb-6">
                <div className="relative w-full h-full">
  {/* Always keep video mounted */}
  <video 
    ref={videoRef}
    autoPlay 
    playsInline 
    muted
    className="w-full h-full object-cover rounded-xl"
    style={{ display: isCameraActive ? 'block' : 'none' }} // ✅ hide without unmounting
  />

  {/* Live tag and bottom mode display */}
  {isCameraActive && (
    <>
      <div className="absolute top-3 left-3 flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full"
         style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>
          LIVE
        </span>
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <div className={`${theme.statusBg} bg-opacity-90 backdrop-blur-sm rounded-lg p-2`}>
          <p className={`${theme.textSecondary} text-xs font-medium text-center`}
           style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>
            AI Processing • {detectionMode.charAt(0).toUpperCase() + detectionMode.slice(1)} Mode
          </p>
        </div>
      </div>
    </>
  )}

  {/* Error display */}
  {!isCameraActive && cameraError && (
    <div className="text-center text-red-600 p-4">
      <CameraOff className="w-16 h-16 mx-auto mb-2 opacity-60" />
      <p className="font-medium mb-2"
       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Camera Error</p>
      <p className="text-sm">{cameraError}</p>
      <button 
        onClick={toggleCamera}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600" 
        style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
      >
        Try Again
      </button>
    </div>
  )}

  {/* Voice mode placeholder */}
  {!isCameraActive && !cameraError && detectionMode === "voice" && (
    <div className="text-center">
      <div className={`w-28 h-28 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
        <Mic className="w-8 h-8 text-white" />
      </div>
      <p className={`${theme.textSecondary} text-sm font-medium`}
       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Voice Analysis Mode</p>
      <p className="text-xs text-emerald-600 mt-1"
       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Audio Processing Active</p>
    </div>
  )}

  {/* Default inactive camera state */}
  {!isCameraActive && !cameraError && detectionMode !== "voice" && (
    <div className="text-center text-slate-500">
      <div className={`w-28 h-28 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg opacity-50`}>
        <Camera className="w-8 h-8 text-white" />
      </div>
      <p className="font-medium mb-2"
       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Camera Ready</p>
      <p className="text-sm"
       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Click &quot;Start Camera&quot; to begin emotion detection</p>
    </div>
  )}
</div>

              </div>
              
              {/* Emotion Result */}
              <div className={`bg-gradient-to-br ${theme.statusBg} rounded-xl p-6 border ${theme.border}`}>
                {currentEmotion ? (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <p className={`text-3xl font-bold ${theme.textPrimary}`}>{currentEmotion}</p>
                      <div className="text-xs bg-white/70 px-2 py-1 rounded-full text-slate-600"
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>
                        AI Enhanced
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className={`text-sm font-medium ${theme.textSecondary}`}
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Confidence Level</p>
                      <div className="w-full bg-white/70 rounded-full h-3 shadow-inner">
                        <div
                          className={`bg-gradient-to-r ${theme.accent} h-3 rounded-full transition-all duration-1000 shadow-sm`}
                          style={{ width: `${confidence}%` }}
                        ></div>
                      </div>
                      <p className={`text-lg font-bold ${theme.textPrimary}`}>{confidence}%</p>
                    </div>
                    
                    {/* All Emotions Breakdown - only show when emotion is detected */}
                    <div className="mt-4 pt-4 border-t ">
                      <p className="text-xs text-slate-1000 mb-2"
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>All Detected Emotions</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {displayEmotionList.map((item) => (
                          <div 
                            key={item.key}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              item.label === currentEmotion || item.label.includes(currentEmotion) 
                                ? 'bg-white/80 font-semibold ' + theme.textSecondary
                                : 'bg-white/40 text-slate-500'
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className={item.label === currentEmotion || item.label.includes(currentEmotion) ? theme.textSecondary : 'text-slate-500'}>
                              {item.confidence}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg opacity-50`}>
                      <span className="text-3xl">🤖</span>
                    </div>
                    <p className={`text-lg font-semibold ${theme.textPrimary} mb-2`}>
                      {isCameraActive ? "Analyzing your emotion..." : "Start camera to detect emotions"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {isCameraActive ? "AI is processing your facial expressions" : "Enable camera access to begin emotion detection"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Analysis Display */}
            {(detectionMode === "voice" || detectionMode === "both") && (
              <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}
                 style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>
                  <Mic className={`mr-2 ${theme.textSecondary}`} size={18} />
                  Voice Pattern Analysis
                </h3>
                <div className={`h-24 ${theme.statusBg} rounded-xl p-4 border ${theme.border}`}>
                  {isMicActive ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="flex space-x-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-gradient-to-t ${theme.accent} rounded-full animate-pulse`}
                            style={{ 
                              height: `${20 + Math.sin(Date.now() / 200 + i) * 15}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500 text-sm"
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Enable microphone to analyze voice patterns</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Smart Recommendations + User Description */}
          <div className="space-y-6">
            <h2 className={`text-xl font-bold ${theme.textPrimary} flex items-center`}
             style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>
              <Brain className={`mr-2 ${theme.textSecondary}`} size={20} />
              Smart Wellness Solutions
            </h2>

            {/* Optional user problem description + CrewAI integration */}
            {currentEmotion && (
              <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
                <h3 className={`text-md font-semibold ${theme.textPrimary} mb-2`}>Want to explain your problem?</h3>
                <textarea
                  value={userDescription}
                  onChange={e => setUserDescription(e.target.value)}
                  placeholder="Describe your problem (optional)"
                  className="w-full p-3 rounded-lg border border-slate-200 mb-2 text-sm text-gray-900 placeholder:text-gray-700"
                  rows={3}
                />
                <button
                  onClick={async () => {
                    setIsCrewAILoading(true);
                    setCrewAISolution(null);
                    let didTimeout = false;
                    let timeoutId: NodeJS.Timeout | null = null;
                    try {
                        timeoutId = setTimeout(() => {
                          didTimeout = true;
                          setIsCrewAILoading(false);
                          setCrewAISolution('Request timed out. Please try again.');
                        }, 180000); // 3 minutes timeout for entire flow

                        const res = await fetch('http://127.0.0.1:5000/crewai/recommend', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ emotion: currentEmotion, reason: userDescription, name: profile?.name || undefined })
                        });

                        const data = await res.json();
                        // If backend returned a job id (async mode), poll for result
                        if (res.status === 202 && data.job_id) {
                          const jobId = data.job_id as string;
                          let attempts = 0;
                          const maxAttempts = 90; // ~180s with 2s interval
                          let finalResult: string | null = null;
                          while (attempts < maxAttempts && !didTimeout) {
                            await new Promise(r => setTimeout(r, 2000));
                            attempts += 1;
                            try {
                              const sres = await fetch(`http://127.0.0.1:5000/crewai/status/${jobId}`);
                              const sdata = await sres.json();
                              if (sdata.status === 'done') {
                                finalResult = sdata.result;
                                break;
                              } else if (sdata.status === 'error') {
                                finalResult = sdata.result || 'Error running CrewAI.';
                                break;
                              }
                            } catch (err) { console.warn(err);
                              console.warn('Polling error', err);
                            }
                          }

                          if (timeoutId) clearTimeout(timeoutId);
                          if (!didTimeout) {
                            if (finalResult) {
                                // show loading for 8s before revealing long-form solution
                                setIsCrewAILoading(true);
                                setCrewAISolution(null);
                                await new Promise(r => setTimeout(r, 8000));
                                setCrewAISolution(finalResult);
                                setIsCrewAILoading(false);
                            } else {
                              setCrewAISolution('Request timed out. Please try again.');
                            }
                            setIsCrewAILoading(false);
                          }
                        } else {
                          if (timeoutId) clearTimeout(timeoutId);
                          if (!didTimeout) {
                              if (data.solution) {
                                setIsCrewAILoading(true);
                                setCrewAISolution(null);
                                await new Promise(r => setTimeout(r, 8000));
                                setCrewAISolution(data.solution);
                                setIsCrewAILoading(false);
                              } else if (data.error) {
                                setCrewAISolution(data.error);
                                setIsCrewAILoading(false);
                              } else {
                                setCrewAISolution(null);
                                setIsCrewAILoading(false);
                              }
                          }
                        }
                    } catch (err) { console.warn(err);
                        if (timeoutId) clearTimeout(timeoutId);
                        if (!didTimeout) {
                          setCrewAISolution('Error connecting to CrewAI backend.');
                          setIsCrewAILoading(false);
                        }
                    }
                  }}
                  disabled={isCrewAILoading}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${!isCrewAILoading ?
                    (currentEmotion.toLowerCase().includes('sad') ? 'bg-blue-600 hover:bg-blue-700' :
                    currentEmotion.toLowerCase().includes('angry') ? 'bg-rose-600 hover:bg-rose-700' :
                    currentEmotion.toLowerCase().includes('happy') ? 'bg-yellow-500 hover:bg-yellow-600' :
                    currentEmotion.toLowerCase().includes('fear') ? 'bg-purple-600 hover:bg-purple-700' :
                    currentEmotion.toLowerCase().includes('disgust') ? 'bg-green-600 hover:bg-green-700' :
                    currentEmotion.toLowerCase().includes('surprise') ? 'bg-pink-600 hover:bg-pink-700' :
                    'bg-slate-600 hover:bg-slate-700')
                  : 'bg-slate-400 cursor-not-allowed'}`}
                >
                  {isCrewAILoading ? 'Loading...' : 'Get Solution Recommendation'}
                </button>
                {crewAISolution && (
                  <div className="mt-4 flex items-start gap-3">
                    <div className="flex-1 rounded-lg bg-blue-50 border border-blue-200 p-3 max-w-4xl w-full">
                      <h4 className={`font-semibold ${theme.textSecondary} mb-2`}>CrewAI Solution Recommendation</h4>
                      <p className={`text-sm ${theme.textPrimary} whitespace-pre-line leading-relaxed line-clamp-3`}>{crewAISolution}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <button
                        onClick={() => setShowCrewAIPopup(true)}
                        className={`px-4 py-2 rounded-md font-semibold text-white ${currentEmotion.toLowerCase().includes('sad') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-800'}`}
                      >
                        Open
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(crewAISolution || '');
                            // small visual confirmation could be added later
                          } catch (err) { void err; }
                        }}
                        className="px-3 py-2 rounded-md border text-sm font-semibold text-black bg-white"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {currentEmotion ? (
              <SmartRecommendations 
                currentEmotion={currentEmotion}
                theme={theme}
                setUserDescription={setUserDescription}
              />
            ) : (
              <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-8 shadow-lg text-center`}>
                <div className={`w-24 h-24 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg opacity-50`}>
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${theme.textPrimary} mb-2`}
                 style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Waiting for Emotion Detection</h3>
                <p className="text-slate-500 mb-4">
                  {!isCameraActive ? "Start your camera to begin emotion analysis" :
                   "Look at the camera to detect your emotion"}
                </p>
                <div className="space-y-2 text-sm text-slate-400"
                 style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                >
                  <p  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>✨ Personalized wellness recommendations</p>
                  <p  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>🎯 Targeted coping strategies</p>
                  <p  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>🎵 Music therapy suggestions</p>
                  <p  style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>📚 Professional guidance</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Non-blocking Immediate Solutions Popup */}
      {showImmediatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowImmediatePopup(false)} />

          <div className={`relative w-full max-w-3xl mx-4 bg-white rounded-xl border ${theme.border} p-6 shadow-lg overflow-visible`} role="dialog" aria-modal="true">
            <button aria-label="Close immediate support" onClick={() => setShowImmediatePopup(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 flex items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br ${theme.accent}`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${theme.accent}`}>
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className={`text-xl font-bold ${theme.textPrimary}`}>{cleanEmotionForUI} — Immediate Support</h3>
                <p className={`text-sm ${theme.textSecondary} mt-1`}>Quick, focused tips to help you cope right now.</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="flex flex-col h-full">
                    {isImmediateLoading && <div className="text-sm text-slate-500">Loading suggestions…</div>}

                    {!isImmediateLoading && immediateSolutions && (
                      <div className="flex flex-col h-full">
                        <div className={`p-5 rounded-2xl mb-4 border ${theme.border} bg-white shadow-sm flex flex-col justify-between`} style={{ borderWidth: 1, minHeight: 180 }}>
                          <div>
                            <div className={`text-sm ${theme.textSecondary} mb-2`}>Top quick tip</div>
                            <div className={`mt-1 text-lg font-semibold ${theme.textPrimary}`}>{parseSteps(immediateSolutions)[0]}</div>
                          </div>
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              ref={primaryActionRef}
                              onClick={() => { /* primary action placeholder */ }}
                              className={`px-4 py-2 rounded-md font-semibold text-white ${primaryColorClass}`}
                            >
                              Try now
                            </button>
                            <button
                              onClick={() => setShowMoreTips(s => !s)}
                              className="px-4 py-2 rounded-md border text-sm font-semibold text-black"
                            >
                              {showMoreTips ? 'Hide tips' : 'More tips'}
                            </button>
                          </div>
                        </div>

                        {showMoreTips && (
                          <div className={`mt-2 ${theme.cardBg} rounded-lg p-3 border ${theme.border}`} style={{ minHeight: 120 }}>
                            <div className={`text-sm font-medium ${theme.textPrimary} mb-2`}>Other helpful actions</div>
                            <ul className={`space-y-2 text-sm ${theme.textSecondary}`}>
                              {parseSteps(immediateSolutions).slice(1).map((s, i) => (
                                <li key={i} className="flex items-start">
                                  <div className="w-6 flex-shrink-0 text-lg mr-3" aria-hidden>•</div>
                                  <div className="flex-1 break-words">{s}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col h-full">
                    <div className={`text-sm ${theme.textSecondary} mb-1`}>Recommended short video</div>
                    <div className={`rounded-lg overflow-hidden w-full bg-transparent border-t border-b border-white/10`} style={{ minHeight: 180 }}>
                      <div className="w-full h-full flex items-start justify-center p-3">
                        <YouTubeEmbed videoId={musicTherapy[cleanEmotionForUI as keyof typeof musicTherapy].videoId} title={`${cleanEmotionForUI} calming video`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CrewAI full detail popup for long-term recommendations */}
      {showCrewAIPopup && crewAISolution && (
        // align to top with padding so tall modals are fully reachable on small screens; inner container scrolls
        <div className="fixed inset-0 z-60 flex items-start justify-center py-8">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCrewAIPopup(false)} />
          <div className={`relative w-full max-w-3xl mx-4 bg-white rounded-xl border ${theme.border} p-6 shadow-2xl max-h-[90vh] overflow-y-auto`} role="dialog" aria-modal="true">
            <button aria-label="Close crewai details" onClick={() => setShowCrewAIPopup(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            <h3 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>CrewAI Recommendation — Details</h3>
            <p className={`text-sm ${theme.textSecondary} mb-4`}>A fuller view of the recommendation with quick actions.</p>
            {/* Parse crewAI solution into steps and render actionable cards */}
            <div className="space-y-3 mb-4">
              {(() => {
                const steps = parseSteps(crewAISolution);
                return steps.map((step, i) => {
                  const greeting = isGreetingLine(step);
                  // compute visible number skipping greetings
                  const visibleNumber = greeting ? null : (steps.slice(0, i).filter(s => !isGreetingLine(s)).length + 1);
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${theme.border} bg-white shadow-sm flex items-start gap-4`}>
                        {greeting ? (
                          // Attractive greeting header: avatar initial + larger friendly text
                          <>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${theme.accent}`}>
                              <span className="uppercase">{(profile?.name ? profile.name.charAt(0) : (step && step.trim().charAt(0))) || 'U'}</span>
                            </div>
                            <div className="flex-1">
                              {(() => {
                                const cleaned = String(step || '').trim().replace(/[,!]+\s*$/,'');
                                return (
                                  <>
                                    <div className={`text-lg font-semibold ${theme.textPrimary} mb-1`}>{cleaned} <span className="inline-block ml-2">👋</span></div>
                                    <div className={`text-sm ${theme.textSecondary}`}>You’re not alone — here are a few practical steps you can try.</div>
                                  </>
                                );
                              })()}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${theme.statusBg} border ${theme.border} flex items-center justify-center font-bold ${theme.textSecondary}`}>
                              <span>{visibleNumber}</span>
                            </div>
                            <div className="flex-1">
                              <div className={`font-semibold ${theme.textPrimary} mb-1`}>{step}</div>

                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => setCrewAIStepCompleted(prev => ({ ...prev, [i]: true }))}
                                  className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${primaryColorClass}`}
                                >Do now</button>
                                <button
                                  onClick={async () => { try { await navigator.clipboard.writeText(step); } catch (e) { void e; } }}
                                  className="px-3 py-1 rounded-md border text-sm font-semibold text-black bg-white"
                                >Copy</button>
                                <span className="text-xs text-slate-400 ml-auto">{crewAIStepCompleted[i] ? 'Done' : ''}</span>
                              </div>
                            </div>
                          </>
                        )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { try { navigator.clipboard.writeText(crewAISolution); } catch (err) { void err; } }}
                className="px-4 py-2 rounded-md border text-sm font-semibold text-black bg-white"
              >
                Copy all
              </button>
              <button
                onClick={() => {
                  try {
                    const saved = JSON.parse(localStorage.getItem('savedCrewAISolutions') || '[]');
                    saved.unshift({ text: crewAISolution, emotion: currentEmotion, date: Date.now() });
                    localStorage.setItem('savedCrewAISolutions', JSON.stringify(saved.slice(0, 20)));
                    try { addNotification('Saved solution', `Saved a recommendation for ${currentEmotion}`); } catch (e) { void e; }
                  } catch (err) { void err; }
                }}
                className={`px-4 py-2 rounded-md font-semibold text-white ${currentEmotion.toLowerCase().includes('sad') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-800'}`}
              >
                Save
              </button>
              <button onClick={() => setShowCrewAIPopup(false)} className="px-3 py-2 rounded-md text-sm border">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Emotion History Panel - Sliding from right */}
      {showHistoryPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90000] flex items-center justify-end" onClick={() => setShowHistoryPanel(false)}>
          <div 
            className={`w-full max-w-2xl h-full ${theme.cardBg} shadow-2xl overflow-y-auto animate-slide-in-right`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 ${theme.navBg} backdrop-blur-xl border-b ${theme.border} p-6 flex items-center justify-between z-10`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${theme.accent} rounded-xl flex items-center justify-center`}>
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Emotion History</h2>
                  <p className={`text-sm ${theme.textSecondary}`}>{emotionHistory.length} records tracked</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistoryPanel(false)}
                className={`w-10 h-10 ${theme.statusBg} rounded-xl flex items-center justify-center hover:scale-105 transition-all`}
              >
                <X className={`w-5 h-5 ${theme.textSecondary}`} />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="p-6 space-y-6">
              {emotionHistory.length === 0 ? (
                <div className={`text-center py-12 ${theme.textSecondary}`}>
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No emotion history yet</p>
                  <p className="text-sm mt-2">Start detecting emotions to see your timeline</p>
                </div>
              ) : (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`${theme.statusBg} rounded-xl p-4 border ${theme.border}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className={`w-4 h-4 ${theme.textSecondary}`} />
                        <span className={`text-xs font-semibold ${theme.textSecondary}`}>Most Frequent</span>
                      </div>
                      <p className={`text-2xl font-bold ${theme.textPrimary}`}>
                        {(() => {
                          const counts: Record<string, number> = {};
                          emotionHistory.forEach(r => counts[r.emotion] = (counts[r.emotion] || 0) + 1);
                          const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                          return top ? top[0] : '-';
                        })()}
                      </p>
                    </div>

                    <div className={`${theme.statusBg} rounded-xl p-4 border ${theme.border}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className={`w-4 h-4 ${theme.textSecondary}`} />
                        <span className={`text-xs font-semibold ${theme.textSecondary}`}>Last 24h</span>
                      </div>
                      <p className={`text-2xl font-bold ${theme.textPrimary}`}>
                        {emotionHistory.filter(r => Date.now() - r.timestamp < 24 * 60 * 60 * 1000).length}
                      </p>
                    </div>

                    <div className={`${theme.statusBg} rounded-xl p-4 border ${theme.border}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className={`w-4 h-4 ${theme.textSecondary}`} />
                        <span className={`text-xs font-semibold ${theme.textSecondary}`}>Avg Confidence</span>
                      </div>
                      <p className={`text-2xl font-bold ${theme.textPrimary}`}>
                        {Math.round(emotionHistory.reduce((sum, r) => sum + r.confidence, 0) / emotionHistory.length)}%
                      </p>
                    </div>
                  </div>

                  {/* Emotion Distribution Chart */}
                  <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}>
                      <BarChart3 className={`w-5 h-5 mr-2 ${theme.textSecondary}`} />
                      Emotion Distribution
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const counts: Record<string, number> = {};
                        emotionHistory.forEach(r => counts[r.emotion] = (counts[r.emotion] || 0) + 1);
                        const total = emotionHistory.length;
                        return Object.entries(counts)
                          .sort((a, b) => b[1] - a[1])
                          .map(([emotion, count]) => {
                            const percentage = Math.round((count / total) * 100);
                            const emotionColors: Record<string, string> = {
                              Happy: 'bg-amber-500',
                              Sad: 'bg-blue-500',
                              Angry: 'bg-rose-500',
                              Fearful: 'bg-purple-500',
                              Surprised: 'bg-pink-500',
                              Disgusted: 'bg-green-500',
                              Neutral: 'bg-slate-500'
                            };
                            return (
                              <div key={emotion} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className={`font-medium ${theme.textPrimary}`}>{emotion}</span>
                                  <span className={`${theme.textSecondary}`}>{count} times ({percentage}%)</span>
                                </div>
                                <div className={`w-full h-2 ${theme.statusBg} rounded-full overflow-hidden`}>
                                  <div 
                                    className={`h-full ${emotionColors[emotion] || 'bg-slate-400'} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}>
                      <Clock className={`w-5 h-5 mr-2 ${theme.textSecondary}`} />
                      Recent Timeline
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {emotionHistory.slice(0, 50).map((record, idx) => {
                        const emotionEmojis: Record<string, string> = {
                          Happy: '😊', Sad: '😢', Angry: '😠', Fearful: '😨',
                          Surprised: '😲', Disgusted: '🤢', Neutral: '😐'
                        };
                        const modeIcons: Record<string, React.ReactNode> = {
                          face: <Camera className="w-3 h-3" />,
                          voice: <Mic className="w-3 h-3" />,
                          both: <Zap className="w-3 h-3" />
                        };
                        return (
                          <div key={record.id} className={`flex items-center space-x-4 p-3 rounded-lg ${idx === 0 ? `${theme.statusBg} border ${theme.border}` : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                            <div className="text-3xl">{emotionEmojis[record.emotion]}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`font-semibold ${theme.textPrimary}`}>{record.emotion}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${theme.statusBg} ${theme.textSecondary} flex items-center space-x-1`}>
                                  {modeIcons[record.detectionMode]}
                                  <span>{record.detectionMode}</span>
                                </span>
                              </div>
                              <div className={`text-xs ${theme.textSecondary} mt-1`}>
                                {new Date(record.timestamp).toLocaleString()} • {record.confidence}% confidence
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goals & Achievements Panel */}
      {showGoalsPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90000] flex items-center justify-end" onClick={() => setShowGoalsPanel(false)}>
          <div 
            className={`w-full max-w-3xl h-full ${theme.cardBg} shadow-2xl overflow-y-auto animate-slide-in-right`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 ${theme.navBg} backdrop-blur-xl border-b ${theme.border} p-6 flex items-center justify-between z-10`}>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center animate-pulse`}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Goals & Achievements</h2>
                  <p className={`text-sm ${theme.textSecondary}`}>Level {userStats.level} • {userStats.xp} XP</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGoalsPanel(false)}
                className={`w-10 h-10 ${theme.statusBg} rounded-xl flex items-center justify-center hover:scale-105 transition-all`}
              >
                <X className={`w-5 h-5 ${theme.textSecondary}`} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Level & XP Progress */}
              <div className={`${theme.statusBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Level {userStats.level}</h3>
                    <p className={`text-sm ${theme.textSecondary}`}>{userStats.xp} / {userStats.level * 100} XP</p>
                  </div>
                  <div className="text-4xl">🎖️</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-500"
                    style={{ width: `${((userStats.xp % 100) / 100) * 100}%` }}
                  />
                </div>
                <p className={`text-xs ${theme.textSecondary} mt-2`}>
                  {100 - (userStats.xp % 100)} XP until Level {userStats.level + 1}
                </p>
              </div>

              {/* Streak Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`${theme.statusBg} rounded-xl p-4 border ${theme.border} text-center`}>
                  <Flame className={`w-8 h-8 mx-auto mb-2 text-orange-500`} />
                  <p className={`text-2xl font-bold ${theme.textPrimary}`}>{userStats.currentStreak}</p>
                  <p className={`text-xs ${theme.textSecondary}`}>Day Streak</p>
                </div>
                <div className={`${theme.statusBg} rounded-xl p-4 border ${theme.border} text-center`}>
                  <Star className={`w-8 h-8 mx-auto mb-2 text-yellow-500`} />
                  <p className={`text-2xl font-bold ${theme.textPrimary}`}>{userStats.longestStreak}</p>
                  <p className={`text-xs ${theme.textSecondary}`}>Best Streak</p>
                </div>
                <div className={`${theme.statusBg} rounded-xl p-4 border ${theme.border} text-center`}>
                  <Target className={`w-8 h-8 mx-auto mb-2 text-blue-500`} />
                  <p className={`text-2xl font-bold ${theme.textPrimary}`}>{userStats.totalDetections}</p>
                  <p className={`text-xs ${theme.textSecondary}`}>Total Checks</p>
                </div>
              </div>

              {/* Achievements by Category */}
              {['streak', 'detection', 'wellness', 'mastery'].map(category => {
                const categoryAchievements = allAchievements.filter(a => a.category === category);
                const unlockedCount = categoryAchievements.filter(a => userStats.unlockedAchievements.includes(a.id)).length;
                const categoryNames: Record<string, string> = {
                  streak: 'Streak Master',
                  detection: 'Detection Expert',
                  wellness: 'Wellness Warrior',
                  mastery: 'Emotion Master'
                };
                const categoryIcons: Record<string, React.ReactNode> = {
                  streak: <Flame className="w-5 h-5" />,
                  detection: <Target className="w-5 h-5" />,
                  wellness: <Heart className="w-5 h-5" />,
                  mastery: <Award className="w-5 h-5" />
                };

                return (
                  <div key={category} className={`${theme.cardBg} rounded-xl p-6 border ${theme.border}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={theme.textSecondary}>{categoryIcons[category]}</div>
                        <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{categoryNames[category]}</h3>
                      </div>
                      <span className={`text-sm ${theme.textSecondary}`}>
                        {unlockedCount}/{categoryAchievements.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {categoryAchievements.map(achievement => {
                        const isUnlocked = userStats.unlockedAchievements.includes(achievement.id);
                        return (
                          <div 
                            key={achievement.id}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isUnlocked 
                                ? `border-amber-500 ${theme.statusBg}` 
                                : `border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 opacity-60`
                            }`}
                          >
                            <div className="text-3xl mb-2">{achievement.icon}</div>
                            <h4 className={`font-bold text-sm ${isUnlocked ? theme.textPrimary : 'text-gray-500'}`}>
                              {achievement.title}
                            </h4>
                            <p className={`text-xs mt-1 ${isUnlocked ? theme.textSecondary : 'text-gray-400'}`}>
                              {achievement.description}
                            </p>
                            {isUnlocked && (
                              <div className="mt-2 flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                                <CheckCircle className="w-3 h-3" />
                                <span>Unlocked!</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlock Popup */}
      {showAchievementPopup && newlyUnlockedAchievement && (
        <div className="fixed top-24 right-8 z-[99999] animate-bounce">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-2xl max-w-sm border-4 border-white dark:border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="text-6xl animate-pulse">{newlyUnlockedAchievement.icon}</div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold mb-1">🎉 Achievement Unlocked!</p>
                <h3 className="text-white text-xl font-bold mb-1">{newlyUnlockedAchievement.title}</h3>
                <p className="text-white/90 text-sm">{newlyUnlockedAchievement.description}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAchievementPopup(false)}
              className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-all"
            >
              Awesome! ✨
            </button>
          </div>
        </div>
      )}

      {/* Voice Instruction Overlay */}
      {showVoiceInstruction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100000]">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-12 shadow-2xl max-w-md text-center transform animate-pulse">
            <div className="mb-6">
              <Mic className="w-20 h-20 text-white mx-auto mb-4 animate-bounce" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Get Ready!</h2>
            <p className="text-xl text-white/90 mb-6 leading-relaxed px-4">
              Please say: <span className="font-bold">&quot;I am feeling different emotions today and would like to understand them better&quot;</span>
            </p>
            <div className="text-7xl font-bold text-white mb-4">{voiceCountdown}</div>
            <p className="text-lg text-white/80">Recording will start automatically...</p>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecordingVoice && (
        <div className="fixed top-24 right-8 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 z-[99999] animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
          <span className="font-bold">Recording Voice... (6s)</span>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className={`h-12 ${theme.navBg} backdrop-blur-xl border-t ${theme.border} flex items-center justify-between px-6 shadow-sm`}>
        <p className={`text-sm text-slate-600 font-medium`}>🔒 Privacy First • Processing locally with AI enhancement</p>
        <p className={`text-sm ${theme.textSecondary} font-medium`}>EmotionAid v2.0.0 • Smart Edition</p>
      </div>
    </div>
  );
};

export default EnhancedEmotionAid;