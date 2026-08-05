'use client';

interface DateFormatterProps {
  isoString: string;
  showTime?: boolean;
}


//with the ISO string sent, convert it into an easier, readable format
export default function DateFormatter({ isoString, showTime = false }: DateFormatterProps) {
  //if nothing exists, respond with N/A
  if (!isoString) return <span className="text-zinc-400">N/A</span>;

  const dateObj = new Date(isoString);

  //if getTime doesn't return a valid object, we say it is invalid
  if (isNaN(dateObj.getTime())) {
    return <span className="text-zinc-400">Invalid Date</span>;
  }

  //parse and return
  const formatted = dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(showTime && { hour: 'numeric', minute: '2-digit', hour12: true })
  });

  return <span className="text-zinc-700 dark:text-zinc-100 font-medium">{formatted}</span>;
}