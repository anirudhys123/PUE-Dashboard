import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

/* -------------------- Utility -------------------- */
const calculatePUE = (totalPower, itPower) => {
  if (!itPower || itPower === 0) return 0;
  return (totalPower / itPower).toFixed(2);
};

const formatShortDate = (date) => date.slice(0, 5);

/* -------------------- Custom Hook -------------------- */
const useReadings = () => {
  const [readings, setReadings] = useState([
    { id: 1, date: "01-01-2026", time: "00:00", totalPower: 500, itPower: 350, coolingPower: 100, otherPower: 50, temp: 68 },
    { id: 2, date: "02-01-2026", time: "04:00", totalPower: 520, itPower: 360, coolingPower: 80, otherPower: 55, temp: 70 },
    { id: 3, date: "03-01-2026", time: "08:00", totalPower: 510, itPower: 355, coolingPower: 150, otherPower: 53, temp: 69 },
    { id: 4, date: "04-01-2026", time: "12:00", totalPower: 530, itPower: 370, coolingPower: 108, otherPower: 52, temp: 71 },
    { id: 5, date: "05-01-2026", time: "16:00", totalPower: 545, itPower: 380, coolingPower: 110, otherPower: 55, temp: 72 },
  ]);

  const addReading = (reading) => {
  setReadings((prev) => [
    ...prev,
    { id: Date.now(), ...reading },
  ]);
};

const clearReadings = () => {
  if (window.confirm("Are you sure you want to delete all readings?")) {
    setReadings([]);
  }
};

return { readings, addReading, clearReadings };

};

/* -------------------- Card -------------------- */
const Card = ({ title, value }) => (
  <div className="card">
    <h4>{title}</h4>
    <h2>{value}</h2>
  </div>
);

