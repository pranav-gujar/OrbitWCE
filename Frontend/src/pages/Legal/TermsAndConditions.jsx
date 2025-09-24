import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-gray-200 rounded-xl shadow-md overflow-hidden p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-400 mb-4">
              These Terms and Conditions ("Terms") govern your use of the PGT Global Networks website and services 
              (collectively, the "Service") operated by PGT Global Networks ("us", "we", or "our").
            </p>
            <p className="text-gray-400 mb-4">
              Please read these Terms carefully before using our Service. Your access to and use of the Service is 
              conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, 
              users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Accounts</h2>
            <p className="text-gray-400 mb-4">
              When you create an account with us, you must provide us with information that is accurate, complete, 
              and current at all times. Failure to do so constitutes a breach of the Terms, which may result in 
              immediate termination of your account on our Service.
            </p>
            <p className="text-gray-400 mb-4">
              You are responsible for safeguarding the password that you use to access the Service and for any 
              activities or actions under your password, whether your password is with our Service or a third-party service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Content</h2>
            <p className="text-gray-400 mb-4">
              Our Service allows you to post, link, store, share, and otherwise make available certain information, 
              text, graphics, videos, or other material ("Content"). You are responsible for the Content that you 
              post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p className="text-gray-400 mb-4">
              By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours 
              (you own it) and/or you have the right to use it and the right to grant us the rights and license as 
              provided in these Terms, and (ii) that the posting of your Content on or through the Service does not 
              violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person or entity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-400 mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive 
              property of PGT Global Networks and its licensors. The Service is protected by copyright, trademark, 
              and other laws of both the United States and foreign countries. Our trademarks and trade dress may 
              not be used in connection with any product or service without the prior written consent of PGT Global Networks.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Links to Other Web Sites</h2>
            <p className="text-gray-400 mb-4">
              Our Service may contain links to third-party web sites or services that are not owned or controlled by 
              PGT Global Networks. We have no control over, and assume no responsibility for, the content, privacy 
              policies, or practices of any third-party web sites or services. You further acknowledge and agree 
              that PGT Global Networks shall not be responsible or liable, directly or indirectly, for any damage 
              or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, 
              goods, or services available on or through any such web sites or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Termination</h2>
            <p className="text-gray-400 mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
              or liability, under our sole discretion, for any reason whatsoever and without limitation, including but 
              not limited to a breach of the Terms.
            </p>
            <p className="text-gray-400 mb-4">
              All provisions of the Terms which by their nature should survive termination shall survive termination, 
              including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-400 mb-4">
              In no event shall PGT Global Networks, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including 
              without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 text-gray-400 space-y-2 mb-4">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Governing Law</h2>
            <p className="text-gray-400 mb-4">
              These Terms shall be governed and construed in accordance with the laws of the State of New York, 
              United States, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-400 mb-4">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those 
              rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining 
              provisions of these Terms will remain in effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-400 mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
              is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
              a material change will be determined at our sole discretion.
            </p>
            <p className="text-gray-400 mb-4">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound 
              by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

         

          <div className="mt-12 pt-6 border-t border-gray-200">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
