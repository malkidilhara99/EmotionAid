"use client"
import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Camera, 
  Settings, 
  Minimize2, 
  Square, 
  X,
  Folder,
  Save,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  MicOff,
  CameraOff,
  HelpCircle
} from 'lucide-react';

const EmotionRecognitionApp = () => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('😟 Sad');
  const [confidence, setConfidence] = useState(86);
  const [sessionTime] = useState('00:02:45');

  // Simulate emotion detection updates
  useEffect(() => {
    const emotions = [
      { emotion: '😟 Sad', confidence: 86 },
      { emotion: '😊 Happy', confidence: 92 },
      { emotion: '😰 Anxious', confidence: 78 },
      { emotion: '😐 Neutral', confidence: 95 },
      { emotion: '😤 Frustrated', confidence: 83 }
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
      emoji: '🧘‍♀️',
      title: 'Mindful Breathing Exercise',
      description: 'A 5-minute guided session to help reduce stress and anxiety.',
      action: 'Launch Exercise'
    },
    {
      emoji: '🎵',
      title: 'Therapeutic Music',
      description: 'Play calming sounds designed to improve emotional state.',
      action: 'Open Player'
    },
    {
      emoji: '📞',
      title: 'Contact Support',
      description: 'Connect with a counselor or emergency contact.',
      action: 'Make Call'
    }
  ];

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Desktop Window Title Bar */}
      <div className="h-8 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-between px-3 select-none">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center shadow-sm">
            <span className="text-indigo-600 text-xs font-bold">E</span>
          </div>
          <span className="text-white text-sm font-medium">EmotionAid Pro - Session Analysis</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="w-6 h-6 hover:bg-gray-700 rounded flex items-center justify-center">
            <Minimize2 className="w-3 h-3 text-gray-300" />
          </button>
          <button className="w-6 h-6 hover:bg-gray-700 rounded flex items-center justify-center">
            <Square className="w-3 h-3 text-gray-300" />
          </button>
          <button className="w-6 h-6 hover:bg-red-600 rounded flex items-center justify-center">
            <X className="w-3 h-3 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Desktop Menu Bar */}
      <div className="h-6 bg-indigo-100 border-b border-indigo-200 flex items-center px-2 text-xs">
        <div className="flex space-x-4">
          <button className="hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded">File</button>
          <button className="hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded">Edit</button>
          <button className="hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded">Session</button>
          <button className="hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded">Analysis</button>
          <button className="hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded">Tools</button>
          <button className="hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded">Help</button>
        </div>
      </div>

      {/* Desktop Toolbar */}
      <div className="h-12 bg-white border-b border-indigo-200 flex items-center px-4 space-x-2 shadow-sm">
        <button className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded hover:from-green-100 hover:to-emerald-100 text-green-700">
          <Folder className="w-4 h-4" />
          <span className="text-sm">Open</span>
        </button>
        <button className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded hover:from-blue-100 hover:to-indigo-100 text-blue-700">
          <Save className="w-4 h-4" />
          <span className="text-sm">Save</span>
        </button>
        <div className="w-px h-6 bg-indigo-200 mx-2"></div>
        
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={`flex items-center space-x-1 px-3 py-1.5 border rounded hover:shadow-md transition-all ${
            isRecording 
              ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700 shadow-md' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700'
          }`}
        >
          {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="text-sm">{isRecording ? 'Stop' : 'Start'}</span>
        </button>
        
        <button className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded hover:from-orange-100 hover:to-amber-100 text-orange-700">
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
        
        <div className="flex-1"></div>
        
        <div className="text-sm text-indigo-600 font-medium">Session: {sessionTime}</div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content Area */}
        <div className="flex-1 p-4 grid grid-cols-3 gap-4">
          {/* Camera Feed Panel */}
          <div className="bg-white border border-blue-200 rounded-lg shadow-lg">
            <div className="h-8 bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200 flex items-center justify-between px-3 rounded-t-lg">
              <span className="text-sm font-medium text-blue-800">🎥 Live Camera Feed</span>
              <div className="flex space-x-1">
                <button 
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    isCameraActive ? 'text-green-600 bg-green-50' : 'text-gray-400'
                  }`}
                >
                  {isCameraActive ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                </button>
                <button className="w-5 h-5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center">
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-blue-200 flex items-center justify-center shadow-inner">
                {isCameraActive ? (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                      <span className="text-3xl">😊</span>
                    </div>
                    <p className="text-blue-100 text-xs font-medium">640 x 480 @ 30fps</p>
                    <div className="w-full h-1 bg-green-400 mt-2 rounded-full shadow-sm"></div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <CameraOff className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">Camera Disabled</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-600">Face Detection:</span>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-600">Resolution:</span>
                  <span className="text-xs text-indigo-700 font-medium">640x480</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emotion Analysis Panel */}
          <div className="bg-white border border-purple-200 rounded-lg shadow-lg">
            <div className="h-8 bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200 flex items-center justify-between px-3 rounded-t-lg">
              <span className="text-sm font-medium text-purple-800">🧠 Emotion Analysis</span>
              <button className="w-5 h-5 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded flex items-center justify-center">
                <BarChart3 className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-center mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                <div className="text-5xl mb-3">{currentEmotion.split(' ')[0]}</div>
                <div className="text-xl font-bold text-indigo-800">{currentEmotion.split(' ')[1]}</div>
                <div className="text-sm text-purple-600 mt-2 font-medium">Primary Emotion Detected</div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-indigo-600 font-medium">Confidence Level</span>
                    <span className="font-bold text-indigo-800">{confidence}%</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-blue-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                    <div className="font-semibold text-blue-700">Valence</div>
                    <div className="text-indigo-600 font-bold">-0.3</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-100">
                    <div className="font-semibold text-emerald-700">Arousal</div>
                    <div className="text-green-600 font-bold">0.7</div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-purple-700">📈 Emotion Timeline</div>
                  <div className="h-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 text-center flex items-center justify-center">
                    <span className="text-xs text-purple-600 font-medium">Real-time emotion graph</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Panel */}
          <div className="bg-white border border-green-200 rounded-lg shadow-lg">
            <div className="h-8 bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200 flex items-center justify-between px-3 rounded-t-lg">
              <span className="text-sm font-medium text-green-800">💡 Wellness Recommendations</span>
              <button className="w-5 h-5 text-green-400 hover:text-green-600 hover:bg-green-50 rounded flex items-center justify-center">
                <HelpCircle className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-green-100 rounded-lg p-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:shadow-md">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl bg-white rounded-full p-2 shadow-sm">{rec.emoji}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-green-800 mb-1">{rec.title}</div>
                      <div className="text-xs text-green-600 mb-3 leading-relaxed">{rec.description}</div>
                      <button className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full hover:from-green-600 hover:to-emerald-600 shadow-sm font-medium">
                        {rec.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Status Panel */}
        <div className="w-64 bg-gradient-to-b from-indigo-50 to-blue-50 border-l border-indigo-200">
          <div className="h-8 bg-gradient-to-r from-indigo-100 to-blue-100 border-b border-indigo-200 flex items-center px-3">
            <span className="text-sm font-medium text-indigo-800">⚙️ System Status</span>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Hardware Status */}
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="text-xs font-semibold text-blue-700 mb-3">🔧 Hardware</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isCameraActive ? <Camera className="w-3 h-3 text-green-600" /> : <CameraOff className="w-3 h-3 text-orange-400" />}
                    <span className="text-xs text-indigo-700">Camera</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${isCameraActive ? 'text-green-700 bg-green-100' : 'text-orange-700 bg-orange-100'}`}>
                    {isCameraActive ? 'ON' : 'OFF'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isMicActive ? <Mic className="w-3 h-3 text-green-600" /> : <MicOff className="w-3 h-3 text-orange-400" />}
                    <span className="text-xs text-indigo-700">Microphone</span>
                  </div>
                  <button 
                    onClick={() => setIsMicActive(!isMicActive)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${isMicActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                  >
                    {isMicActive ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="text-xs font-semibold text-purple-700 mb-3">📊 Session Info</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-indigo-600">Duration:</span>
                  <span className="font-bold text-indigo-800">{sessionTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Samples:</span>
                  <span className="font-bold text-indigo-800">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Status:</span>
                  <span className="text-green-700 font-bold bg-green-100 px-2 py-1 rounded-full">Recording</span>
                </div>
              </div>
            </div>

            {/* AI Model Info */}
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-700 mb-3">🤖 AI Model</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-indigo-600">Version:</span>
                  <span className="font-bold text-indigo-800">v2.1.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Accuracy:</span>
                  <span className="font-bold text-emerald-700">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Processing:</span>
                  <span className="text-green-700 font-bold bg-green-100 px-2 py-1 rounded-full">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Status Bar */}
      <div className="h-6 bg-gradient-to-r from-indigo-100 to-blue-100 border-t border-indigo-200 flex items-center justify-between px-3 text-xs">
        <div className="flex space-x-4">
          <span className="text-indigo-700 font-medium">✅ Ready</span>
          <span className="text-indigo-400">•</span>
          <span className="text-green-700 font-medium">Emotion Detection: Active</span>
        </div>
        <div className="flex space-x-4 text-indigo-600">
          <span>CPU: 23%</span>
          <span>Memory: 847MB</span>
          <span className="font-medium">EmotionAid Pro v3.2.1</span>
        </div>
      </div>
    </div>
  );
};

export default EmotionRecognitionApp;