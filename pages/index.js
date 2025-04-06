import { useEffect, useState } from "react";

const initialSignals = [
  {
    coin: "POPCAT",
    entry: 0.00210,
    target: 0.00240,
    stop: 0.00200,
    date: "2025-04-06 14:30:00"
  },
  {
    coin: "MEW",
    entry: 0.0135,
    target: 0.0150,
    stop: 0.0130,
    date: "2025-04-06 14:31:00"
  },
  {
    coin: "IO",
    entry: 4.10,
    target: 4.60,
    stop: 3.90,
    date: "2025-04-06 14:32:00"
  }
];

const calculatePercent = (from, to) => (((to - from) / from) * 100).toFixed(2);
const getResult = (signal, current) => {
  if (current >= signal.target) return "🎯 Hedefe Ulaşıldı";
  if (current <= signal.stop) return "🛑 Stop Oldu";
  return "⏳ Bekliyor";
};

export default function SignalTable() {
  const [signals, setSignals] = useState([]);
  const [stats, setStats] = useState({ total: 0, win: 0, stop: 0 });

  useEffect(() => {
    const fetchPrices = async () => {
      const updatedSignals = await Promise.all(
        initialSignals.map(async (signal) => {
          try {
            const symbol = signal.coin + "USDT";
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
            const data = await res.json();
            const current = parseFloat(data.price);
            const result = getResult(signal, current);
            return { ...signal, current, result };
          } catch {
            return { ...signal, current: null, result: "-" };
          }
        })
      );
      setSignals(updatedSignals);

      const win = updatedSignals.filter(s => s.result === "🎯 Hedefe Ulaşıldı").length;
      const stop = updatedSignals.filter(s => s.result === "🛑 Stop Oldu").length;
      const total = updatedSignals.length;
      setStats({ total, win, stop });
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📊 Alım Sinyalleri Paneli</h1>

      <div className="mb-6 grid grid-cols-3 gap-4 text-center text-white">
        <div className="bg-green-500 p-4 rounded-xl shadow">Toplam Sinyal: {stats.total}</div>
        <div className="bg-blue-500 p-4 rounded-xl shadow">Başarılı: {stats.win}</div>
        <div className="bg-red-500 p-4 rounded-xl shadow">Stop: {stats.stop}</div>
      </div>

      <div className="overflow-x-auto shadow-lg rounded-2xl">
        <table className="w-full text-sm text-gray-800 bg-white rounded-lg overflow-hidden">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-3 text-left">Coin</th>
              <th className="p-3 text-left">Giriş</th>
              <th className="p-3 text-left">Hedef</th>
              <th className="p-3 text-left">Stop</th>
              <th className="p-3 text-left">Kar (%)</th>
              <th className="p-3 text-left">Sonuç</th>
              <th className="p-3 text-left">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s, i) => (
              <tr key={i} className="border-b">
                <td className="p-2 font-medium">{s.coin}</td>
                <td className="p-2">{s.entry}</td>
                <td className="p-2">{s.target}</td>
                <td className="p-2">{s.stop}</td>
                <td className="p-2">{s.current ? calculatePercent(s.entry, s.current) + "%" : "-"}</td>
                <td className="p-2">{s.result}</td>
                <td className="p-2 text-sm">{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}