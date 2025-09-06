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

const EmotionRecognitionApp = () => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState("😟 Sad");
  const [confidence, setConfidence] = useState(86);
  const [transcript] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // Get emotion-based theme
  const getEmotionTheme = (emotion: string) => {
    const emotionType = emotion.toLowerCase();
    
    if (emotionType.includes('sad') || emotionType.includes('depressed')) {
      return {
        name: 'Comfort',
        bg: 'from-amber-50 via-orange-50 to-rose-50',
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
    } else if (emotionType.includes('happy') || emotionType.includes('joy')) {
      return {
        name: 'Energetic',
        bg: 'from-emerald-50 via-teal-50 to-cyan-50',
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
    } else if (emotionType.includes('anxious') || emotionType.includes('stressed')) {
      return {
        name: 'Calming',
        bg: 'from-sky-50 via-blue-50 to-indigo-50',
        cardBg: 'bg-white/90',
        sidebarBg: 'bg-white/80',
        navBg: 'bg-white/95',
        textPrimary: 'text-slate-800',
        textSecondary: 'text-sky-700',
        accent: 'from-sky-400 to-blue-500',
        border: 'border-sky-200',
        statusBg: 'bg-sky-100',
        statusText: 'text-sky-800'
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

  const theme = getEmotionTheme(currentEmotion);

  // Simulate emotion detection updates
  useEffect(() => {
    const emotions = [
      { emotion: "😟 Sad", confidence: 86 },
      { emotion: "😊 Happy", confidence: 92 },
      { emotion: "😰 Anxious", confidence: 78 },
      { emotion: "😐 Neutral", confidence: 95 },
      { emotion: "😤 Frustrated", confidence: 83 },
    ];

    const interval = setInterval(() => {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
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
      {/* Top Navigation Bar - Adaptive Theme */}
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
          {/* Status Badge - Emotion Adaptive */}
          <div className={`flex items-center space-x-2 px-4 py-2 ${theme.statusBg} rounded-full border ${theme.border}`}>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium ${theme.statusText}`}>Active Detection</span>
          </div>

          {/* Stats */}
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

          {/* User Profile */}
          <div className={`w-10 h-10 bg-gradient-to-br ${theme.accent} rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-md`}>
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Left Sidebar - Light, Warm Theme */}
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

          {/* Voice/Camera Controls - Warm, Inviting */}
          <div className={`p-4 border-t ${theme.border}`}>
            <div className="space-y-3">
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
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-6">
          {/* Left Column - Live Emotion Detection */}
          <div className="space-y-6">
            {/* Live Feed Card - Warm, Welcoming */}
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
                  {isCameraActive ? (
                    <div className="text-center">
                      <div className={`w-28 h-28 bg-gradient-to-br ${theme.accent} rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                        <span className="text-4xl">😊</span>
                      </div>
                      <p className={`${theme.textSecondary} text-sm font-medium`}>Live Camera • 640x480</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <CameraOff className="w-16 h-16 mx-auto mb-2 opacity-60" />
                      <p className="font-medium">Camera Disabled</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emotion Result - Warm Card */}
              <div className={`bg-gradient-to-br ${theme.statusBg} rounded-xl p-6 border ${theme.border}`}>
                <div className="text-center space-y-4">
                  <p className={`text-3xl font-bold ${theme.textPrimary}`}>{currentEmotion}</p>
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
                </div>
              </div>
            </div>

            {/* Voice Transcript */}
            {isMicActive && (
              <div className={`${theme.cardBg} backdrop-blur-xl rounded-2xl border ${theme.border} p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold ${theme.textPrimary} mb-4`}>Voice Transcript</h3>
                <div className={`h-24 ${theme.statusBg} rounded-xl p-4 border ${theme.border}`}>
                  <div className={`flex items-center space-x-3 text-sm ${theme.textSecondary}`}>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Listening...</span>
                  </div>
                  {transcript && <p className={`mt-2 ${theme.textPrimary}`}>{transcript}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Recommendations */}
          <div className="space-y-6">
            <h2 className={`text-xl font-bold ${theme.textPrimary}`}>Personalized Solutions</h2>

            {/* Recommendation Cards - Warm, Inviting */}
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

            {/* Quick Actions - Warm Theme */}
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