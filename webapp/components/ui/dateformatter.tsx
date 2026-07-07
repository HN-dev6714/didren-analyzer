'use client';

interface DateFormatterProps {
  isoString: string;
  showTime?: boolean;
}

export default function DateFormatter({ isoString, showTime = false }: DateFormatterProps) {
  if (!isoString) return <span className="text-zinc-400">N/A</span>;

  const dateObj = new Date(isoString);

  // Fallback check if the string passing through is corrupted/invalid
  if (isNaN(dateObj.getTime())) {
    return <span className="text-zinc-400">Invalid Date</span>;
  }

  const formatted = dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(showTime && { hour: 'numeric', minute: '2-digit', hour12: true })
  });

  return <span className="text-zinc-700 font-medium">{formatted}</span>;
}