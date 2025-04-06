
import React, { useEffect, useState } from "react";

const COINS = [
  "POPCAT", "MEW", "IO", "ARKM", "PHB", "EIGEN", "GRT",
  "ALCH", "GRIFFAIN", "AIXBT", "MOODENG", "NFP", "ID", "PENDLE", "CGPT"
];

const calculatePercent = (from, to) => (((to - from) / from) * 100).toFixed(2);
const getResult = (entry, target, stop, current) => {
  if (current >= target) return "🎯 Hedefe Ulaşıldı";
  if (current <= stop) return "🛑 Stop Oldu";
  return "⏳ Bekliyor";
};

export default function SignalPanel() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const fetchPrices = async () => {
      const updated = {};
      for (const coin of COINS) {
        try {
          const res = await fetch(`https://api.bybit.com/v2/public/tickers?symbol=${coin}USDT`);
          const data = await res.json();
          const price = parseFloat(data.result[0].last_price);
          updated[coin] = price;
        } catch {
          updated[coin] = null;
        }
      }
      setPrices(updated);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Canlı Sinyal Paneli</h1>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Coin</th><th>Fiyat</th><th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {COINS.map((coin, i) => (
            <tr key={i}>
              <td>{coin}</td>
              <td>{prices[coin] ?? "Yükleniyor..."}</td>
              <td>{prices[coin] ? getResult(1, 1.2, 0.8, prices[coin]) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
