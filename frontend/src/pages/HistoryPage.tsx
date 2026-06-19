import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Pagination,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout';
import { commentsService } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { formatDate, getSentimentColor, getSentimentLabel } from '@/utils';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['history', page], queryFn: () => commentsService.getComments({ page, limit: 20 }) });
  const comments = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Historique complet</Typography>
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow><TableCell>Commentaire</TableCell><TableCell>Analyse</TableCell><TableCell>Template</TableCell><TableCell>Réponse finale</TableCell><TableCell>Date</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment: any) => (
                <TableRow key={comment.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{comment.author_name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }} noWrap>{comment.content}</Typography>
                  </TableCell>
                  <TableCell>
                    {comment.sentiment && <Chip label={`${getSentimentLabel(comment.sentiment)} ${Math.round((comment.sentiment_confidence || 0) * 100)}%`} size="small" sx={{ bgcolor: `${getSentimentColor(comment.sentiment)}15`, color: getSentimentColor(comment.sentiment) }} />}
                    {comment.is_question && <Chip label={`Question ${Math.round((comment.question_confidence || 0) * 100)}%`} size="small" color="info" sx={{ ml: 0.5 }} />}
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{comment.generated_responses?.[0]?.response_templates?.category || '-'}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>{comment.facebook_replies?.[0]?.content || '-'}</Typography></TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{formatDate(comment.created_at)}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      </Card>
    </DashboardLayout>
  );
}
