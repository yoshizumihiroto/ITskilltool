'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface SkillData {
  category: string
  score: number
  fullMark: number
}

interface SkillRadarChartProps {
  data: SkillData[]
}

export default function SkillRadarChart({ data }: SkillRadarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        アセスメントデータがありません
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Radar
          name="スキルスコア"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value) => [`${value}点`, 'スコア']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
