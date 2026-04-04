"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartsViewProps = {
  bars: Array<{ name: string; value: number }>;
  pie: Array<{ name: string; value: number }>;
};

export function ChartsView({ bars, pie }: ChartsViewProps) {
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
                  <Cell key={index} fill={["#38bdf8", "#60a5fa", "#fb7185"][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
