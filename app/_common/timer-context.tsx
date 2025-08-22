"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";

type TimerState = "idle" | "running" | "paused" | "completed";
type AudioState = "unknown" | "enabled" | "blocked" | "permission-needed";

interface TimerContextType {
  // Timer configuration
  minutes: number;
  seconds: number;
  setMinutes: (minutes: number) => void;
  setSeconds: (seconds: number) => void;
  
  // Timer state
  timeLeft: number;
  totalTime: number;
  state: TimerState;
  progress: number;
  
  // Audio state
  audioState: AudioState;
  notificationPermission: NotificationPermission;
  
  // Timer controls
  startTimer: () => Promise<void>;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setPresetTimer: (mins: number, secs?: number) => void;
  
  // Audio controls
  testAudio: () => Promise<void>;
  
  // Utility functions
  formatTime: (totalSeconds: number) => string;
  getTimerColor: () => string;
  getAudioStatus: () => {
    icon: string;
    message: string;
    color: string;
  };
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [state, setState] = useState<TimerState>("idle");
  const [audioState, setAudioState] = useState<AudioState>("unknown");
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const audioContextRef = useRef<AudioContext | null>(null);

  const playCompletionSound = useCallback(async () => {
    if (!audioContextRef.current) {
      throw new Error("Audio context not initialized");
    }

    const audioContext = audioContextRef.current;

    const playNote = (
      frequency: number,
      startTime: number,
      duration: number
    ) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.type = "triangle";

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playNote(523, now, 0.3); // C5
    playNote(659, now + 0.15, 0.3); // E5
    playNote(784, now + 0.3, 0.3); // G5
    playNote(1047, now + 0.45, 0.5); // C6

    setTimeout(() => {
      playNote(1319, now + 0.7, 0.2); // E6
      playNote(1568, now + 0.8, 0.2); // G6
    }, 700);

    return Promise.resolve();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const initializeAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.01);

      setAudioState("enabled");
      return true;
    } catch (error) {
      console.log("Audio initialization failed:", error);
      setAudioState("blocked");
      return false;
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === "granted";
    }
    return false;
  }, []);

  const notifyCompletion = useCallback(async () => {
    let audioPlayed = false;

    if (audioState === "enabled" && audioContextRef.current) {
      try {
        await playCompletionSound();
        audioPlayed = true;
      } catch (error) {
        console.log("Audio playback failed:", error);
      }
    }

    if ("vibrator" in navigator || "vibrate" in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200]);
      } catch (error) {
        console.log("Vibration failed:", error);
      }
    }

    if (!audioPlayed && notificationPermission === "granted") {
      try {
        new Notification("Timer Complete!", {
          body: "Your timer has finished!",
          icon: "/favicon.ico",
          tag: "timer-complete",
        });
      } catch (error) {
        console.log("Notification failed:", error);
      }
    }
  }, [audioState, notificationPermission, playCompletionSound]);

  const startTimer = async () => {
    if (state === "idle") {
      const total = minutes * 60 + seconds;
      if (total === 0) return;
      setTotalTime(total);
      setTimeLeft(total);

      await initializeAudio();

      if (notificationPermission === "default") {
        await requestNotificationPermission();
      }
    }
    setState("running");
  };

  const pauseTimer = () => {
    setState("paused");
  };

  const stopTimer = () => {
    setState("idle");
    setTimeLeft(0);
    setTotalTime(0);
  };

  const resetTimer = () => {
    setState("idle");
    setTimeLeft(0);
    setTotalTime(0);
    setMinutes(0);
    setSeconds(10);
  };

  const setPresetTimer = (mins: number, secs: number = 0) => {
    if (state !== "idle") return;
    setMinutes(mins);
    setSeconds(secs);
  };

  const testAudio = useCallback(async () => {
    const success = await initializeAudio();
    if (success) {
      try {
        await playCompletionSound();
      } catch {
        setAudioState("blocked");
      }
    }
  }, [initializeAudio, playCompletionSound]);

  const getTimerColor = () => {
    if (state === "completed") return "text-green-600";
    if (state === "running") return "text-blue-600";
    if (state === "paused") return "text-yellow-600";
    return "text-purple-700";
  };

  const getAudioStatus = () => {
    switch (audioState) {
      case "enabled":
        return {
          icon: "Volume2",
          message: "Audio enabled",
          color: "text-green-600",
        };
      case "blocked":
        return {
          icon: "VolumeX",
          message: "Audio blocked",
          color: "text-red-600",
        };
      case "permission-needed":
        return {
          icon: "Bell",
          message: "Audio permission needed",
          color: "text-yellow-600",
        };
      default:
        return {
          icon: "Volume2",
          message: "Audio status unknown",
          color: "text-gray-500",
        };
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setState("completed");
            notifyCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, timeLeft, notifyCompletion]);

  // Initialize notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Load saved timer state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("timer-state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.minutes !== undefined) setMinutes(parsed.minutes);
        if (parsed.seconds !== undefined) setSeconds(parsed.seconds);
      } catch (error) {
        console.log("Failed to load saved timer state:", error);
      }
    }
  }, []);

  // Save timer configuration to localStorage
  useEffect(() => {
    const stateToSave = { minutes, seconds };
    localStorage.setItem("timer-state", JSON.stringify(stateToSave));
  }, [minutes, seconds]);

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const value: TimerContextType = {
    minutes,
    seconds,
    setMinutes,
    setSeconds,
    timeLeft,
    totalTime,
    state,
    progress,
    audioState,
    notificationPermission,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    setPresetTimer,
    testAudio,
    formatTime,
    getTimerColor,
    getAudioStatus,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}