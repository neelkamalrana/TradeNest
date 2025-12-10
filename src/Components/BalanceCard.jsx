import React from "react";

function formatCurrency(v) {
  if (v == null) return "-";
  return v.toLocaleString("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function BalanceCard({ balance }) {
  return (
    <div className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6 w-fit mb-8">
      <div className="bg-slate-700 rounded-xl p-4 flex items-center justify-center">
        <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-slate-400 text-sm font-medium">Available Balance</div>
        <div className="text-green-400 text-2xl font-bold">{formatCurrency(balance)}</div>
      </div>
    </div>
  );
}

