'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import QuoteCycler from './QuoteCycler';

export default function AnimatedHome() {
  const [phase, setPhase] = useState<'initial' | 'translate' | 'scale' | 'complete'>('initial');
  const [showQuotes, setShowQuotes] = useState(false);

  useEffect(() => {
    // Phase 1: Start translate up after 500ms
    const translateTimer = setTimeout(() => {
      setPhase('translate');
    }, 500);

    // Phase 2: Scale down after translate completes (350ms later)
    const scaleTimer = setTimeout(() => {
      setPhase('scale');
    }, 850);

    // Phase 3: Complete and show quotes
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      setShowQuotes(true);
    }, 1100);

    return () => {
      clearTimeout(translateTimer);
      clearTimeout(scaleTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const isAnimating = phase !== 'initial';
  const isScaled = phase === 'scale' || phase === 'complete';

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden">
      {/* Top Header Bar - Avatar and Logo */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-2 pb-1">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9'
            }
          }}
        />
        
        {/* Logo in header (visible after animation) */}
        <h1 
          className="font-bold text-foreground tracking-tight text-xl"
          style={{
            opacity: isScaled ? 1 : 0,
            transform: isScaled ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Continuum
        </h1>
        
        <div className="w-9" /> {/* Spacer for balance */}
      </div>

      {/* Animated Center Logo (initial state) */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(-100px) scale(0.5)' : 'translateY(0) scale(1)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isAnimating ? -1 : 10,
        }}
      >
        <h1 className="font-bold text-foreground tracking-tight text-5xl md:text-6xl lg:text-7xl">
          Continuum
        </h1>
      </div>

      {/* Quote Cycler Section */}
      <div 
        className="flex-1 flex flex-col items-center justify-center px-4 min-h-0"
        style={{
          opacity: showQuotes ? 1 : 0,
          transform: showQuotes ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: showQuotes ? 'auto' : 'none',
        }}
      >
        <div className="max-w-xs mx-auto text-center">
          <QuoteCycler />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 pb-4 px-4">
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/habits"
            className="glass-btn flex h-10 items-center justify-center rounded-xl px-6 text-foreground font-medium hover:bg-ocean/20 transition-all text-sm"
          >
            Go to Habits
          </Link>
          
          {/* Quick Stats Card */}
          <div 
            className="glass-card p-3 max-w-xs space-y-1 w-full"
            style={{
              opacity: isAnimating ? 0.7 : 1,
              transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1) 200ms',
            }}
          >
            <h2 className="text-gold font-semibold text-sm">Quick Stats</h2>
            <p className="text-xs text-muted-foreground">
              Start tracking your habits to see your progress here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
