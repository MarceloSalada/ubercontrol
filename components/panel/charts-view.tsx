"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartsViewProps = {
  history: Array<{
    label: string;
    lucro: number;
    reserva: number;
  }>;
};

export function ChartsView({ history }: ChartsViewProps) {
  return (
    <section className="panel-card">
      <h2 className="section-title">Lucro x reserva</h2>
      <div className="panel-chart-wrap compact">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              name="Lucro"
            />
            <Line
              type="monotone"
              dataKey="reserva"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 2 }}
              name="Reserva"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
