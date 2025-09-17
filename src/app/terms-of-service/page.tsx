
'use client';

import Header from '@/components/dashboard/header';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const { user } = useAuth();

  if (!user) {
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
      
      <main className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="prose lg:prose-xl max-w-4xl mx-auto dark:prose-invert"
        >
          <h1 className="text-4xl font-headline text-primary">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2>1. Agreement to Terms</h2>
          <p>
            By using our application, ChargeSmart, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application. This is a demo application and should not be used for real transactions.
          </p>
          
          <h2>2. Description of Service</h2>
          <p>
            ChargeSmart provides a platform to find, book, and manage electric vehicle (EV) charging stations. The service includes features like a map of chargers, real-time availability, queueing, and an AI assistant. All data presented is for demonstration purposes only.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            To use certain features of the app, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and for any activities or actions under your account.
          </p>

          <h2>4. User Conduct</h2>
          <p>You agree not to use the service to:</p>
          <ul>
            <li>Violate any local, state, national, or international law.</li>
            <li>Engage in any activity that is harmful, fraudulent, deceptive, or threatening.</li>
            <li>Attempt to interfere with the proper functioning of the Service.</li>
            <li>Use the service for any commercial purpose without our prior written consent.</li>
          </ul>
          
          <h2>5. Payments and Bookings</h2>
          <p>
            ChargeSmart facilitates payments for charging sessions through a third-party payment processor (Razorpay). All transactions are for demonstration purposes only and do not involve real money. We are not responsible for any issues arising from payment processing. Bookings are not guaranteed and are part of the simulation.
          </p>
          
          <h2>6. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "AS IS" and "AS AVAILABLE" basis. ChargeSmart makes no warranty that the service will meet your requirements or be available on an uninterrupted, secure, or error-free basis. All information regarding charger status, queue times, and pricing is simulated.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall ChargeSmart, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please <Link href="/about">contact us</Link>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
