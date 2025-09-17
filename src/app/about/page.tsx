'use client';

import Header from '@/components/dashboard/header';
import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { Users, Zap, Leaf, Heart, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const TeamMemberCard = ({ name, role, imageUrl }: { name: string; role: string; imageUrl: string }) => (
  <motion.div
    className="text-center"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="relative h-40 w-40 mx-auto mb-4">
      <Image
        src={imageUrl}
        alt={`Photo of ${name}`}
        width={200}
        height={200}
        className="rounded-full object-cover border-4 border-primary/50"
        data-ai-hint="developer portrait"
      />
    </div>
    <h3 className="text-lg font-bold text-foreground">{name}</h3>
    <p className="text-sm text-primary">{role}</p>
  </motion.div>
);

const InfoCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="flex flex-col items-center text-center p-6 bg-card/50 rounded-lg shadow-lg">
        <div className="p-3 bg-primary rounded-full mb-4 text-primary-foreground">{icon}</div>
        <h3 className="text-xl font-headline text-primary mb-2">{title}</h3>
        <p className="text-muted-foreground">{children}</p>
    </div>
)


export default function AboutPage() {
  const { user } = useAuth(); // Assuming user might be needed for header

  if (!user) {
    // Optional: handle case where user is not logged in, maybe redirect or show a different header
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <p>Please <Link href="/login" className="text-primary underline">log in</Link> to view this page.</p>
        </div>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };


  return (
    <div className="bg-background min-h-screen font-body">
      <Header user={user} assistantDialog={<div></div>} />
      
      <main>
        {/* Hero Section */}
        <motion.section
          className="py-20 md:py-32 text-center bg-gradient-to-br from-background via-primary/5 to-background"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="container mx-auto px-4">
            <motion.div
                className="inline-block mb-6"
                animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
                <Logo />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline text-primary mb-4">About ChargeSmart</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
              Powering the future of mobility, one charge at a time. We are dedicated to making electric vehicle charging simple, accessible, and smart for everyone.
            </p>
          </div>
        </motion.section>

        {/* Mission & Vision Section */}
        <motion.section 
            className="py-16"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
                <InfoCard icon={<Zap size={28} />} title="Our Mission">
                    To accelerate the adoption of electric vehicles by creating a seamless and reliable charging network that is accessible to all.
                </InfoCard>
                <InfoCard icon={<Leaf size={28} />} title="Our Vision">
                    A sustainable world where transportation is 100% electric, powered by clean energy and intelligent technology.
                </InfoCard>
                <InfoCard icon={<Heart size={28} />} title="Our Values">
                    Customer-centricity, innovation, sustainability, and reliability are the core pillars that drive every decision we make.
                </InfoCard>
            </div>
        </motion.section>

        {/* Story Section */}
        <motion.section 
            className="py-16 bg-card/30"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                    <Image
                        src="https://picsum.photos/seed/future-mobility/600/400"
                        alt="Electric car charging in a futuristic city"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-2xl"
                        data-ai-hint="futuristic ev"
                    />
                </div>
                <div className="md:w-1/2">
                    <h2 className="text-3xl font-bold font-headline text-foreground mb-4">Our Story</h2>
                    <p className="text-muted-foreground mb-4">
                        Founded in 2025, ChargeSmart was born from a simple observation: the future of driving is electric, but the charging experience was often fragmented and frustrating. A group of tech enthusiasts and environmental advocates came together with a shared goal: to build an EV charging platform that just works.
                    </p>
                    <p className="text-muted-foreground">
                        From a single test charger in Pune, we've grown into a network spanning major Indian cities, powered by cutting-edge AI and a passion for customer satisfaction. We're not just building chargers; we're building the infrastructure for a cleaner tomorrow.
                    </p>
                </div>
            </div>
        </motion.section>


        {/* Team Section */}
        <motion.section 
            className="py-20 text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-headline text-foreground mb-12">Meet the Developer</h2>
            <div className="flex justify-center">
              <TeamMemberCard name="Sameer Bansode" role="Developer" imageUrl="https://picsum.photos/seed/developer-portrait/200/200" />
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          className="py-16 bg-primary/10"
          id="contact"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold font-headline text-foreground mb-4">Get In Touch</h2>
                 <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                    Have questions, feedback, or a partnership inquiry? We'd love to hear from you. Reach out to our team, and we'll get back to you as soon as possible.
                 </p>
                 <a href="mailto:sameerbansode001@gmail.com" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                    <Mail className="mr-3 h-5 w-5" />
                    Contact Us
                </a>
            </div>
        </motion.section>
      </main>
    </div>
  );
}
