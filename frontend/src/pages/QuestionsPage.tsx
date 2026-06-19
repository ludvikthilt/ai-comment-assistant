import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Tooltip, Pagination,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout';
import { useQuestions } from '@/hooks';
import { formatDate, getStatusLabel, getStatusColor } from '@/utils';

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const { questions, totalCount, isLoading } = useQuestions({ page, limit: 20 });
  const totalPages = Math.ceil((totalCount || 0) / 20);

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Questions détectées</Typography>
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow><TableCell>Auteur</TableCell><TableCell>Question</TableCell><TableCell>Confiance</TableCell><TableCell>Statut</TableCell><TableCell>Date</TableCell><TableCell>Actions</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{question.author_name}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 400 }}>{question.content}</Typography></TableCell>
                  <TableCell><Chip label={`${Math.round((question.question_confidence || 0) * 100)}%`} size="small" color="info" /></TableCell>
                  <TableCell><Chip label={getStatusLabel(question.status)} size="small" sx={{ bgcolor: `${getStatusColor(question.status)}15`, color: getStatusColor(question.status), fontWeight: 600 }} /></TableCell>
                  <TableCell>{formatDate(question.created_at)}</TableCell>
                  <TableCell><Tooltip title="Voir"><IconButton size="small"><ViewIcon /></IconButton></Tooltip></TableCell>
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
