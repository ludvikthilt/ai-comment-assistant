import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';
import type { DailyActivity } from '@/types';

interface ActivityChartProps {
  data: DailyActivity[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: '100%' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Activité journalière
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1877F2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#42B72A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#42B72A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="comments"
              name="Commentaires"
              stroke="#1877F2"
              fillOpacity={1}
              fill="url(#colorComments)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="questions"
              name="Questions"
              stroke="#42B72A"
              fillOpacity={1}
              fill="url(#colorQuestions)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="responses"
              name="Réponses"
              stroke="#ff9800"
              fillOpacity={1}
              fill="url(#colorResponses)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
