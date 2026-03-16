'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Truck } from 'lucide-react';
import { RealisticCapsule } from './RealisticCapsule';

const Molecule = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="5" cy="19" r="3" />
    <circle cx="19" cy="5" r="3" />
    <circle cx="19" cy="19" r="3" />
    <circle cx="5" cy="5" r="3" />
    <path d="M7 17l10-10" opacity="0.4" />
    <path d="M17 19H7" opacity="0.4" />
    <path d="M19 17V7" opacity="0.4" />
  </svg>
);

export function AnimatedHeroBackground() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [particles, setParticles] = React.useState<any[]>([]);

  React.useEffect(() => {
    setIsMounted(true);
    // Generate particles only on the client to avoid hydration mismatch
    const newParticles = [...Array(8)].map((_, i) => ({
      id: i,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
      width: Math.random() * 6 + 2 + 'px',
      height: Math.random() * 6 + 2 + 'px',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
    }));
    setParticles(newParticles);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden z-[-1] pointer-events-none opacity-100">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-secondary-50/50"></div>

      {/* Large Glowing Orbs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-primary-200/40 mix-blend-multiply filter blur-[80px]"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 0.5, scale: 1.1 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
        className="absolute top-[30%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-secondary-200/40 mix-blend-multiply filter blur-[80px]"
      />

      {/* Floating Elements */}
      
      {/* 1. Pharmacy Cross */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] right-[25%] text-primary-400/60"
      >
        <Plus className="w-20 h-20" strokeWidth={3} />
      </motion.div>

      {/* Realistic Capsules Floating */}
      <motion.div
        animate={{ 
          y: [0, 30, 0],
          x: [0, -15, 0],
          rotate: [45, 60, 45]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[35%] left-[10%] opacity-40 blur-[1px]"
      >
        <RealisticCapsule className="w-32 h-14" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -40, 0],
          x: [0, 25, 0],
          rotate: [-20, 10, -20]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[30%] left-[20%] opacity-30"
      >
        <RealisticCapsule className="w-24 h-10" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -50, 0],
          x: [0, -20, 0],
          rotate: [120, 140, 120]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-[15%] right-[20%] opacity-20 blur-[2px]"
      >
        <RealisticCapsule className="w-40 h-16" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 25, 0],
          rotate: [15, -10, 15]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[25%] right-[30%] opacity-30"
      >
        <RealisticCapsule className="w-20 h-8" />
      </motion.div>

      {/* 3. Molecule / DNA abstract */}
      <motion.div
        animate={{ 
          y: [0, -25, 0],
          rotate: [0, 45, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[15%] right-[15%] text-primary-500/50"
      >
        <Molecule className="w-24 h-24" />
      </motion.div>

      {/* 4. Delivery Concept - Bouncing Truck */}
      <motion.div
        animate={{ 
          x: [0, 60, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-[20%] left-[35%] text-emerald-500/60"
      >
        <Truck className="w-16 h-16" />
      </motion.div>

      {/* 5. Fast Delivery Trail moving across screen */}
      <motion.div
         animate={{
            x: ['-20vw', '100vw']
         }}
         transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
         className="absolute top-[65%] -left-20 text-indigo-500/50 flex items-center gap-4"
      >
         <Truck className="w-20 h-20" />
         <div className="w-32 h-2 bg-gradient-to-l from-indigo-500/60 to-transparent rounded-full" />
      </motion.div>

      {/* Tiny glowing particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay
          }}
          className="absolute rounded-full bg-primary-400"
          style={{
            width: particle.width,
            height: particle.height,
            top: particle.top,
            left: particle.left,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );
}
