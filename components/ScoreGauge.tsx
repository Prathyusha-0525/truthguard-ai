import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { RiskLevel } from '../types';

interface ScoreGaugeProps {
  score: number;
  riskLevel: RiskLevel;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, riskLevel }) => {
  // Data for the gauge (background track and value)
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  let color = '#10B981'; // Green for SAFE
  if (riskLevel === RiskLevel.SUSPICIOUS) color = '#F59E0B'; // Amber for SUSPICIOUS
  if (riskLevel === RiskLevel.HIGH_RISK) color = '#EF4444'; // Red for HIGH_RISK

  const cx = "50%";
  const cy = "70%";
  const iR = 60;
  const oR = 80;

  return (
    <div className="w-full h-48 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={iR}
            outerRadius={oR}
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-5 flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">Fake Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
