'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minChars?: number;
  maxIntervalMs?: number;
  cooldownMs?: number;
  audioEnabled?: boolean;
  onCooldownHit?: (barcode: string, remainingMs: number) => void;
  onF9Shortcut?: () => void;
}

export interface ScannerDiagnostics {
  lastBurstIntervalAvgMs: number | null;
  lastBurstCharCount: number;
  detectedAsHardware: boolean;
}

export function useBarcodeScanner({
  onScan,
  minChars = 4,
  maxIntervalMs = 50,
  cooldownMs = 3000,
  audioEnabled = true,
  onCooldownHit,
  onF9Shortcut,
}: UseBarcodeScannerOptions) {
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(audioEnabled);
  const isListenerActive = typeof window !== 'undefined';
  const [diagnostics, setDiagnostics] = useState<ScannerDiagnostics>({
    lastBurstIntervalAvgMs: null,
    lastBurstCharCount: 0,
    detectedAsHardware: false,
  });

  const bufferRef = useRef<string>('');
  const keyTimestampsRef = useRef<number[]>([]);
  const lastKeyTimeRef = useRef<number>(0);
  const lastScannedBarcodeRef = useRef<string | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

  // Synthesize clean institutional audio tone (Web Audio API)
  const playAudioTone = useCallback(
    (type: 'success' | 'warning' | 'error' = 'success') => {
      if (!isAudioActive || typeof window === 'undefined') return;

      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
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
          // Warning chime (440Hz triangle)
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
          // Error tone (220Hz sawtooth buzz)
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
        // AudioContext restrictions or headless environments
      }
    },
    [isAudioActive]
  );

  const triggerScan = useCallback(
    (barcode: string, options?: { skipCooldown?: boolean }) => {
      const cleanBarcode = barcode.trim();
      if (!cleanBarcode) return;

      const now = performance.now();
      const timeSinceLast = now - lastScanTimestampRef.current;

      // Duplicate scan cooldown check (B1)
      if (
        !options?.skipCooldown &&
        cooldownMs > 0 &&
        lastScannedBarcodeRef.current === cleanBarcode &&
        timeSinceLast < cooldownMs
      ) {
        const remaining = Math.ceil(cooldownMs - timeSinceLast);
        playAudioTone('warning');
        onCooldownHit?.(cleanBarcode, remaining);
        return;
      }

      lastScannedBarcodeRef.current = cleanBarcode;
      lastScanTimestampRef.current = now;

      setLastScanned(cleanBarcode);
      setLastScanTime(new Date());

      onScan(cleanBarcode);
    },
    [cooldownMs, onScan, onCooldownHit, playAudioTone]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F9 keyboard shortcut to open/toggle Scanner Station (D4)
      if (e.key === 'F9' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        onF9Shortcut?.();
        return;
      }

      // Reject auto-repeat keystrokes (prevents holding a key down)
      if (e.repeat) {
        return;
      }

      // Ignore modifier combinations
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // Target check: ignore user typing in inputs UNLESS marked with data-scanner-input
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isInput && !target.hasAttribute('data-scanner-input')) {
        return;
      }

      const now = performance.now();
      const interval = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= minChars) {
          e.preventDefault();
          const capturedBarcode = bufferRef.current;
          const intervals = keyTimestampsRef.current;
          let avgInterval = null;
          let isHwBurst = false;

          if (intervals.length > 1) {
            const deltas = [];
            for (let i = 1; i < intervals.length; i++) {
              deltas.push(intervals[i] - intervals[i - 1]);
            }
            const sum = deltas.reduce((a, b) => a + b, 0);
            avgInterval = Number((sum / deltas.length).toFixed(1));
            // HID scanners typically burst at < 35-50ms per key
            isHwBurst = avgInterval <= maxIntervalMs;
          }

          setDiagnostics({
            lastBurstIntervalAvgMs: avgInterval,
            lastBurstCharCount: capturedBarcode.length,
            detectedAsHardware: isHwBurst,
          });

          bufferRef.current = '';
          keyTimestampsRef.current = [];
          triggerScan(capturedBarcode);
        } else {
          bufferRef.current = '';
          keyTimestampsRef.current = [];
        }
        return;
      }

      // Ignore non-printable keys
      if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Delete') {
        return;
      }

      // Clear buffer if interval exceeds scanner threshold (human typing interval)
      if (interval > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = '';
        keyTimestampsRef.current = [];
      }

      // Append character to buffer and record timing
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        keyTimestampsRef.current.push(now);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [maxIntervalMs, minChars, onF9Shortcut, triggerScan]);

  return {
    isScannerReady: isListenerActive,
    isListenerActive,
    lastScanned,
    lastScanTime,
    audioEnabled: isAudioActive,
    setAudioEnabled: setIsAudioActive,
    playAudioTone,
    triggerScan,
    diagnostics,
  };
}
