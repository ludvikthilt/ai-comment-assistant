import { useEffect } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import {
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  QuestionAnswer as QuestionIcon,
  Reply as ReplyIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentDissatisfied as NegativeIcon,
  SentimentNeutral as NeutralIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useDashboard, useRealtimeComments } from '@/hooks';
import { useDashboardStore } from '@/stores';
import { DashboardLayout } from '@/components/layout';
import { KPICard, SentimentChart, ActivityChart, RecentComments } from '@/components/dashboard';

export default function DashboardPage() {
  const { kpis, sentimentDistribution, dailyActivity, recentActivity, isLoading } = useDashboard();
  const { refreshAll } = useDashboardStore();
  useRealtimeComments();

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Total Commentaires"
            value={kpis?.total_comments || 0}
            icon={<CommentIcon />}
            color="#1877F2"
            trend={12}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Positifs"
            value={kpis?.positive_comments || 0}
            icon={<PositiveIcon />}
            color="#4caf50"
            trend={8}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Négatifs"
            value={kpis?.negative_comments || 0}
            icon={<NegativeIcon />}
            color="#f44336"
            trend={-3}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Questions"
            value={kpis?.questions || 0}
            icon={<QuestionIcon />}
            color="#ff9800"
            trend={15}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Likes envoyés"
            value={kpis?.likes_sent || 0}
            icon={<ThumbUpIcon />}
            color="#2196f3"
            subtitle="Automatique"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Réponses publiées"
            value={kpis?.responses_published || 0}
            icon={<ReplyIcon />}
            color="#9c27b0"
            subtitle="Via WhatsApp"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Neutres"
            value={kpis?.neutral_comments || 0}
            icon={<NeutralIcon />}
            color="#9e9e9e"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KPICard
            title="Délai moyen"
            value={`${Math.round(kpis?.avg_response_time_minutes || 0)} min`}
            icon={<TimeIcon />}
            color="#607d8b"
            subtitle="Réponse → Publication"
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ActivityChart data={dailyActivity} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SentimentChart data={sentimentDistribution} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <RecentComments comments={[]} />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
