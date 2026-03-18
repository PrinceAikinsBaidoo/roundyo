"use client";

import { useEffect, useState } from "react";
import { Goal, getGoalProgress } from "@/lib/goals";
import { formatUSD } from "@/lib/format";

interface Props {
  goal: Goal;
  onClose: () => void;
}

function buildShareUrl(goal: Goal): string {
  const encoded = btoa(encodeURIComponent(JSON.stringify(goal)));
  return `${window.location.origin}/goals/shared?g=${encoded}`;
}

const SOCIALS = [
  {
    label: "X / Twitter",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.902-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black hover:bg-zinc-800",
    href: (url: string, goal: Goal) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm saving ${formatUSD(goal.currentAmount)} toward my ${goal.emoji} ${goal.name} goal on RoundYO. Check my progress!`)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "Telegram",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: "bg-sky-500 hover:bg-sky-400",
    href: (url: string, goal: Goal) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${goal.emoji} ${goal.name} — ${formatUSD(goal.currentAmount)} saved so far!`)}`,
  },
  {
    label: "WhatsApp",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
    color: "bg-green-500 hover:bg-green-400",
    href: (url: string, goal: Goal) =>
      `https://wa.me/?text=${encodeURIComponent(`${goal.emoji} ${goal.name} — I'm saving ${formatUSD(goal.currentAmount)} of ${formatUSD(goal.targetAmount)} using RoundYO. See my progress: ${url}`)}`,
  },
  {
    label: "Warpcast",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M23.2 22.4V24h-6.4v-1.6h2.133V9.617l-6.731 12.25h-.404L5.067 9.617V22.4H7.2V24H.8v-1.6h2.133V1.6H.8V0h6.755l5.643 10.27L18.842 0H23.2v1.6h-2.133V22.4H23.2z" />
      </svg>
    ),
    color: "bg-purple-600 hover:bg-purple-500",
    href: (url: string, goal: Goal) =>
      `https://warpcast.com/~/compose?text=${encodeURIComponent(`${goal.emoji} ${goal.name} — ${formatUSD(goal.currentAmount)} saved toward ${formatUSD(goal.targetAmount)} using RoundYO onchain savings`)}&embeds[]=${encodeURIComponent(url)}`,
  },
];

export function ShareGoalModal({ goal, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const progress = getGoalProgress(goal);

  useEffect(() => {
    setUrl(buildShareUrl(goal));
  }, [goal]);

  // Close on backdrop click or Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#111127] p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Share goal</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-1.5 text-gray-400 hover:text-white transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Goal preview card */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{goal.emoji}</span>
            <div>
              <p className="font-semibold text-white">{goal.name}</p>
              <p className="text-sm text-gray-400">
                {formatUSD(goal.currentAmount)} of {formatUSD(goal.targetAmount)} saved
              </p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-500">{progress}%</p>
        </div>

        {/* Share via */}
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Share via</p>
        <div className="mb-5 grid grid-cols-4 gap-3">
          {SOCIALS.map(({ label, icon, color, href }) => (
            <a
              key={label}
              href={url ? href(url, goal) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-white transition ${color}`}
            >
              {icon}
              <span className="text-xs">{label}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Or copy link</p>
        <div className="flex gap-2">
          <div className="flex-1 truncate rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-gray-400">
            {url}
          </div>
          <button
            onClick={copy}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              copied
                ? "bg-green-500 text-white"
                : "bg-indigo-500 text-white hover:bg-indigo-400"
            }`}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          Anyone with this link can view your goal progress
        </p>
      </div>
    </div>
  );
}
