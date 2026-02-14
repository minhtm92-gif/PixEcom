'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { Clock } from 'lucide-react';
import type { SectionPreviewProps } from './types';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft {
  const difference = new Date(endDate).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function TimeUnit({
  value,
  label,
  textColor,
}: {
  value: number;
  label: string;
  textColor: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center',
          'rounded-xl bg-white/15 backdrop-blur-sm',
          'shadow-lg'
        )}
      >
        <span
          className="text-2xl sm:text-3xl font-bold tabular-nums"
          style={{ color: textColor }}
        >
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span
        className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider opacity-80"
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ config }: SectionPreviewProps) {
  const title = (config.title as string) || 'Limited Time Offer';
  const endDate = config.endDate as string | undefined;
  const backgroundColor = (config.backgroundColor as string) || '#212529';
  const textColor = (config.textColor as string) || '#ffffff';

  // Default to 24 hours from now if no endDate provided
  const targetDate = useRef(
    endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  );

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate.current)
  );

  useEffect(() => {
    if (endDate) {
      targetDate.current = endDate;
    }
  }, [endDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate.current));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  return (
    <section
      className="w-full py-10 sm:py-12 md:py-16"
      style={{ backgroundColor }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Clock className="h-6 w-6" style={{ color: textColor }} />
        </div>

        {/* Title */}
        <h2
          className="mb-8 text-xl sm:text-2xl md:text-3xl font-bold"
          style={{ color: textColor }}
        >
          {title}
        </h2>

        {/* Countdown */}
        {!isExpired ? (
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <TimeUnit value={timeLeft.days} label="Days" textColor={textColor} />
            <span
              className="text-2xl sm:text-3xl font-bold mt-[-1.5rem] opacity-50"
              style={{ color: textColor }}
            >
              :
            </span>
            <TimeUnit value={timeLeft.hours} label="Hours" textColor={textColor} />
            <span
              className="text-2xl sm:text-3xl font-bold mt-[-1.5rem] opacity-50"
              style={{ color: textColor }}
            >
              :
            </span>
            <TimeUnit value={timeLeft.minutes} label="Minutes" textColor={textColor} />
            <span
              className="text-2xl sm:text-3xl font-bold mt-[-1.5rem] opacity-50"
              style={{ color: textColor }}
            >
              :
            </span>
            <TimeUnit value={timeLeft.seconds} label="Seconds" textColor={textColor} />
          </div>
        ) : (
          <div
            className="text-lg sm:text-xl font-semibold opacity-70"
            style={{ color: textColor }}
          >
            This offer has expired
          </div>
        )}
      </div>
    </section>
  );
}
