'use client';

import React from 'react';

export interface AnnouncementBarData {
  type: 'announcement-bar';
  text: string;
  backgroundColor?: string;
  textColor?: string;
  linkText?: string;
  linkUrl?: string;
}

interface AnnouncementBarProps {
  data: AnnouncementBarData;
  isPreview?: boolean;
}

export function AnnouncementBar({ data, isPreview = false }: AnnouncementBarProps) {
  const bgColor = data.backgroundColor || '#95be61';
  const textColor = data.textColor || '#ffffff';

  return (
    <div
      className="py-2 px-4 text-center text-sm font-medium"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <span>{data.text}</span>
      {data.linkText && data.linkUrl && (
        <>
          {' '}
          <a
            href={isPreview ? '#' : data.linkUrl}
            className="underline hover:opacity-80"
            onClick={(e) => isPreview && e.preventDefault()}
          >
            {data.linkText}
          </a>
        </>
      )}
    </div>
  );
}
