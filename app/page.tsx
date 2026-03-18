"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useVaults } from "@yo-protocol/react";
import { useDemo } from "@/context/DemoContext";

function LiveRatesStrip() {
  const { vaults } = useVaults();

  const items = ["yoUSD", "yoETH", "yoBTC", "yoEUR"].map((id) => {
    const v = vaults.find((x) => x.id.toLowerCase() === id.toLowerCase());
    const apy = v?.yield?.["30d"] ?? v?.yield?.["7d"];
    return {
      id,
      apy: apy ? `${(parseFloat(apy) * 100).toFixed(2)}%` : "—",
      tvl: v?.tvl?.formatted ?? "—",
    };
  });

  return (
    <div className="mx-auto mb-16 max-w-5xl px-4">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
        Live rates · Updated every 30 minutes
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ id, apy, tvl }) => (
          <div
            key={id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
          >
            <p className="text-xs font-bold text-gray-500">{id}</p>
            <p className="mt-1 text-2xl font-black text-green-400">{apy}</p>
            <p className="text-xs text-gray-500">annual return</p>
            <p className="mt-1 text-xs text-gray-600">{tvl} total saved</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { enterDemo } = useDemo();
  const router = useRouter();

  function handleTryDemo() {
    enterDemo();
    router.push("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a14]">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-28 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
          Powered by YO Protocol
        </div>
        <h1 className="text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
          Turn spare change into{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            real savings
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-400">
          RoundYO rounds up your purchases and saves the difference — your money
          earns interest automatically while you spend.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/setup"
            className="rounded-2xl bg-indigo-500 px-8 py-3 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 active:scale-95"
          >
            Start Saving
          </Link>
          <button
            onClick={handleTryDemo}
            className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-8 py-3 text-base font-bold text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
          >
            Try Demo
          </button>
        </div>
      </section>

      {/* Live rates */}
      <LiveRatesStrip />

      {/* How it works */}
      <section className="relative mx-auto max-w-5xl px-4 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">
          How it works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: "💳",
              title: "Enter a purchase",
              desc: "Tell RoundYO how much you spent. It calculates the round-up automatically.",
            },
            {
              step: "02",
              icon: "⚡",
              title: "Save the spare change",
              desc: "Confirm the micro-deposit. Your money goes into a savings account that earns interest.",
            },
            {
              step: "03",
              icon: "📈",
              title: "Watch it grow",
              desc: "Your savings earn real interest. Withdraw anytime back to your wallet.",
            },
          ].map(({ step, icon, title, desc }) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <p className="text-xs font-bold tracking-widest text-indigo-400">
                {step}
              </p>
              <p className="mt-2 text-3xl">{icon}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-5xl px-4 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="mb-8 text-2xl font-bold text-white">
            Everything you need
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["🔐", "You control your funds", "You approve every transaction. Your money goes directly into your account."],
              ["🎯", "Goal-based saving", "Set savings goals and track progress toward each one."],
              ["💸", "Earn while you save", "Real interest from YO Protocol — not a mock or simulation."],
              ["⚙️", "Flexible rules", "Round to the nearest $1, $5, or $10 — your choice."],
              ["🌐", "Works everywhere", "Save from Base, Ethereum, or Arbitrum. We handle the rest."],
              ["🤝", "Social goals", "Share a goal link — friends can chip in directly to help you reach it."],
            ] as [string, string, string][]).map(([icon, title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-2xl px-4 pb-32 text-center">
        <h2 className="text-3xl font-bold text-white">
          Ready to start saving?
        </h2>
        <p className="mt-3 text-gray-400">
          Connect your wallet and make your first deposit in under 2 minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/setup"
            className="rounded-2xl bg-indigo-500 px-10 py-3 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
          >
            Get Started
          </Link>
          <button
            onClick={handleTryDemo}
            className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-10 py-3 text-base font-bold text-amber-300 transition hover:bg-amber-500/20"
          >
            Try Demo
          </button>
        </div>
      </section>
    </main>
  );
}
