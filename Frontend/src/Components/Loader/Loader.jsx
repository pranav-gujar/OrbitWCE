import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  // Animation variants for the ring
  const ringVariants = {
    hidden: { 
      rotate: 0,
      scale: 0.8,
      opacity: 0.7 
    },
    visible: {
      rotate: 360,
      scale: 1,
      opacity: 1,
      transition: {
        rotate: { 
          repeat: Infinity, 
          duration: 2, 
          ease: "linear" 
        },
        scale: { 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 1.5,
          ease: "easeInOut" 
        }
      }
    }
  };

  // Animation for the inner circle
  const innerCircleVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        scale: { 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 1.5,
          ease: "easeInOut"
        },
        opacity: { 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 1.5,
          ease: "easeInOut"
        }
      } 
    }
  };

  // Animation for the text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: 0.3
      } 
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center z-50">
      <div className="relative w-32 h-32 flex items-center justify-center mb-8">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-blue-500 border-b-green-500 border-l-yellow-500"
          variants={ringVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Inner circle */}
          <motion.div 
            className="absolute inset-2 rounded-full bg-gradient-to-br from-red-500 to-blue-500"
            variants={innerCircleVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.div
        className="text-center"
        variants={textVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold text-white mb-2">PGT Global Networks</h2>
        <p className="text-gray-400 text-sm">Loading your experience...</p>
      </motion.div>
    </div>
  );
};

export default Loader;
