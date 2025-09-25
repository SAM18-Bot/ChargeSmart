
'use client';

import Header from '@/components/dashboard/header';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          className="prose lg:prose-xl max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-headline text-primary">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to ChargeSmart. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy sets out how we collect, use, and protect any information that you give us when you use this application.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>We may collect the following information:</p>
          <ul>
            <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, and password. If you sign in with Google, we receive your name, email, and profile picture as permitted by your Google account settings.</li>
            <li><strong>Usage Data:</strong> We collect information about your interactions with our service, such as which chargers you view, charging sessions you start, and features you use.</li>
            <li><strong>Location Data:</strong> With your permission, we collect your device's location to help you find nearby charging stations.</li>
            <li><strong>Transaction Data:</strong> We collect details of transactions you carry out through our app, including the amount, time, and charger used. We use a third-party payment processor (Razorpay), and we do not store your full credit card or bank account details.</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li>To provide, operate, and maintain our services.</li>
            <li>To improve, personalize, and expand our services.</li>
            <li>To understand and analyze how you use our services.</li>
            <li>To process your transactions and manage your charging sessions.</li>
            <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the app, and for marketing and promotional purposes.</li>
            <li>To find and prevent fraud.</li>
          </ul>
          
          <h2>4. Sharing Your Information</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We are committed to ensuring that your information is secure. In order to prevent unauthorized access or disclosure, we have put in place suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online.
          </p>
          
          <h2>6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.
          </p>

          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please <Link href="/about">contact us</Link>.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
