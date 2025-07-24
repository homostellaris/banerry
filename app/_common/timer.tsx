"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Play, Pause, Square, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type TimerState = "idle" | "running" | "paused" | "completed";

export default function Timer() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [state, setState] = useState<TimerState>("idle");

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (state === "idle") {
      const total = minutes * 60 + seconds;
      if (total === 0) return;
      setTotalTime(total);
      setTimeLeft(total);
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

  const playCompletionSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create a fun celebration sound with ascending notes
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = "triangle"; // Softer, more pleasant sound
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play a cheerful ascending melody: C - E - G - C (major chord arpeggio)
      const now = audioContext.currentTime;
      playNote(523, now, 0.3); // C5
      playNote(659, now + 0.15, 0.3); // E5
      playNote(784, now + 0.3, 0.3); // G5
      playNote(1047, now + 0.45, 0.5); // C6 (longer final note)

      // Add a little "sparkle" with higher notes
      setTimeout(() => {
        playNote(1319, now + 0.7, 0.2); // E6
        playNote(1568, now + 0.8, 0.2); // G6
      }, 700);

    } catch (error) {
      console.log("Audio not supported");
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === "running" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setState("completed");
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, timeLeft, playCompletionSound]);

  const progress =
    totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const getTimerColor = () => {
    if (state === "completed") return "text-green-600";
    if (state === "running") return "text-blue-600";
    if (state === "paused") return "text-yellow-600";
    return "text-purple-700";
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timer Display */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div
                className={`text-8xl font-bold font-mono ${getTimerColor()}`}
              >
                {state === "idle"
                  ? formatTime(minutes * 60 + seconds)
                  : formatTime(timeLeft)}
              </div>

              {state !== "idle" && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-4" />
                  <div className="text-sm text-gray-500">
                    {totalTime > 0 && `${Math.round(progress)}% complete`}
                  </div>
                </div>
              )}

              {state === "completed" && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-800">
                    <Volume2 className="h-5 w-5" />
                    <span className="text-lg font-semibold">Time's Up! 🎉</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timer Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Set Timer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seconds">Seconds</Label>
                <Input
                  id="seconds"
                  type="number"
                  min="0"
                  max="300"
                  value={seconds}
                  onChange={(e) =>
                    setSeconds(
                      Math.max(0, Math.min(300, parseInt(e.target.value) || 0))
                    )
                  }
                  disabled={state !== "idle"}
                  className="text-lg text-center"
                />
              </div>
              <div>
                <Label htmlFor="minutes">Minutes (optional)</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="10"
                  value={minutes}
                  onChange={(e) =>
                    setMinutes(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  disabled={state !== "idle"}
                  className="text-lg text-center"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {state === "idle" && (
                <Button
                  onClick={startTimer}
                  disabled={minutes === 0 && seconds === 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              )}

              {state === "running" && (
                <Button
                  onClick={pauseTimer}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="lg"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}

              {state === "paused" && (
                <Button
                  onClick={startTimer}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}

              {(state === "running" || state === "paused") && (
                <Button onClick={stopTimer} variant="destructive" size="lg">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}

              <Button onClick={resetTimer} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preset Timers */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Timers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setPresetTimer(0, 5)}
                disabled={state !== "idle"}
                variant="outline"
                className="h-12 text-lg"
              >
                5 sec
              </Button>
              <Button
                onClick={() => setPresetTimer(0, 10)}
                disabled={state !== "idle"}
                variant="outline"
                className="h-12 text-lg"
              >
                10 sec
              </Button>
              <Button
                onClick={() => setPresetTimer(0, 20)}
                disabled={state !== "idle"}
                variant="outline"
                className="h-12 text-lg"
              >
                20 sec
              </Button>
              <Button
                onClick={() => setPresetTimer(0, 30)}
                disabled={state !== "idle"}
                variant="outline"
                className="h-12 text-lg"
              >
                30 sec
              </Button>
              <Button
                onClick={() => setPresetTimer(1, 0)}
                disabled={state !== "idle"}
                variant="outline"
                className="h-12 text-lg"
              >
                1 min
              </Button>
              <Button
                onClick={() => setPresetTimer(2, 0)}
                disabled={state !== "idle"}
                variant="outline"
                className="h-12 text-lg"
              >
                2 min
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
