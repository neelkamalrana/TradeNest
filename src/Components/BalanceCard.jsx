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
    <div className="balance-card">
      <div className="balance-icon">
        <i className="fa-solid fa-wallet"></i>
      </div>
      <div className="balance-text">
        <div className="balance-title">Available Balance</div>
        <div className="balance-amount">{formatCurrency(balance)}</div>
      </div>
    </div>
  );
}

