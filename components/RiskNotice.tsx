export function RiskNotice() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
      <p className="font-semibold">Risk Notice</p>
      <p className="mt-1 text-amber-400/80">
        Deposits are executed onchain into live YO vaults. Yield is variable and
        not guaranteed. You retain full wallet control and must approve each
        transaction. Redemptions may take up to 24 hours if vault liquidity is
        limited.
      </p>
    </div>
  );
}
