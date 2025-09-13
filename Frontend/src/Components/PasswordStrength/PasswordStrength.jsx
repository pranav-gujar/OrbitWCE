import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PasswordStrength = ({ password = '' }) => {
  const requirements = [
    {
      text: 'At least 8 characters long',
      validator: (val) => val.length >= 8,
    },
    {
      text: 'Maximum 30 characters',
      validator: (val) => val.length <= 30,
    },
    {
      text: 'At least one uppercase letter (A-Z)',
      validator: (val) => /[A-Z]/.test(val),
    },
    {
      text: 'At least one lowercase letter (a-z)',
      validator: (val) => /[a-z]/.test(val),
    },
    {
      text: 'At least one number (0-9)',
      validator: (val) => /[0-9]/.test(val),
    },
    {
      text: 'At least one special character (@$!%*?&)',
      validator: (val) => /[@$!%*?&]/.test(val),
    },
  ];

  // Check if all requirements are met
  const allRequirementsMet = password && requirements.every(req => req.validator(password));

  // Don't render anything if there's no password or all requirements are met
  if (!password || allRequirementsMet) {
    return null;
  }

  return (
    <div className="mt-2 text-sm text-gray-400">
      <p className="font-medium mb-2">Password must contain:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => {
          const isValid = req.validator(password);
          return (
            <li 
              key={index} 
              className={`flex items-center ${isValid ? 'text-green-600' : 'text-gray-400'}`}
            >
              {isValid ? (
                <FaCheck className="mr-2 text-green-500" />
              ) : (
                <FaTimes className="mr-2 text-red-500" />
              )}
              {req.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
