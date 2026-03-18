export function RiskNotice() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
      <p className="font-semibold">Good to know</p>
      <p className="mt-1 text-amber-400/80">
        Your savings are stored securely on the blockchain. Interest rates can
        change and aren&apos;t guaranteed. You control your account and approve
        every action. Withdrawals may take up to 24 hours if funds are being
        rebalanced.
      </p>
    </div>
  );
}
