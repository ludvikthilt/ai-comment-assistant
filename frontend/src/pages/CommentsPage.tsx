import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  TextField, MenuItem, Pagination, InputAdornment, Avatar,
  Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon, ThumbUp as LikeIcon,
  Visibility as ViewIcon,
  SentimentSatisfied as PositiveIcon,
  SentimentDissatisfied as NegativeIcon,
  SentimentNeutral as NeutralIcon,
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout';
import { useComments } from '@/hooks';
import { getSentimentColor, getSentimentLabel, getStatusColor, getStatusLabel, formatDate } from '@/utils';

export default function CommentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [selectedComment, setSelectedComment] = useState<any>(null);

  const { comments, totalCount, isLoading } = useComments({
    page, limit: 20,
    status: statusFilter || undefined,
    sentiment: sentimentFilter || undefined,
    search: search || undefined,
  });

  const totalPages = Math.ceil((totalCount || 0) / 20);

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Commentaires</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 250 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          <TextField select label="Statut" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" sx={{ minWidth: 150 }}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="analyzed">Analysé</MenuItem>
            <MenuItem value="responded">Répondu</MenuItem>
            <MenuItem value="published">Publié</MenuItem>
            <MenuItem value="ignored">Ignoré</MenuItem>
          </TextField>
          <TextField select label="Sentiment" value={sentimentFilter} onChange={(e) => setSentimentFilter(e.target.value)} size="small" sx={{ minWidth: 150 }}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="positive">Positif</MenuItem>
            <MenuItem value="negative">Négatif</MenuItem>
            <MenuItem value="neutral">Neutre</MenuItem>
          </TextField>
        </CardContent>
      </Card>
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Auteur</TableCell>
                <TableCell>Commentaire</TableCell>
                <TableCell>Sentiment</TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{comment.author_name?.charAt(0)}</Avatar>
                      <Typography variant="body2" fontWeight={600}>{comment.author_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>{comment.content}</Typography></TableCell>
                  <TableCell>
                    {comment.sentiment && (
                      <Chip icon={comment.sentiment === 'positive' ? <PositiveIcon /> : comment.sentiment === 'negative' ? <NegativeIcon /> : <NeutralIcon />}
                        label={`${getSentimentLabel(comment.sentiment)} (${Math.round((comment.sentiment_confidence || 0) * 100)}%)`}
                        size="small" sx={{ bgcolor: `${getSentimentColor(comment.sentiment)}15`, color: getSentimentColor(comment.sentiment), fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell>{comment.is_question && <Chip label="Oui" size="small" color="info" />}</TableCell>
                  <TableCell>
                    <Chip label={getStatusLabel(comment.status)} size="small"
                      sx={{ bgcolor: `${getStatusColor(comment.status)}15`, color: getStatusColor(comment.status), fontWeight: 600 }} />
                  </TableCell>
                  <TableCell><Typography variant="caption" color="text.secondary">{formatDate(comment.created_at)}</Typography></TableCell>
                  <TableCell>
                    <Tooltip title="Voir détails"><IconButton size="small" onClick={() => setSelectedComment(comment)}><ViewIcon /></IconButton></Tooltip>
                    {comment.auto_liked && <Tooltip title="Like automatique"><IconButton size="small" color="primary"><LikeIcon /></IconButton></Tooltip>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      </Card>
      <Dialog open={!!selectedComment} onClose={() => setSelectedComment(null)} maxWidth="md" fullWidth>
        <DialogTitle>Détail du commentaire</DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Auteur:</strong> {selectedComment.author_name}</Typography>
              <Typography><strong>Contenu:</strong> {selectedComment.content}</Typography>
              <Typography><strong>Sentiment:</strong> {selectedComment.sentiment} ({Math.round((selectedComment.sentiment_confidence || 0) * 100)}%)</Typography>
              <Typography><strong>Question:</strong> {selectedComment.is_question ? 'Oui' : 'Non'}</Typography>
              <Typography><strong>Statut:</strong> {getStatusLabel(selectedComment.status)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedComment(null)}>Fermer</Button></DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
