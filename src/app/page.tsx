

'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, MapPin, Bot, Clock, Battery, DollarSign, Users, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons/logo';
import placeholderImages from '@/lib/placeholder-images.json';
import { motion } from 'framer-motion';

const { evChargingStation } = placeholderImages;


const FloatingParticles = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setParticles([...Array(20)].map((_, i) => ({
      key: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: Math.random() * 5,
      animationDuration: 5 + Math.random() * 5
    })));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.key}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          style={{
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.animationDuration,
            delay: p.animationDelay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const ValueDemonstrationSection = () => {
  
  const demos = [
    {
      title: "Without ChargeSmart",
      problems: [
        { icon: AlertCircle, text: "Driving around looking for chargers", color: "text-red-500 dark:text-red-400" },
        { icon: AlertCircle, text: "Waiting in long queues", color: "text-red-500 dark:text-red-400" },
        { icon: AlertCircle, text: "Paying premium rates", color: "text-red-500 dark:text-red-400" },
        { icon: AlertCircle, text: "Uncertainty about availability", color: "text-red-500 dark:text-red-400" }
      ]
    },
    {
      title: "With ChargeSmart",
      solutions: [
        { icon: CheckCircle, text: "Instant station discovery", color: "text-green-500 dark:text-green-400" },
        { icon: CheckCircle, text: "Pre-book your slot", color: "text-green-500 dark:text-green-400" },
        { icon: CheckCircle, text: "AI finds best rates", color: "text-green-500 dark:text-green-400" },
        { icon: CheckCircle, text: "Real-time availability", color: "text-green-500 dark:text-green-400" }
      ]
    }
  ];

  return (
    <motion.section 
      className="py-20 bg-muted/20 dark:bg-muted/10 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            The ChargeSmart Difference
          </h2>
          <p className="text-xl text-muted-foreground">From frustrating to seamless charging.</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {demos.map((demo, index) => (
              <motion.div 
                key={index}
                className={`p-8 rounded-2xl ${
                  index === 0 ? 'bg-red-500/10 border-2 border-red-500/20' : 'bg-green-500/10 border-2 border-green-500/20'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-6 text-foreground">{demo.title}</h3>
                <div className="space-y-4">
                  {(demo.problems || demo.solutions || []).map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3"
                    >
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                      <span className="text-foreground/90 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.section>
  );
};


const LiveStatsSection = () => {
    const [stats, setStats] = useState({
      activeUsers: 1250,
      chargingSessions: 892,
      moneySaved: 45230,
      co2Reduced: 12.8,
    });
  
    useEffect(() => {
      const interval = setInterval(() => {
        setStats((prev) => ({
          activeUsers: prev.activeUsers + Math.floor(Math.random() * 2),
          chargingSessions: prev.chargingSessions + 1,
          moneySaved: prev.moneySaved + Math.floor(Math.random() * 50),
          co2Reduced: prev.co2Reduced + Math.random() * 0.05,
        }));
      }, 3000);
      return () => clearInterval(interval);
    }, []);
  
    const statItems = [
      {
        icon: Users,
        value: stats.activeUsers.toLocaleString(),
        label: 'Active Users Today',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
      },
      {
        icon: Zap,
        value: stats.chargingSessions.toLocaleString(),
        label: 'Charging Sessions',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
      },
      {
        icon: DollarSign,
        value: `₹${stats.moneySaved.toLocaleString()}`,
        label: 'Money Saved Today',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
      },
      {
        icon: Battery,
        value: `${stats.co2Reduced.toFixed(1)}T`,
        label: 'CO₂ Reduced',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
      },
    ];
  
    return (
      <section className="py-16 bg-background dark:bg-card/20 text-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/20 animate-pulse opacity-30 dark:opacity-100"></div>
  
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Live Impact Dashboard</h2>
            <p className="text-xl text-muted-foreground">
              See the real-time impact ChargeSmart is making.
            </p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statItems.map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-background/50 dark:bg-card/50 backdrop-blur-sm rounded-2xl border border-border/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-muted-foreground mt-2">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  

const UserJourneyAnimation = () => {
    const journeySteps = [
        {
          title: "Find a Station",
          description: "Open the app to see nearby chargers on the live map.",
          icon: MapPin,
        },
        {
          title: "Optimize & Book", 
          description: "Let AI find the best price and time, then book your slot.",
          icon: Bot,
        },
        {
          title: "Pay & Get Ticket",
          description: "Securely pay in-app and receive a QR code ticket.",
          icon: DollarSign,
        },
        {
          title: "Arrive & Charge",
          description: "Scan your ticket at the station and plug in. No waiting.",
          icon: Zap,
        }
      ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            A Perfect Journey
          </h2>
          <p className="text-xl text-muted-foreground">Four simple steps to a seamless charge.</p>
        </div>
        
        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-px bg-border -translate-x-1/2 hidden md:block" />
            
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {journeySteps.map((step, idx) => (
              <motion.div 
                key={idx}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
              </motion.div>
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
        <div className="min-h-screen relative overflow-hidden bg-background">
            {/* Animated Background Image with Overlay */}
            <div className="absolute inset-0 bg-background dark:bg-card">
              <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-5"
                  style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
                  }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10"></div>
            </div>
            {isClient && <FloatingParticles />}
            
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/30 backdrop-blur-lg">
                <div className="container mx-auto flex justify-between items-center px-6 py-4">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo />
                        <span className="text-2xl font-bold text-foreground">ChargeSmart</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button variant="ghost" asChild>
                            <Link href="/login" className="text-foreground hover:bg-muted/50">Log In</Link>
                        </Button>
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                            <Link href="/register">Sign Up Free</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="text-center px-6 py-20">
                    <div className="container mx-auto max-w-4xl">
                        <motion.h1 
                            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            Seamless EV Charging,<br />
                            <span className="text-primary">Intelligently Managed</span>
                        </motion.h1>
                        <motion.p 
                            className="text-xl md:text-2xl max-w-3xl mx-auto text-muted-foreground mb-10 leading-relaxed font-light"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            ChargeSmart is your ultimate companion for finding, booking, and optimizing your electric vehicle charging. Spend less time waiting and more time driving.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all transform hover:scale-105 shadow-lg">
                               <Link href="/register">
                                 Get Started <ArrowRight className="ml-3 h-6 w-6" />
                               </Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Value Demonstration Section */}
                <ValueDemonstrationSection />

                {/* Live Stats Section */}
                <LiveStatsSection />

                {/* User Journey Animation */}
                <UserJourneyAnimation />

                {/* Features Section - White Background */}
                <section className="bg-muted/20 dark:bg-card/20 py-20 relative">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl font-bold text-foreground text-center mb-16">
                            Everything You Need for Smart Charging
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center p-6 rounded-2xl bg-card hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <MapPin className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Live Station Map</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Find available chargers near you with our real-time map. See status, queue times, and more.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 rounded-2xl bg-card hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">AI Schedule Optimizer</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Our AI assistant finds the most cost-effective and time-efficient charging plan for your EV.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 rounded-2xl bg-card hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Clock className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Advance Booking</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Plan ahead and reserve charging slot to avoid waiting. Perfect for your busy schedule.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 rounded-2xl bg-card hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Zap className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Seamless Payments</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Pay securely in-app with multiple payment options. Get digital receipts and track history.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section - Light Blue Background */}
                <section className="bg-background py-20">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <Image
                                    src={evChargingStation.src}
                                    alt={evChargingStation.alt}
                                    width={800}
                                    height={600}
                                    className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                                    data-ai-hint={evChargingStation.hint}
                                />
                            </div>
                            <div className="lg:w-1/2">
                                <div className="mb-8">
                                    <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-foreground mb-8">Get Charged in 3 Easy Steps</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">Find & Select:</h4>
                                            <p className="text-muted-foreground">Use our live map to find a nearby charger. Choose between smart charging, direct kWh, or book a future slot.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">Pay Securely:</h4>
                                            <p className="text-muted-foreground">Complete your payment in-app. We'll generate a QR code ticket for you to validate your session at the station.</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">Plug In & Go:</h4>
                                            <p className="text-muted-foreground">Scan your ticket, plug in your vehicle, and relax. We'll notify you when your charge is complete.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section - Light Blue Background */}
                <section className="bg-muted/30 py-20">
                    <div className="container mx-auto max-w-4xl text-center px-6">
                        <h2 className="text-4xl font-bold text-foreground mb-6">
                            Ready to Join the Smart Charging Revolution?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                            Create your free account today and experience the future of electric vehicle charging.
                        </p>
                         <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all transform hover:scale-105 shadow-lg">
                           <Link href="/register">
                             Sign Up Now <ArrowRight className="ml-3 h-6 w-6" />
                           </Link>
                        </Button>
                    </div>
                </section>
            </main>

            {/* Footer - White Background */}
            <footer className="bg-card border-t border-border/50 py-8">
                <div className="container mx-auto text-center px-6">
                    <p className="text-muted-foreground text-sm mb-4">
                        &copy; {new Date().getFullYear()} ChargeSmart. All rights reserved.
                    </p>
                    <nav className="flex justify-center gap-8 text-sm">
                        <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                            About Us
                        </Link>
                        <Link href="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
                            Admin Login
                        </Link>
                        <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

    

    
