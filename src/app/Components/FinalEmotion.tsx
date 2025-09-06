"use client";
import React, { useState,useEffect , useRef } from "react";
import {
  Mic,
  Camera,
  User,
  Settings,
  BarChart3,
  History,
  Home,
  MicOff,
  CameraOff,
  Bell,
  Zap,
  Heart,
  CheckCircle,
  Database,
  Lightbulb,
  Music,
  Brain,
  Target,
  TrendingUp,
  Clock
} from "lucide-react";



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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sendImageToBackend = async (
  videoElement: HTMLVideoElement
): Promise<{ emotion: string; confidence: number } | null> => {
  try {
    // Create canvas to extract frame from video
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw current frame from video
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');

    // Send to Flask
    const response = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) throw new Error('Server Error');

    const data = await response.json();
    return data; // Expecting { emotion: string, confidence: number }
  } catch (error) {
    console.error('Error sending image to backend:', error);
    return null;
  }
};


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
      'Call a friend or family member for support',
      'Practice deep breathing or meditation for 5-10 minutes'
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
    title: 'Laka Maka Weela - Janith Iddamalgoda',
    description: 'Uplifting Sri Lankan song to boost mood'
  },
  'Angry': {
    videoId: 'fJ9rUzIMcZQ',
    title: 'Calm Piano Music for Relaxation',
    description: 'Soothing instrumental music to reduce anger'
  },
  'Fearful': {
    videoId: 'ZToicYcHIOU',
    title: 'Peaceful Nature Sounds',
    description: 'Calming nature sounds for anxiety relief'
  }
};

