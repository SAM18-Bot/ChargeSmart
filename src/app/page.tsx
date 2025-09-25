'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Zap, Map, Bot, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div 
    className="bg-card/50 p-6 rounded-lg border border-primary/20 shadow-lg"
    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px hsla(var(--primary)/0.1), 0 4px 6px -2px hsla(var(--primary)/0.05)"}}
  >
    <div className="flex items-center space-x-4 mb-4">
      <div className="p-3 bg-primary/20 rounded-full text-accent">{icon}</div>
      <h3 className="text-xl font-bold font-headline text-foreground">{title}</h3>
    </div>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export default function LandingPage() {
    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
    };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-xl font-bold font-headline tracking-tighter text-primary">ChargeSmart</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <motion.section 
          className="py-20 md:py-32 text-center relative overflow-hidden"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div 
            className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:14px_24px]">
          </div>
          <div className="absolute top-0 left-0 -z-10 w-64 h-64 bg-accent/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-0 right-0 -z-10 w-64 h-64 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

          <div className="container">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline mb-6">
              <span className="text-primary">The Future of </span>
              <span className="text-accent">EV Charging</span>
              <span className="text-primary"> is Here.</span>
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground mb-10">
              Find, book, and manage your EV charging sessions with ease. ChargeSmart is the intelligent way to power your journey.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
                <Link href="/register">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          id="features" 
          className="py-20"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">
              Why <span className="text-primary">ChargeSmart</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Map size={28} />}
                title="Smart Station Locator"
                description="Find the nearest available charging station with our real-time map. Filter by connector type, speed, and availability."
              />
              <FeatureCard
                icon={<Zap size={28} />}
                title="Seamless Booking"
                description="Reserve your spot in advance and skip the queue. Get notifications when your slot is about to start."
              />
              <FeatureCard
                icon={<Bot size={28} />}
                title="AI-Powered Assistant"
                description="Our voice-enabled AI assistant helps you find chargers, optimize your charging schedule, and answer any questions."
              />
            </div>
          </div>
        </motion.section>

        {/* How it works Section */}
        <motion.section 
            className="py-20 bg-card/30"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                    <h2 className="text-3xl font-bold font-headline text-foreground mb-4">Charge Your EV in 3 Simple Steps</h2>
                    <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                        <li><span className="font-bold text-foreground">Find & Select:</span> Use our interactive map to find a convenient charging station.</li>
                        <li><span className="font-bold text-foreground">Book & Pay:</span> Reserve your slot and complete the payment securely within the app.</li>
                        <li><span className="font-bold text-foreground">Plug-In & Charge:</span> Arrive at the station, plug in your vehicle, and start charging. We'll notify you when it's done!</li>
                    </ol>
                </div>
                <div className="md:w-1/2">
                    <Image
                        src="https://picsum.photos/seed/ev-charging-app/600/400"
                        alt="Phone screen showing EV charging app interface"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-2xl border-2 border-primary/30"
                        data-ai-hint="ev app"
                    />
                </div>
            </div>
        </motion.section>
      </main>

      <footer className="w-full border-t border-border mt-12 py-8 bg-card/20">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} ChargeSmart. A Demo by Sameer Bansode.</p>
           <nav className="mt-4 flex justify-center gap-4">
                <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}
