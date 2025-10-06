import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-gray-200 rounded-xl shadow-md overflow-hidden p-8 bg-gray-900">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-4">Terms and Conditions</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose max-w-none">
          
          {/* 1. Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Introduction</h2>
            <p className="text-gray-300 mb-4">
              Welcome to <strong>OrbitWCE</strong>, the official Clubs and Event Management Platform of 
              <strong> Walchand College of Engineering (WCE)</strong>. 
              These Terms and Conditions ("Terms") govern your use of the OrbitWCE website and its associated services 
              (collectively, the “Platform”) operated by the WCE technical development team.
            </p>
            <p className="text-gray-300 mb-4">
              By accessing or using this platform, you agree to comply with and be bound by these Terms. 
              If you do not agree, please refrain from using OrbitWCE.
            </p>
          </section>

          {/* 2. Accounts */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">2. User Accounts</h2>
            <p className="text-gray-300 mb-4">
              To access certain features (like event registration or club management), you must create a valid account 
              using your details. You agree to provide accurate and updated information at all times.
            </p>
            <p className="text-gray-300 mb-4">
              You are responsible for maintaining the confidentiality of your login credentials. 
              Any actions performed under your account will be considered as done by you. 
              Please notify the admin immediately if you suspect any unauthorized use of your account.
            </p>
          </section>

          {/* 3. User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">3. User Content and Conduct</h2>
            <p className="text-gray-300 mb-4">
              OrbitWCE allows users and club representatives to upload event details, posters, and related information. 
              You are solely responsible for the content you submit, including its accuracy and appropriateness.
            </p>
            <p className="text-gray-300 mb-4">
              By posting content, you grant OrbitWCE permission to display and distribute it for event promotion and college purposes.
              Inappropriate, misleading, or offensive content may be removed, and repeated violations may lead to suspension.
            </p>
          </section>

          {/* 4. Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-300 mb-4">
              All design elements, code, structure, and original content on OrbitWCE are the intellectual property of the WCE development team. 
              You may not copy, reuse, or distribute any part of the platform’s backend or frontend code without permission.
            </p>
          </section>

          {/* 5. External Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">5. Links to Other Websites</h2>
            <p className="text-gray-300 mb-4">
              OrbitWCE may contain links to external resources such as event registration forms, external college initiatives, 
              or social media pages of clubs. WCE is not responsible for the content or practices of these external websites.
            </p>
          </section>

          {/* 6. Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">6. Account Suspension or Termination</h2>
            <p className="text-gray-300 mb-4">
              OrbitWCE administrators may suspend or terminate your account at any time if you are found violating these Terms, 
              uploading false data, or misusing the system. 
            </p>
            <p className="text-gray-300 mb-4">
              Termination may also occur for security reasons, inactivity, or at the request of the WCE administration.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-300 mb-4">
              OrbitWCE and the WCE development team shall not be held responsible for any technical errors, data loss, 
              or inconvenience caused by temporary downtime, maintenance, or external factors. 
              Users are encouraged to double-check registration confirmations and event details.
            </p>
          </section>

          {/* 8. Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">8. Governing Law</h2>
            <p className="text-gray-300 mb-4">
              These Terms are governed by the laws of India and applicable educational policies of Walchand College of Engineering, Sangli. 
              Any disputes arising from these Terms will be subject to the jurisdiction of local courts in Sangli, Maharashtra.
            </p>
          </section>

          {/* 9. Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">9. Updates to These Terms</h2>
            <p className="text-gray-300 mb-4">
              WCE reserves the right to update these Terms from time to time to reflect system improvements, 
              security enhancements, or policy changes. Updates will be effective immediately upon posting on the platform.
            </p>
            <p className="text-gray-300 mb-4">
              Continued use of OrbitWCE after updates implies acceptance of the new Terms.
            </p>
          </section>

          {/* Back link */}
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

export default TermsAndConditions;