// Get emotion-based theme function
const getEmotionTheme = (emotion: string) => {
  const emotionType = emotion.toLowerCase();
  
  if (emotionType.includes('sad')) {
    return {
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
    return {
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
    return {
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
    return {
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
    return {
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
}> = ({ currentEmotion, theme }) => {
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [showAvoidanceTips, setShowAvoidanceTips] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  
  const emotion = currentEmotion.replace(/[^\w]/g, '') as Emotion;
  
  // Get relevant causes for this emotion
  const relevantCauses = emotionCauseMapping
    .find(mapping => mapping.emotion === emotion)
    ?.causeIds.map(id => causesData.find(cause => cause.id === id))
    .filter((cause): cause is Cause => cause !== undefined) || [];
  
  // Get avoidance methods for this emotion
  const avoidanceMethods = avoidanceMethodsData.find(method => method.emotion === emotion);
  
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
            {relevantCauses.map(cause => (
              <button
                key={cause.id}
                onClick={() => {
                  setSelectedCause(cause);
                  setShowSolutions(true);
                }}
                className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                  selectedCause?.id === cause.id
                    ? `bg-gradient-to-r ${theme.accent} text-white border-transparent shadow-md`
                    : `${theme.statusBg} hover:bg-opacity-80 border-transparent`
                }`}
              >
                <span className="font-medium">{cause.name}</span>
                <div className="text-xs opacity-75 mt-1 capitalize">{cause.category}</div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowAvoidanceTips(!showAvoidanceTips)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.statusBg} hover:bg-opacity-80 transition-all flex items-center justify-center`}
          >
            <Lightbulb className={`mr-2 ${theme.textSecondary}`} size={16} />
            <span className={theme.textPrimary}>
              {showAvoidanceTips ? 'Hide General Tips' : 'View General Tips for ' + emotion}
            </span>
          </button>
        </div>
      )}

      {/* General Avoidance Tips */}
      {showAvoidanceTips && avoidanceMethods && (
        <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
          <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4 flex items-center`}>
            <Brain className={`mr-2 ${theme.textSecondary}`} size={20} />
            General Strategies for {emotion}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-semibold ${theme.textSecondary} mb-3 flex items-center`}>
                <Clock className="mr-2" size={16} />
                Immediate Relief:
              </h4>
              <ul className="space-y-2">
                {avoidanceMethods.temporaryMethods.map((method, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`w-6 h-6 rounded-full ${theme.statusBg} border ${theme.border} flex items-center justify-center flex-shrink-0 mr-3 mt-0.5`}>
                      <span className={`text-xs font-medium ${theme.textSecondary}`}>{index + 1}</span>
                    </div>
                    <span className="text-sm">{method}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold ${theme.textSecondary} mb-3 flex items-center`}>
                <TrendingUp className="mr-2" size={16} />
                Long-term Growth:
              </h4>
              <ul className="space-y-2">
                {avoidanceMethods.permanentMethods.map((method, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className={`flex-shrink-0 mr-3 mt-0.5 ${theme.textSecondary}`} size={16} />
                    <span className="text-sm">{method}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
  const [confidence, setConfidence] = useState(0);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);


  
  // Get the theme - only if emotion is detected
  const theme = currentEmotion ? getEmotionTheme(currentEmotion) : getEmotionTheme("neutral");

  // Emotion data with confidence scores
  const emotionResults = [
    { emotion: "😠 Angry", confidence: 89 },
    { emotion: "🤢 Disgusted", confidence: 76 },
    { emotion: "😨 Fearful", confidence: 82 },
    { emotion: "😊 Happy", confidence: 94 },
    { emotion: "😢 Sad", confidence: 88 },
    { emotion: "😲 Surprised", confidence: 91 },
    { emotion: "😐 Neutral", confidence: 85 }
  ];

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
    { id: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

  // Camera functionality
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsCameraActive(true);
    } catch (err) { console.warn(err);
      console.error("Camera access denied", err);
      setCameraError("Camera access denied. Please allow camera permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Toggle camera
  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleImageUpload = async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append("image", imageBlob);

  try {
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("Top Emotion:", result.top_emotion);
    setCurrentEmotion(result.top_emotion);
    setConfidence(Math.floor(result.predictions[result.top_emotion] * 100));
  } catch (err) { console.warn(err);
    console.error("Error uploading image:", err);
  }
};

const sendImageToBackend = async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append("image", imageBlob);

  const response = await fetch("http://localhost:5000/predict", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log("Top Emotion:", result.top_emotion);
  setCurrentEmotion(result.top_emotion); // Optional: update UI
};

const captureAndSendFrame = async () => {
  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    if (blob) {
      await sendImageToBackend(blob);
    }
  }, "image/jpeg");
};


  // Start emotion detection when camera becomes active
useEffect(() => {
  let interval: NodeJS.Timeout | null = null;

  if (isCameraActive && videoRef.current) {
    interval = setInterval(() => {
      captureAndSendFrame(); // Sends image to backend
    }, 5000);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isCameraActive]);



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, []);

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

        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 ${theme.statusBg} rounded-full border ${theme.border}`}>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${theme.statusText}`}
             style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Smart Detection</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 ${theme.statusBg} rounded-lg border ${theme.border}`}>
              <Zap className={`w-4 h-4 ${theme.textSecondary}`} />
              <span className={`text-sm font-bold ${theme.textPrimary}`}
               style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>{confidence}%</span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-2 ${theme.statusBg} rounded-lg border ${theme.border}`}>
              <Bell className={`w-4 h-4 ${theme.textSecondary}`} />
              <span className={`text-sm font-bold ${theme.textPrimary}`}
               style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>3</span>
            </div>
          </div>

          <div className={`w-10 h-10 bg-gradient-to-br ${theme.accent} rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-md`}>
            <User className="w-5 h-5 text-white" />
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
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeMenu === item.id
                      ? `bg-gradient-to-r ${theme.accent}/20 ${theme.textSecondary} border ${theme.border} shadow-sm`
                      : `${theme.textPrimary} hover:bg-slate-100/50 hover:${theme.textSecondary}`
                  }`}
                >
                  <div className={activeMenu === item.id ? theme.textSecondary : "text-slate-500"}>
                    {item.icon}
                  </div>
                  <span
                   style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>{item.label}</span>
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
                  onClick={() => setIsMicActive(!isMicActive)}
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
        <div className="flex-1 p-6 grid grid-cols-2 gap-6">
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
                <div className={`w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border ${theme.border} flex items-center justify-center overflow-hidden`}>
                  {isCameraActive ? (
                    <div className="relative w-full h-full">
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover rounded-xl"
                      />
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
                    </div>
                  ) : cameraError ? (
                    <div className="text-center text-red-600 p-4">
                      <CameraOff className="w-16 h-16 mx-auto mb-2 opacity-60" />
                      <p className="font-medium mb-2"
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Camera Error</p>
                      <p className="text-sm">{cameraError}</p>
                      <button 
                        onClick={toggleCamera}
                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600" style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}
                      >
                        Try Again
                      </button>
                    </div>
                  ) : detectionMode === "voice" ? (
                    <div className="text-center">
                      <div className={`w-28 h-28 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                        <Mic className="w-8 h-8 text-white" />
                      </div>
                      <p className={`${theme.textSecondary} text-sm font-medium`}
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Voice Analysis Mode</p>
                      <p className="text-xs text-emerald-600 mt-1"
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>Audio Processing Active</p>
                    </div>
                  ) : (
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
                    <div className="mt-4 pt-4 border-t border-white/30">
                      <p className="text-xs text-slate-600 mb-2"
                       style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>All Detected Emotions</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {emotionResults.map((emotion, index) => (
                          <div 
                            key={index}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              emotion.emotion === currentEmotion 
                                ? 'bg-white/80 font-semibold' 
                                : 'bg-white/40'
                            }`}
                          >
                            <span>{emotion.emotion}</span>
                            <span className={emotion.emotion === currentEmotion ? theme.textSecondary : 'text-slate-500'}>
                              {emotion.emotion === currentEmotion ? emotion.confidence : Math.floor(Math.random() * 20) + 5}%
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

          {/* Right Column - Smart Recommendations */}
          <div className="space-y-6">
            <h2 className={`text-xl font-bold ${theme.textPrimary} flex items-center`}
             style={{ fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif' }}>
              <Brain className={`mr-2 ${theme.textSecondary}`} size={20} />
              Smart Wellness Solutions
            </h2>

            {currentEmotion ? (
              <SmartRecommendations 
              
                currentEmotion={currentEmotion}
                theme={theme}
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

      {/* Bottom Status Bar */}
      <div className={`h-12 ${theme.navBg} backdrop-blur-xl border-t ${theme.border} flex items-center justify-between px-6 shadow-sm`}>
        <p className={`text-sm text-slate-600 font-medium`}>🔒 Privacy First • Processing locally with AI enhancement</p>
        <p className={`text-sm ${theme.textSecondary} font-medium`}>EmotionAid v2.0.0 • Smart Edition</p>
      </div>
    </div>
  );
};

export default EnhancedEmotionAid;