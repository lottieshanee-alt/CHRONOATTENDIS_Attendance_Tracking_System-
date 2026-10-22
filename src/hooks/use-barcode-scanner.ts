'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxIntervalMs?: number;
  enableAudioFeedback?: boolean;
}

export function useBarcodeScanner({
  onScan,
  minChars = 4,
  maxIntervalMs = 50,
  enableAudioFeedback = true,
}: UseBarcodeScannerOptions) {
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(enableAudioFeedback);

  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Synthesize clean institutional audio tone (Web Audio API)
  const playAudioTone = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    if (!audioEnabled || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        // High-pitched double chirp (880Hz then 1320Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'warning') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.21);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      }
    } catch {
      // AudioContext autoplay restrictions or browser limitations
    }
  }, [audioEnabled]);

  const triggerScan = useCallback((barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;
    setLastScanned(cleanBarcode);
    setLastScanTime(new Date());
    playAudioTone('success');
    onScan(cleanBarcode);
  }, [onScan, playAudioTone]);

  useEffect(() => {
    setIsScannerReady(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an editable input or textarea (unless explicitly marked for scanner)
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // If user is focused on a text input not marked for scanner, ignore
      if (isInput && !target.hasAttribute('data-scanner-input')) {
        return;
      }

      const now = performance.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        // Evaluate buffer if barcode has min length
        if (bufferRef.current.length >= minChars) {
          e.preventDefault();
          const capturedBarcode = bufferRef.current;
          bufferRef.current = '';
          triggerScan(capturedBarcode);
        } else {
          bufferRef.current = '';
        }
        return;
      }

      // Ignore modifier keys
      if (
        e.key.length > 1 &&
        e.key !== 'Backspace' &&
        e.key !== 'Delete'
      ) {
        return;
      }

      // Clear buffer if interval exceeds scanner speed threshold (human typing)
      if (interval > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      // Append character to buffer
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [maxIntervalMs, minChars, triggerScan]);

  return {
    isScannerReady,
    lastScanned,
    lastScanTime,
    audioEnabled,
    setAudioEnabled,
    playAudioTone,
    triggerScan,
  };
}