/* -------------------- Form -------------------- */
const DataEntryForm = ({ onSubmit, onShow }) => {
  const [data, setData] = useState({
    date: "",
    time: "",
    totalPower: "",
    itPower: "",
    coolingPower: "",
    otherPower: "",
    temp: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...data,
      totalPower: +data.totalPower,
      itPower: +data.itPower,
      coolingPower: +data.coolingPower,
      otherPower: +data.otherPower,
      temp: +data.temp,
    });
    setData({
      date: "",
      time: "",
      totalPower: "",
      itPower: "",
      coolingPower: "",
      otherPower: "",
      temp: "",
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input type="date" onChange={(e) => setData({ ...data, date: e.target.value })} />
      <input type="time" onChange={(e) => setData({ ...data, time: e.target.value })} />
      <input placeholder="Total Power (kW)" type="number" onChange={(e) => setData({ ...data, totalPower: e.target.value })} />
      <input placeholder="IT Power (kW)" type="number" onChange={(e) => setData({ ...data, itPower: e.target.value })} />
      <input placeholder="Cooling Power (kW)" type="number" onChange={(e) => setData({ ...data, coolingPower: e.target.value })} />
      <input placeholder="Other Power (kW)" type="number" onChange={(e) => setData({ ...data, otherPower: e.target.value })} />
      <input placeholder="Temperature (°F)" type="number" onChange={(e) => setData({ ...data, temp: e.target.value })} />
      <button type="submit">Add Reading</button>
      <button type="button" onClick={onShow}>Show Readings</button>
    </form>
  );
};

/* -------------------- Dashboard -------------------- */
export default function Dashboard() {
  const { readings, addReading, clearReadings } = useReadings();
  const [showModal, setShowModal] = useState(false);
  const isMobile = window.innerWidth < 768;

  const latest = readings[readings.length - 1];

  const avgPUE =
    readings.reduce((s, r) => s + +calculatePUE(r.totalPower, r.itPower), 0) /
    readings.length;

  const chartData = readings.map((r) => ({
    date: r.date,
    time: r.time,
    "IT Load": r.itPower,
    Cooling: r.coolingPower,
    "Total Power": r.totalPower,
    Other: r.otherPower,
    PUE: calculatePUE(r.totalPower, r.itPower),
  }));

  const xAxisProps = {
    dataKey: "date",
    interval: 0,
    tickFormatter: formatShortDate,
    tick: {
      fill: "#fff",
      fontSize: isMobile ? 10 : 11,
      angle: isMobile ? 0 : -25,
      textAnchor: "middle",
    },
    axisLine: { stroke: "#fff" },
    tickLine: { stroke: "#fff" },
  };

  const yAxisProps = {
    stroke: "#fff",
    tick: { fill: "#fff", fontSize: 11 },
    axisLine: { stroke: "#fff" },
    tickLine: { stroke: "#fff" },
  };

  return (
    <div className="container">
      <style>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #020617, #0f172a);
          padding: 20px;
          color: #fff;
          overflow-x: hidden;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .card {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          padding: 16px;
          border-radius: 14px;
        }
        .form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 30px;
        }
        .form input {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #020617;
          color: #fff;
        }
        .form button {
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          cursor: pointer;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .charts-grid { grid-template-columns: 1fr; }
        }
        .chart-box {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          padding: 16px;
          border-radius: 14px;
        }
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: #020617;
          padding: 20px;
          border-radius: 12px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #334155;
          padding: 8px;
          text-align: center;
        }
        th { background: #1e293b; }
        .modal-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }
      `}</style>

      <h1>⚡ Data Center PUE Dashboard</h1>

      <div className="grid">
        <Card title="Current PUE" value={calculatePUE(latest.totalPower, latest.itPower)} />
        <Card title="Total Power (kW)" value={latest.totalPower} />
        <Card title="IT Load (kW)" value={latest.itPower} />
        <Card title="Average PUE" value={avgPUE.toFixed(2)} />
      </div>

      <DataEntryForm onSubmit={addReading} onShow={() => setShowModal(true)} />

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>📋 All Readings</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Time</th><th>Total</th><th>IT</th>
                  <th>Cooling</th><th>Other</th><th>Temp</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.time}</td>
                    <td>{r.totalPower}</td>
                    <td>{r.itPower}</td>
                    <td>{r.coolingPower}</td>
                    <td>{r.otherPower}</td>
                    <td>{r.temp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button onClick={clearReadings}>🗑 Delete All</button>
              <button onClick={() => setShowModal(false)}>❌ Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- CHARTS ---------- */}
      <div className="charts-grid">
        {/* IT vs Cooling */}
        <ChartBox title="📈 IT vs Cooling" height={isMobile ? 230 : 300}>
          <AreaChart data={chartData}>
            <CartesianGrid stroke="#334155" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip contentStyle={{ background: "#020617", color: "#fff" }} />
            {!isMobile && <Legend />}
            <Area dataKey="IT Load" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            <Area dataKey="Cooling" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        </ChartBox>

        {/* Total vs IT */}
        <ChartBox title="🔌 Total vs IT" height={isMobile ? 230 : 300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#334155" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip contentStyle={{ background: "#020617", color: "#fff" }} />
            {!isMobile && <Legend />}
            <Line dataKey="Total Power" stroke="#f97316" />
            <Line dataKey="IT Load" stroke="#3b82f6" />
          </LineChart>
        </ChartBox>

        {/* PUE */}
        <ChartBox title="📊 PUE Trend" height={isMobile ? 230 : 300}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#334155" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip contentStyle={{ background: "#020617", color: "#fff" }} />
            <Line dataKey="PUE" stroke="#22c55e" />
          </LineChart>
        </ChartBox>

        {/* Cooling vs Other */}
        <ChartBox title="⚙ Cooling vs Other" height={isMobile ? 230 : 300}>
          <BarChart data={chartData}>
            <CartesianGrid stroke="#334155" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip contentStyle={{ background: "#020617", color: "#fff" }} />
            {!isMobile && <Legend />}
            <Bar dataKey="Cooling" fill="#10b981" />
            <Bar dataKey="Other" fill="#6366f1" />
          </BarChart>
        </ChartBox>
      </div>
    </div>
  );
}

/* -------------------- Chart Wrapper -------------------- */
const ChartBox = ({ title, children, height }) => (
  <div className="chart-box">
    <h3>{title}</h3>
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  </div>
);
