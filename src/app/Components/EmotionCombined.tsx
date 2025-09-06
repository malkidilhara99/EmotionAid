"use client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Mic,
  Camera,
  User,
  Settings,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogOut,
  BarChart3,
  History,
  Home,
  Play,
  Phone,
  BookOpen,
  MicOff,
  CameraOff,
  Bell,
  Zap,
  Heart
} from "lucide-react";

// Get emotion-based theme function (moved outside component)
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
  } else if (emotionType.includes('surprise')) {
    return {
      name: 'Exciting',
      bg: 'from-pink-50 via-rose-50 to-fuchsia-50',
      cardBg: 'bg-white/90',
      sidebarBg: 'bg-white/80',
      navBg: 'bg-white/95',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-pink-700',
      accent: 'from-pink-400 to-fuchsia-500',
      border: 'border-pink-200',
      statusBg: 'bg-pink-100',
      statusText: 'text-pink-800'
    };
  } else if (emotionType.includes('disgust')) {
    return {
      name: 'Fresh',
      bg: 'from-emerald-50 via-teal-50 to-green-50',
      cardBg: 'bg-white/90',
      sidebarBg: 'bg-white/80',
      navBg: 'bg-white/95',
      textPrimary: 'text-slate-800',
      textSecondary: 'text-emerald-700',
      accent: 'from-emerald-400 to-teal-500',
      border: 'border-emerald-200',
      statusBg: 'bg-emerald-100',
      statusText: 'text-emerald-800'
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

const EmotionRecognitionApp = () => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [detectionMode, setDetectionMode] = useState("face");
  const [currentEmotion, setCurrentEmotion] = useState("😢 Sad");
  const [confidence, setConfidence] = useState(86);
  const [transcript] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [userProblem, setUserProblem] = useState(""); // Added state for userProblem

  // Get the theme
  const theme = getEmotionTheme(currentEmotion);

  // FER2013 Dataset - 7 Main Emotions
  const fer2013Emotions = [
    { emotion: "😠 Angry", confidence: 89 },
    { emotion: "🤢 Disgust", confidence: 76 },
    { emotion: "😨 Fear", confidence: 82 },
    { emotion: "😊 Happy", confidence: 94 },
    { emotion: "😢 Sad", confidence: 88 },
    { emotion: "😲 Surprise", confidence: 91 },
    { emotion: "😐 Neutral", confidence: 85 }
  ];

  // Detection Mode Options
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
      status: "Soon",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    { 
      id: "both", 
      label: "Both", 
      icon: <Zap className="w-5 h-5" />, 
      status: "Soon",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  // Simulate emotion detection updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEmotion = fer2013Emotions[Math.floor(Math.random() * fer2013Emotions.length)];
      setCurrentEmotion(randomEmotion.emotion);
      setConfidence(randomEmotion.confidence);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const recommendations = [
    {
      emoji: "🧘‍♀️",
      title: "Try Mindful Breathing",
      description: "A 5-minute guided breathing exercise to help you relax and center yourself.",
      action: "Start Now",
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      emoji: "🎵",
      title: "Calming Music",
      description: "Listen to specially curated playlist designed to improve your mood.",
      action: "Play Now",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      emoji: "📝",
      title: "Mood Journal",
      description: "Write down your thoughts and feelings to better understand your emotions.",
      action: "Open Journal",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      emoji: "💬",
      title: "Talk to Someone",
      description: "Connect with a professional counselor or trusted friend for support.",
      action: "Contact Now",
      gradient: "from-orange-400 to-red-400"
    },
  ];

  const quickTips = [
    { icon: <Play className="w-4 h-4" />, text: "Play calming music", color: "text-emerald-600" },
    { icon: <Phone className="w-4 h-4" />, text: "Contact therapist", color: "text-blue-600" },
    { icon: <BookOpen className="w-4 h-4" />, text: "Open mood journal", color: "text-purple-600" },
  ];

  const menuItems = [
    { id: "dashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { id: "logs", icon: <BarChart3 className="w-5 h-5" />, label: "Emotion Logs" },
    { id: "history", icon: <History className="w-5 h-5" />, label: "History" },
    { id: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

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
            <h1 className={`text-xl font-bold ${theme.textPrimary} tracking-tight`}>EmotionAid</h1>
            <p className={`text-xs ${theme.textSecondary} font-medium`}>Wellness Platform • {theme.name} Mode</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 ${theme.statusBg} rounded-full border ${theme.border}`}>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${theme.statusText}`}>Active Detection</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 ${theme.statusBg} rounded-lg border ${theme.border}`}>
              <Zap className={`w-4 h-4 ${theme.textSecondary}`} />
              <span className={`text-sm font-bold ${theme.textPrimary}`}>{confidence}%</span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-2 ${theme.statusBg} rounded-lg border ${theme.border}`}>
              <Bell className={`w-4 h-4 ${theme.textSecondary}`} />
              <span className={`text-sm font-bold ${theme.textPrimary}`}>3</span>
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
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Detection Mode Selector - Compact & Symbolic */}
          <div className="p-4 border-t border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Detection Mode</h3>
            <div className="grid grid-cols-3 gap-2">
              {detectionModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setDetectionMode(mode.id)}
                  disabled={mode.status === "Soon"}
                  className={`flex flex-col items-center p-3 rounded-xl text-xs transition-all relative ${
                    detectionMode === mode.id
                      ? `${mode.bgColor} ${mode.color} border-2 ${mode.color.replace('text-', 'border-')} shadow-md`
                      : mode.status === "Soon"
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-transparent"
                      : `bg-white hover:${mode.bgColor} border-2 border-slate-200 hover:${mode.color.replace('text-', 'border-')} hover:shadow-sm text-slate-600`
                  }`}
                >
                  <div className={`mb-2 ${detectionMode === mode.id ? mode.color : mode.status === "Soon" ? "text-slate-400" : "text-slate-500"}`}>
                    {mode.icon}
                  </div>
                  <span className="font-medium">{mode.label}</span>
                  
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
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className={`w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isCameraActive
                      ? `bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border border-blue-400`
                      : `bg-white border ${theme.border} ${theme.textPrimary} hover:bg-slate-50 hover:border-blue-300`
                  }`}
                >
                  {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  <span className="text-sm">{isCameraActive ? "Camera ON" : "Camera OFF"}</span>
                </button>
              )}

              {(detectionMode === "voice" || detectionMode === "both") && (
                <button
                  onClick={() => setIsMicActive(!isMicActive)}
                  disabled={detectionMode === "voice" || detectionMode === "both"}
                  className={`w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                    detectionMode === "voice" || detectionMode === "both"
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : isMicActive
                      ? `bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg border border-emerald-400`
                      : `bg-white border ${theme.border} ${theme.textPrimary} hover:bg-slate-50 hover:border-emerald-300`
                  }`}
                >
                  {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span className="text-sm">
                    {detectionMode === "voice" || detectionMode === "both" 
                      ? "Coming Soon" 
                      : isMicActive ? "Mic ON" : "Mic OFF"
                    }
                  </span>
                </button>
              )}

              {detectionMode === "face" && (
                <div className="text-xs text-slate-500 text-center pt-2">
                  Face detection mode active
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Live Emotion Feed</h2>
                <div className={`px-3 py-1 ${theme.statusBg} rounded-full border ${theme.border}`}>
                  <span className={`text-xs font-medium ${theme.statusText}`}>ACTIVE</span>
                </div>
              </div>

              {/* Camera Feed */}
              <div className="relative mb-6">
                <div className={`w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border ${theme.border} flex items-center justify-center overflow-hidden`}>
                  {(detectionMode === "face" || detectionMode === "both") && isCameraActive ? (
                    <div className="text-center">
                      <div className={`w-28 h-28 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                        <span className="text-4xl">😊</span>
                      </div>
                      <p className={`${theme.textSecondary} text-sm font-medium`}>Live Camera • 640x480</p>
                      <p className="text-xs text-slate-500 mt-1">Mode: {detectionMode.charAt(0).toUpperCase() + detectionMode.slice(1)}</p>
                    </div>
                  ) : detectionMode === "voice" ? (
                    <div className="text-center">
                      <div className={`w-28 h-28 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                        <Mic className="w-8 h-8 text-white" />
                      </div>
                      <p className={`${theme.textSecondary} text-sm font-medium`}>Voice Detection Mode</p>
                      <p className="text-xs text-orange-600 mt-1">Coming Soon</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <CameraOff className="w-16 h-16 mx-auto mb-2 opacity-60" />
                      <p className="font-medium">Camera Disabled</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emotion Result */}
              <div className={`bg-gradient-to-br ${theme.statusBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <p className={`text-3xl font-bold ${theme.textPrimary}`}>{currentEmotion}</p>
                    <div className="text-xs bg-white/70 px-2 py-1 rounded-full text-slate-600">
                      FER2013
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className={`text-sm font-medium ${theme.textSecondary}`}>Confidence Level</p>
                    <div className="w-full bg-white/70 rounded-full h-3 shadow-inner">
                      <div
                        className={`bg-gradient-to-r ${theme.accent} h-3 rounded-full transition-all duration-1000 shadow-sm`}
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                    <p className={`text-lg font-bold ${theme.textPrimary}`}>{confidence}%</p>
                  </div>
                  
                  {/* FER2013 Emotion Breakdown */}
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <p className="text-xs text-slate-600 mb-2">All Emotions (FER2013 Dataset)</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {fer2013Emotions.map((emotion, index) => (
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
              </div>
            </div>

            {/* Voice Transcript */}
            {((detectionMode === "voice" || detectionMode === "both") || isMicActive) && (
              <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4`}>
                  {detectionMode === "voice" ? "Voice Emotion Analysis" : "Voice Transcript"}
                </h3>
                <div className={`h-24 ${theme.statusBg} rounded-xl p-4 border ${theme.border}`}>
                  {detectionMode === "voice" || detectionMode === "both" ? (
                    <div className="text-center">
                      <p className="text-orange-600 font-medium text-sm">Voice Detection Coming Soon</p>
                      <p className="text-xs text-slate-500 mt-1">Will analyze speech patterns, tone, and audio features</p>
                    </div>
                  ) : (
                    <>
                      <div className={`flex items-center space-x-3 text-sm ${theme.textSecondary}`}>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Listening...</span>
                      </div>
                      {transcript && <p className={`mt-2 ${theme.textPrimary}`}>{transcript}</p>}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
  <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Personalized Solutions</h2>

  <div className="space-y-4">
    {recommendations.map((rec, index) => (
      <div
        key={index}
        className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
      >
        <div className="flex items-start space-x-4">
          <div className={`text-3xl bg-gradient-to-br ${rec.gradient} p-3 rounded-xl shadow-md`}>
            {rec.emoji}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${theme.textPrimary} mb-2`}>{rec.title}</h3>
            <p className={`text-slate-600 text-sm mb-4 leading-relaxed`}>{rec.description}</p>
            <button className={`bg-gradient-to-r ${rec.gradient} text-white px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-transform shadow-md`}>
              {rec.action}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Input Box to Describe the Problem */}
  <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-5 shadow-lg`}>
    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4`}>Describe Your Problem (Optional)</h3>
      <textarea
        placeholder="Describe your problem (optional)"
        className="w-full p-4 rounded-xl border border-slate-200 shadow-sm bg-white/70 focus:ring-2 focus:ring-blue-500 resize-none"
        rows={4}
        value={userProblem}
        onChange={(e) => setUserProblem(e.target.value)} // Track user input
        style={{ color: '#222' }}
      />
  </div>

  {/* Quick Actions */}
  <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-5 shadow-lg`}>
    <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4`}>Quick Actions</h3>
    <div className="space-y-3">
      {quickTips.map((tip, index) => (
        <button
          key={index}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl ${theme.statusBg} hover:bg-slate-100 transition-all text-left border ${theme.border}`}
        >
          <div className={`${tip.color} bg-white/70 p-2 rounded-lg`}>
            {tip.icon}
          </div>
          <span className={`text-sm font-medium ${theme.textPrimary}`}>{tip.text}</span>
        </button>
      ))}
    </div>
  </div>
</div>

        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className={`h-12 ${theme.navBg} backdrop-blur-xl border-t ${theme.border} flex items-center justify-between px-6 shadow-sm`}>
        <p className={`text-sm text-slate-600 font-medium`}>🔒 Secure • Processing locally</p>
        <p className={`text-sm ${theme.textSecondary} font-medium`}>EmotionAid v1.0.0</p>
      </div>
    </div>
  );
};

export default EmotionRecognitionApp;