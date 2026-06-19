import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Switch,
  IconButton, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Facebook as FacebookIcon } from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout';
import { facebookService } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function FacebookPagesPage() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ page_id: '', page_name: '', page_access_token: '' });

  const { data: pages, isLoading } = useQuery({ queryKey: ['facebook-pages'], queryFn: () => facebookService.getPages() });
  const createMutation = useMutation({ mutationFn: facebookService.createPage, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facebook-pages'] }) });
  const deleteMutation = useMutation({ mutationFn: facebookService.deletePage, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facebook-pages'] }) });

  const handleSubmit = async () => {
    await createMutation.mutateAsync(formData);
    setOpenDialog(false);
    setFormData({ page_id: '', page_name: '', page_access_token: '' });
  };

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Pages Facebook</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>Ajouter une page</Button>
      </Box>
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow><TableCell>Page</TableCell><TableCell>Page ID</TableCell><TableCell>Statut</TableCell><TableCell>Ajoutée le</TableCell><TableCell>Actions</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {pages?.map((page: any) => (
                <TableRow key={page.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FacebookIcon color="primary" />
                      <Typography fontWeight={600}>{page.page_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" fontFamily="monospace">{page.page_id}</Typography></TableCell>
                  <TableCell><Switch checked={page.is_active} disabled /></TableCell>
                  <TableCell>{new Date(page.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <Tooltip title="Supprimer"><IconButton size="small" color="error" onClick={() => deleteMutation.mutate(page.id)}><DeleteIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Ajouter une page Facebook</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
            <TextField label="Nom de la page" value={formData.page_name} onChange={(e) => setFormData({...formData, page_name: e.target.value})} fullWidth required />
            <TextField label="Page ID" value={formData.page_id} onChange={(e) => setFormData({...formData, page_id: e.target.value})} fullWidth required />
            <TextField label="Page Access Token" value={formData.page_access_token} onChange={(e) => setFormData({...formData, page_access_token: e.target.value})} fullWidth required type="password" />
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenDialog(false)}>Annuler</Button><Button variant="contained" onClick={handleSubmit}>Ajouter</Button></DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
