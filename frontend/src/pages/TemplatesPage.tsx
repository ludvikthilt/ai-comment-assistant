import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Switch, Tooltip, Pagination, InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout';
import { useTemplates } from '@/hooks';

export default function TemplatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({ category: '', keywords: '', template_text: '', priority: 5, is_active: true });

  const { templates, totalCount, isLoading, createTemplate, updateTemplate, deleteTemplate } = useTemplates({
    page, limit: 20, search: search || undefined,
  });

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({ category: '', keywords: '', template_text: '', priority: 5, is_active: true });
    setOpenDialog(true);
  };

  const handleOpenEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      category: template.category, keywords: template.keywords.join(', '),
      template_text: template.template_text, priority: template.priority, is_active: template.is_active,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    const data = { ...formData, keywords: formData.keywords.split(',').map((k) => k.trim().toLowerCase()) };
    if (editingTemplate) {
      await updateTemplate({ id: editingTemplate.id, template: data });
    } else {
      await createTemplate(data);
    }
    setOpenDialog(false);
  };

  const totalPages = Math.ceil((totalCount || 0) / 20);

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Templates de réponses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>Nouveau template</Button>
      </Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        </CardContent>
      </Card>
      <Card>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Catégorie</TableCell><TableCell>Mots-clés</TableCell><TableCell>Template</TableCell>
                <TableCell>Priorité</TableCell><TableCell>Utilisations</TableCell><TableCell>Actif</TableCell><TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell><Chip label={template.category} color="primary" size="small" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {template.keywords.map((kw) => <Chip key={kw} label={kw} size="small" variant="outlined" />)}
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>{template.template_text}</Typography></TableCell>
                  <TableCell><Chip label={template.priority} size="small" /></TableCell>
                  <TableCell>{template.usage_count}</TableCell>
                  <TableCell>
                    <Switch checked={template.is_active} onChange={async () => {
                      await updateTemplate({ id: template.id, template: { is_active: !template.is_active } });
                    }} />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton size="small" onClick={() => handleOpenEdit(template)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton size="small" color="error" onClick={() => deleteTemplate(template.id)}><DeleteIcon /></IconButton></Tooltip>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Modifier le template' : 'Nouveau template'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Catégorie" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} fullWidth required />
            <TextField label="Mots-clés (séparés par des virgules)" value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} fullWidth required helperText="Ex: prix, tarif, coût, combien" />
            <TextField label="Texte du template" value={formData.template_text} onChange={(e) => setFormData({ ...formData, template_text: e.target.value })} fullWidth multiline rows={4} required />
            <TextField label="Priorité (1-10)" type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} inputProps={{ min: 1, max: 10 }} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingTemplate ? 'Modifier' : 'Créer'}</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
