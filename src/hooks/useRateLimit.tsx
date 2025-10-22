import { useState, useRef } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockMs?: number;
}

interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  blocked: boolean;
  blockedUntil?: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { maxAttempts, windowMs, blockMs = 60000 } = config;
  const stateRef = useRef<RateLimitState>({
    attempts: 0,
    firstAttempt: 0,
    blocked: false,
  });

  const isBlocked = (): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Check if currently blocked
    if (state.blocked && state.blockedUntil && now < state.blockedUntil) {
      return true;
    }

    // Reset block if time has passed
    if (state.blocked && state.blockedUntil && now >= state.blockedUntil) {
      stateRef.current = {
        attempts: 0,
        firstAttempt: 0,
        blocked: false,
      };
      return false;
    }

    // Check if window has expired
    if (now - state.firstAttempt > windowMs) {
      stateRef.current = {
        attempts: 0,
        firstAttempt: 0,
        blocked: false,
      };
      return false;
    }

    return false;
  };

  const recordAttempt = (): boolean => {
    if (isBlocked()) {
      return false;
    }

    const now = Date.now();
    const state = stateRef.current;

    // First attempt in window
    if (state.attempts === 0) {
      stateRef.current = {
        attempts: 1,
        firstAttempt: now,
        blocked: false,
      };
      return true;
    }

    // Increment attempts
    state.attempts++;

    // Check if exceeded limit
    if (state.attempts > maxAttempts) {
      stateRef.current = {
        ...state,
        blocked: true,
        blockedUntil: now + blockMs,
      };
      return false;
    }

    return true;
  };

  const getRemainingTime = (): number => {
    const state = stateRef.current;
    if (!state.blocked || !state.blockedUntil) return 0;
    
    const remaining = state.blockedUntil - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  return {
    isBlocked,
    recordAttempt,
    getRemainingTime,
  };
};