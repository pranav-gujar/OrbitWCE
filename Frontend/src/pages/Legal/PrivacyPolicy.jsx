import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-gray-200 rounded-xl shadow-md overflow-hidden p-8 bg-gray-900">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose max-w-none">
          {/* 1. Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Introduction</h2>
            <p className="text-gray-300 mb-4">
              Welcome to <strong>OrbitWCE</strong> — the official platform for managing clubs, communities, and events at 
              <strong> Walchand College of Engineering (WCE)</strong>. 
              We respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
          </section>

          {/* 2. Data We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">2. The Data We Collect About You</h2>
            <p className="text-gray-300 mb-4">
              OrbitWCE collects limited personal data necessary to help you register for events, connect with clubs, and manage your activities effectively.
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
              <li><strong>Identity Data:</strong> name, student ID, college name, and profile photo.</li>
              <li><strong>Contact Data:</strong> email address and phone number.</li>
              <li><strong>Academic Data:</strong> branch, year, and degree (used for event registrations).</li>
              <li><strong>Event Data:</strong> information about events you register for, like, or participate in.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information for platform performance and security.</li>
            </ul>
          </section>

          {/* 3. How We Use Data */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">3. How We Use Your Data</h2>
            <p className="text-gray-300 mb-4">
              We only use your personal data to enhance your experience within the WCE ecosystem. Specifically:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
              <li>To help you register for and manage participation in college events.</li>
              <li>To verify student identities for event access and certifications.</li>
              <li>To notify you about upcoming events, announcements, and updates.</li>
              <li>To improve the OrbitWCE platform for smoother performance and user experience.</li>
              <li>To generate event reports and analytics for clubs and administration.</li>
            </ul>
          </section>

          {/* 4. Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">4. Data Security</h2>
            <p className="text-gray-300 mb-4">
              We prioritize your data’s safety. All stored data is protected using secure authentication systems, 
              encrypted passwords, and limited access control. Only authorized WCE administrators and club heads 
              can access relevant event data.
            </p>
          </section>

          {/* 5. Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">5. Your Rights</h2>
            <p className="text-gray-300 mb-4">
              As a user of OrbitWCE, you have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
              <li>Request access to view or update your personal information.</li>
              <li>Request deletion of your account and related data.</li>
              <li>Withdraw consent to receive notifications or emails.</li>
              <li>Report any misuse or security concerns regarding your data.</li>
            </ul>
            <p className="text-gray-300 mb-4">
              To exercise any of these rights, you can contact the OrbitWCE Admin or WCE’s technical coordinator.
            </p>
          </section>

          {/* 6. Policy Updates */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">6. Updates to This Policy</h2>
            <p className="text-gray-300 mb-4">
              OrbitWCE may update this Privacy Policy periodically to reflect new features or regulatory changes. 
              All updates will be posted here with a new “Last Updated” date.
            </p>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-700">
            <Link to="/" className="text-blue-400 hover:text-blue-500 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
