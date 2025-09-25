
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, MapPin, Bot, Clock, Battery, DollarSign, Users, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons/logo';


const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(80)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animation: `float ${3 + Math.random() * 2}s ease-in-out infinite alternate`,
        }}
      />
    ))}
  </div>
);

const NetworkAnimation = () => {
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number; size: number; delay: number; }[]>([]);
  const [connections, setConnections] = useState<{ from: any; to: any; opacity: number; }[]>([]);

  useEffect(() => {
    const generatedNodes = [...Array(12)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 4,
      delay: Math.random() * 3
    }));

    const generatedConnections: { from: typeof generatedNodes[0], to: typeof generatedNodes[0], opacity: number }[] = [];
    for (let i = 0; i < generatedNodes.length; i++) {
      for (let j = i + 1; j < generatedNodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(generatedNodes[i].x - generatedNodes[j].x, 2) + 
          Math.pow(generatedNodes[i].y - generatedNodes[j].y, 2)
        );
        if (distance < 35) {
          generatedConnections.push({
            from: generatedNodes[i],
            to: generatedNodes[j],
            opacity: Math.max(0.1, 1 - distance / 35)
          });
        }
      }
    }
    setNodes(generatedNodes);
    setConnections(generatedConnections);
  }, []);

  if (nodes.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection Lines */}
        {connections.map((connection, idx) => (
          <line
            key={idx}
            x1={`${connection.from.x}%`}
            y1={`${connection.from.y}%`}
            x2={`${connection.to.x}%`}
            y2={`${connection.to.y}%`}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.1"
            className="animate-networkPulse"
            style={{
              animationDelay: `${idx * 0.2}s`,
              strokeOpacity: connection.opacity
            }}
          />
        ))}
        
        {/* Network Nodes */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size / 10}
            fill="rgba(255,255,255,0.6)"
            className="animate-networkNode"
            style={{ animationDelay: `${node.delay}s` }}
          />
        ))}
        
        {/* Data Packets */}
        {connections.slice(0, 6).map((connection, idx) => (
          <circle
            key={`packet-${idx}`}
            r="0.3"
            fill="rgba(59, 130, 246, 0.8)"
            className="animate-dataPacket"
            style={{
              animationDelay: `${idx * 0.8}s`
            }}
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              begin={`${idx * 0.8}s`}
            >
              <mpath href={`#path-${idx}`} />
            </animateMotion>
          </circle>
        ))}
        
        {/* Hidden paths for data packet animation */}
        <defs>
          {connections.slice(0, 6).map((connection, idx) => (
            <path
              key={`path-${idx}`}
              id={`path-${idx}`}
              d={`M ${connection.from.x} ${connection.from.y} L ${connection.to.x} ${connection.to.y}`}
              fill="none"
              stroke="none"
            />
          ))}
        </defs>
      </svg>
      
      {/* Floating Network Elements */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`floating-${i}`}
          className="absolute animate-floatingNetwork"
          style={{
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 80 + 10}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }}
        >
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ValueDemonstrationSection = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  
  const demos = [
    {
      title: "Without ChargeSmart",
      problems: [
        { icon: AlertCircle, text: "Driving around looking for chargers", color: "text-red-500" },
        { icon: AlertCircle, text: "Waiting in long queues", color: "text-red-500" },
        { icon: AlertCircle, text: "Paying premium rates", color: "text-red-500" },
        { icon: AlertCircle, text: "Uncertainty about availability", color: "text-red-500" }
      ]
    },
    {
      title: "With ChargeSmart",
      solutions: [
        { icon: CheckCircle, text: "Instant station discovery", color: "text-green-500" },
        { icon: CheckCircle, text: "Pre-book your slot", color: "text-green-500" },
        { icon: CheckCircle, text: "AI finds best rates", color: "text-green-500" },
        { icon: CheckCircle, text: "Real-time availability", color: "text-green-500" }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [demos.length]);

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            See The Difference ChargeSmart Makes
          </h2>
          <p className="text-xl text-gray-600">Experience the transformation from frustration to seamless charging</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Before/After Comparison */}
          <div className="space-y-8">
            {demos.map((demo, index) => (
              <div 
                key={index}
                className={`transform transition-all duration-1000 ${
                  activeDemo === index 
                    ? 'opacity-100 translate-x-0 scale-100' 
                    : 'opacity-40 translate-x-4 scale-95'
                }`}
              >
                <div className={`p-8 rounded-2xl ${
                  index === 0 ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
                }`}>
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">{demo.title}</h3>
                  <div className="space-y-4">
                    {(demo.problems || demo.solutions || []).map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 animate-fadeInUp"
                        style={{ animationDelay: `${idx * 0.2}s` }}
                      >
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Animated Visual Demo */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
              {/* Phone Mockup */}
              <div className="mx-auto w-64 h-96 bg-gray-900 rounded-3xl p-2 relative animate-phoneFloat">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl relative overflow-hidden">
                  
                  {/* App Interface Animation */}
                  <div className="p-4 text-white">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-lg">ChargeSmart</h4>
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Search Animation */}
                    <div className="bg-white/20 rounded-lg p-3 mb-4 animate-searchPulse">
                      <div className="text-sm">🔍 Finding stations near you...</div>
                      <div className="w-full bg-white/30 h-1 rounded-full mt-2">
                        <div className="bg-white h-1 rounded-full animate-progressBar"></div>
                      </div>
                    </div>
                    
                    {/* Station Cards */}
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i}
                          className="bg-white/20 rounded-lg p-3 animate-slideInUp"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs font-semibold">Station {i}</div>
                              <div className="text-xs opacity-80">Available • 2.{i}km</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs">₹{12 + i}/min</div>
                              <div className="text-xs text-green-300">Book Now</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Success Animation */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-green-500 text-white text-center py-2 px-4 rounded-lg animate-successPop">
                      ✅ Booking Confirmed!
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Benefits */}
              {[
                { text: "Save 30% on charging", position: "top-4 right-4", delay: "0s" },
                { text: "Zero wait time", position: "bottom-20 left-4", delay: "1s" },
                { text: "AI optimized route", position: "top-20 left-4", delay: "2s" }
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className={`absolute ${benefit.position} bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-floatingBenefit shadow-lg`}
                  style={{ animationDelay: benefit.delay }}
                >
                  {benefit.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LiveStatsSection = () => {
  const [stats, setStats] = useState({
    activeUsers: 1250,
    chargingSessions: 892,
    moneySaved: 45230,
    co2Reduced: 12.8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5),
        chargingSessions: prev.chargingSessions + Math.floor(Math.random() * 3),
        moneySaved: prev.moneySaved + Math.floor(Math.random() * 100),
        co2Reduced: prev.co2Reduced + (Math.random() * 0.1)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gray-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 animate-gradientShift"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Live Impact Dashboard</h2>
          <p className="text-xl text-gray-300">See the real-time impact ChargeSmart is making</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 animate-statCard">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 animate-countUp">{stats.activeUsers.toLocaleString()}</div>
            <div className="text-gray-300 mt-2">Active Users Today</div>
          </div>
          
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 animate-statCard">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 animate-countUp">{stats.chargingSessions.toLocaleString()}</div>
            <div className="text-gray-300 mt-2">Charging Sessions</div>
          </div>
          
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 animate-statCard">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 animate-countUp">₹{stats.moneySaved.toLocaleString()}</div>
            <div className="text-gray-300 mt-2">Money Saved Today</div>
          </div>
          
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 animate-statCard">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Battery className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 animate-countUp">{stats.co2Reduced.toFixed(1)}T</div>
            <div className="text-gray-300 mt-2">CO₂ Reduced</div>
          </div>
        </div>
        
        {/* Live Activity Feed */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Live Activity Feed</h3>
          <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="space-y-4">
              {[
                "🚗 User booked Station A in Mumbai - Saved ₹120",
                "⚡ Fast charging completed at Delhi Hub - 45 minutes",
                "🎯 AI found optimal route - 25% cost reduction",
                "✅ Booking confirmed for Bangalore Station B",
                "🔋 User charging at Pune Mall - 80% complete"
              ].map((activity, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-activityFeed"
                  style={{ animationDelay: `${idx * 0.5}s` }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">{activity}</span>
                  <span className="text-xs text-gray-500 ml-auto">now</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const UserJourneyAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const journeySteps = [
    {
      title: "User Opens App",
      description: "Looking for nearby charging stations",
      visual: "📱",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "AI Finds Best Options", 
      description: "Smart algorithm analyzes price, distance & availability",
      visual: "🤖",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Books Optimal Slot",
      description: "Reserves the perfect charging time & location",
      visual: "📅",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Seamless Payment",
      description: "Secure in-app payment with best rates",
      visual: "💳",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      title: "Arrives & Charges",
      description: "QR code access, no waiting, smart notifications",
      visual: "⚡",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % journeySteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [journeySteps.length]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            The Perfect User Journey
          </h2>
          <p className="text-xl text-gray-600">Watch how ChargeSmart transforms the charging experience</p>
        </div>
        
        {/* Journey Timeline */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform -translate-x-1/2"></div>
          
          <div className="space-y-16">
            {journeySteps.map((step, idx) => (
              <div 
                key={idx}
                className={`flex items-center ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-8`}
              >
                <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-8 rounded-2xl transition-all duration-1000 transform ${
                    currentStep === idx 
                      ? 'scale-110 shadow-2xl bg-gradient-to-r ' + step.color + ' text-white' 
                      : 'scale-100 shadow-lg bg-gray-50 text-gray-800'
                  }`}>
                    <div className="text-6xl mb-4">{step.visual}</div>
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className={currentStep === idx ? 'text-white/90' : 'text-gray-600'}>
                      {step.description}
                    </p>
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full border-4 transition-all duration-500 ${
                  currentStep === idx 
                    ? 'bg-blue-600 border-blue-600 scale-150' 
                    : 'bg-white border-gray-300'
                }`}></div>
                
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function ChargeSmart() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return (
        <div className="min-h-screen relative overflow-hidden bg-gray-900">
            <style jsx>{`
              @keyframes float {
                0% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
                100% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
              }
              
              @keyframes phoneFloat {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(2deg); }
              }
              
              @keyframes searchPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
              }
              
              @keyframes progressBar {
                0% { width: 0%; }
                50% { width: 70%; }
                100% { width: 100%; }
              }
              
              @keyframes slideInUp {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0px); }
              }
              
              @keyframes successPop {
                0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                20% { opacity: 1; transform: scale(1.1) translateY(0px); }
                100% { opacity: 1; transform: scale(1) translateY(0px); }
              }
              
              @keyframes floatingBenefit {
                0%, 100% { transform: translateY(0px) scale(1); opacity: 0.9; }
                50% { transform: translateY(-10px) scale(1.05); opacity: 1; }
              }
              
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(30px); }
                100% { opacity: 1; transform: translateY(0px); }
              }
              
              @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              
              @keyframes statCard {
                0% { opacity: 0; transform: translateY(30px) scale(0.9); }
                100% { opacity: 1; transform: translateY(0px) scale(1); }
              }
              
              @keyframes countUp {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
              
              @keyframes activityFeed {
                0% { opacity: 0; transform: translateX(-20px); }
                100% { opacity: 1; transform: translateX(0px); }
              }
              
              @keyframes networkPulse {
                0%, 100% { opacity: 0.3; stroke-width: 0.1; }
                50% { opacity: 0.8; stroke-width: 0.2; }
              }
              
              @keyframes networkNode {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              
              @keyframes dataPacket {
                0% { opacity: 0; transform: scale(0.5); }
                10% { opacity: 1; transform: scale(1); }
                90% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0.5); }
              }
              
              @keyframes floatingNetwork {
                0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.7; }
                25% { transform: translateY(-15px) translateX(10px) rotate(90deg); opacity: 1; }
                50% { transform: translateY(-5px) translateX(-10px) rotate(180deg); opacity: 0.8; }
                75% { transform: translateY(-20px) translateX(5px) rotate(270deg); opacity: 1; }
              }
              
              .animate-phoneFloat { animation: phoneFloat 4s ease-in-out infinite; }
              .animate-searchPulse { animation: searchPulse 2s ease-in-out infinite; }
              .animate-progressBar { animation: progressBar 3s ease-in-out infinite; }
              .animate-slideInUp { animation: slideInUp 0.8s ease-out forwards; }
              .animate-successPop { animation: successPop 2s ease-out infinite 3s; }
              .animate-floatingBenefit { animation: floatingBenefit 3s ease-in-out infinite; }
              .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
              .animate-gradientShift { animation: gradientShift 8s ease infinite; background-size: 200% 200%; }
              .animate-statCard { animation: statCard 0.8s ease-out forwards; }
              .animate-countUp { animation: countUp 0.5s ease-out; }
              .animate-activityFeed { animation: activityFeed 0.8s ease-out forwards; }
              .animate-networkPulse { animation: networkPulse 3s ease-in-out infinite; }
              .animate-networkNode { animation: networkNode 4s ease-in-out infinite; }
              .animate-dataPacket { animation: dataPacket 4s ease-in-out infinite; }
              .animate-floatingNetwork { animation: floatingNetwork 8s ease-in-out infinite; }
            `}</style>

            {/* Animated Background Image with Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-cyan-500/75 to-teal-400/70"></div>
            </div>
            {isClient && <>
                <NetworkAnimation />
                <FloatingParticles />
            </>}
            
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-black/30 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo />
                        <span className="text-2xl font-bold text-white">ChargeSmart</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button variant="ghost" asChild>
                            <Link href="/login" className="text-white hover:bg-white/10">Log In</Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                            <Link href="/register">Sign Up Free</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="text-center px-6 py-20">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                            Seamless EV Charging,<br />
                            Intelligently Managed
                        </h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/95 mb-10 leading-relaxed font-light">
                            ChargeSmart is your ultimate companion for finding, booking, and optimizing your electric vehicle charging. Spend less time waiting and more time driving.
                        </p>
                        <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all transform hover:scale-105 shadow-lg">
                           <Link href="/register">
                             Get Started <ArrowRight className="ml-3 h-6 w-6" />
                           </Link>
                        </Button>
                    </div>
                </section>

                {/* Value Demonstration Section */}
                <ValueDemonstrationSection />

                {/* Live Stats Section */}
                <LiveStatsSection />

                {/* User Journey Animation */}
                <UserJourneyAnimation />

                {/* Features Section - White Background */}
                <section className="bg-white py-20 relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">
                            Everything You Need for Smart Charging
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <MapPin className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Live Station Map</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Find available chargers near you with our real-time map. See status, queue times, and more.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Bot className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">AI Schedule Optimizer</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Our AI assistant finds the most cost-effective and time-efficient charging plan for your EV.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Clock className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Advance Booking</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Plan ahead and reserve charging slot to avoid waiting. Perfect for your busy schedule.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Zap className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Seamless Payments</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Pay securely in-app with multiple payment options. Get digital receipts and track history.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section - Light Blue Background */}
                <section className="bg-blue-50 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <img
                                    src="https://images.unsplash.com/photo-1614539893905-6752aa4a6b98?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Modern electric car charging at a futuristic charging station"
                                    className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                                />
                            </div>
                            <div className="lg:w-1/2">
                                <div className="mb-8">
                                    <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-800 mb-8">Get Charged in 3 Easy Steps</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Find & Select:</h4>
                                            <p className="text-gray-600">Use our live map to find a nearby charger. Choose between smart charging, direct kWh, or book a future slot.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Pay Securely:</h4>
                                            <p className="text-gray-600">Complete your payment in-app. We'll generate a QR code ticket for you to validate your session at the station.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-1">Plug In & Go:</h4>
                                            <p className="text-gray-600">Scan your ticket, plug in your vehicle, and relax. We'll notify you when your charge is complete.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section - Light Blue Background */}
                <section className="bg-blue-100 py-20">
                    <div className="max-w-4xl mx-auto text-center px-6">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">
                            Ready to Join the Smart Charging Revolution?
                        </h2>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            Create your free account today and experience the future of electric vehicle charging.
                        </p>
                         <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all transform hover:scale-105 shadow-lg">
                           <Link href="/register">
                             Sign Up Now <ArrowRight className="ml-3 h-6 w-6" />
                           </Link>
                        </Button>
                    </div>
                </section>
            </main>

            {/* Footer - White Background */}
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto text-center px-6">
                    <p className="text-gray-500 text-sm mb-4">
                        &copy; {new Date().getFullYear()} ChargeSmart. All rights reserved.
                    </p>
                    <nav className="flex justify-center gap-8 text-sm">
                        <Link href="/about" className="text-gray-500 hover:text-gray-800 transition-colors">
                            About Us
                        </Link>
                        <Link href="/terms-of-service" className="text-gray-500 hover:text-gray-800 transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy-policy" className="text-gray-500 hover:text-gray-800 transition-colors">
                            Privacy Policy
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

    

