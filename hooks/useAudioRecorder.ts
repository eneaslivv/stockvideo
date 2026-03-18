'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioInterpretation } from '@/types';

type RecorderState = 'idle' | 'recording' | 'processing' | 'result' | 'error';

interface UseAudioRecorderReturn {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  result: AudioInterpretation | null;
  transcription: string | null;
  error: string | null;
  waveformData: number[];
  duration: number;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle');
  const [result, setResult] = useState<AudioInterpretation | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(30).fill(0));
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    analyserRef.current = null;
  }, []);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const bars = 30;
    const step = Math.floor(dataArray.length / bars);
    const newData = Array.from({ length: bars }, (_, i) => {
      const value = dataArray[i * step] / 255;
      return Math.max(0.05, value);
    });

    setWaveformData(newData);
    animationRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      setTranscription(null);
      setDuration(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(100);
      setState('recording');

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      updateWaveform();
    } catch (err) {
      setError('No se pudo acceder al micrófono');
      setState('error');
    }
  }, [updateWaveform]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || state !== 'recording') return;

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        setState('processing');
        cleanup();

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          // Step 1: Transcribe
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const transcribeRes = await fetch('/api/audio/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!transcribeRes.ok) throw new Error('Transcription failed');

          const { text } = await transcribeRes.json();
          setTranscription(text);

          // Step 2: Interpret
          const interpretRes = await fetch('/api/audio/interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, products: [] }),
          });

          if (!interpretRes.ok) throw new Error('Interpretation failed');

          const interpretation = await interpretRes.json();
          setResult(interpretation);
          setState('result');
        } catch (err) {
          setError('Error procesando el audio');
          setState('error');
        }

        resolve();
      };

      mediaRecorderRef.current!.stop();
    });
  }, [state, cleanup]);

  const cancelRecording = useCallback(() => {
    cleanup();
    setState('idle');
    setWaveformData(new Array(30).fill(0));
    setDuration(0);
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    state,
    startRecording,
    stopRecording,
    cancelRecording,
    result,
    transcription,
    error,
    waveformData,
    duration,
  };
}
