"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartsViewProps = {
  bars: Array<{ name: string; value: number }>;
  pie: Array<{ name: string; value: number }>;
  history: Array<{
    label: string;
    lucro: number;
    reserva: number;
    aportes: number;
    gastos: number;
  }>;
};

export function ChartsView({ bars, pie, history }: ChartsViewProps) {
  return (
    <div className="panel-grid-2">
      <section className="panel-card">
        <h2 className="section-title">Receita x custos</h2>
        <div className="panel-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card">
        <h2 className="section-title">Composição</h2>
        <div className="panel-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} label>
                {pie.map((_, index) => (
                  <Cell key={index} fill={["#38bdf8", "#60a5fa", "#22c55e", "#fb7185"][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card" style={{ gridColumn: "1 / -1" }}>
        <h2 className="section-title">Histórico: lucro x reserva acumulada</h2>
        <div className="panel-chart-wrap">
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
                strokeWidth={3}
                dot={{ r: 3 }}
                name="Lucro"
              />
              <Line
                type="monotone"
                dataKey="reserva"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 3 }}
                name="Reserva acumulada"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel-card" style={{ gridColumn: "1 / -1" }}>
        <h2 className="section-title">Histórico: aportes x gastos da reserva</h2>
        <div className="panel-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="aportes" fill="#22c55e" radius={[8, 8, 0, 0]} name="Aportes" />
              <Bar dataKey="gastos" fill="#fb7185" radius={[8, 8, 0, 0]} name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
