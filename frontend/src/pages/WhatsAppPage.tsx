import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Pagination,
} from '@mui/material';
import { DashboardLayout } from '@/components/layout';
import { whatsappService } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/utils';

export default function WhatsAppPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['whatsapp-notifications', page], queryFn: () => whatsappService.getNotifications({ page, limit: 20 }) });
  const notifications = data?.data || [];
  const totalPages = Math.ceil((data?.count || 0) / 20);

  const getStatusColor = (status: string) => {
    switch (status) { case 'sent': return '#2196f3'; case 'delivered': return '#ff9800'; case 'read': return '#4caf50'; case 'replied': return '#9c27b0'; default: return '#9e9e9e'; }
  };

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Notifications WhatsApp</Typography>
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow><TableCell>ID Message</TableCell><TableCell>Commentaire</TableCell><TableCell>Réponse proposée</TableCell><TableCell>Statut</TableCell><TableCell>Envoyé le</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notif: any) => (
                <TableRow key={notif.id} hover>
                  <TableCell><Typography variant="body2" fontFamily="monospace">{notif.message_id?.substring(0, 20)}...</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 250 }} noWrap>{notif.generated_responses?.comments?.content}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 250 }} noWrap>{notif.generated_responses?.proposed_response}</Typography></TableCell>
                  <TableCell>
                    <Chip label={notif.status} size="small" sx={{ bgcolor: `${getStatusColor(notif.status)}15`, color: getStatusColor(notif.status), fontWeight: 600, textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>{formatDate(notif.sent_at)}</TableCell>
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
