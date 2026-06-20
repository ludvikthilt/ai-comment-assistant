import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';
import type { SentimentDistribution } from '@/types';

interface SentimentChartProps {
  data?: SentimentDistribution[];
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: '100%' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Répartition des sentiments
        </Typography>

        {!hasData ? (
          <Box
            sx={{
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              Aucune donnée disponible
              {hasData}
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || '#8884d8'}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: number) => [
                  `${value} commentaires`,
                  '',
                ]}
                contentStyle={{ borderRadius: 12 }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    positive: 'Positif',
                    negative: 'Négatif',
                    neutral: 'Neutre',
                  };
                 
                  return labels[value] || value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}