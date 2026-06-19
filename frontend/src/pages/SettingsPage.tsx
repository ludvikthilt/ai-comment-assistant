import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Switch, FormControlLabel,
  Slider, Button, Alert, Tab, Tabs,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { DashboardLayout } from '@/components/layout';
import { useSettingsStore } from '@/stores';

export default function SettingsPage() {
  const {
    theme, setTheme, sentimentThreshold, setSentimentThreshold,
    questionThreshold, setQuestionThreshold, autoLikeEnabled, setAutoLikeEnabled,
    whatsappNotificationsEnabled, setWhatsappNotificationsEnabled,
  } = useSettingsStore();
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Paramètres</Typography>
      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Général" /><Tab label="IA & Analyse" /><Tab label="Intégrations" /><Tab label="Compte" />
        </Tabs>
        <CardContent sx={{ p: 4 }}>
          {saved && <Alert severity="success" sx={{ mb: 3 }}>Paramètres sauvegardés !</Alert>}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" fontWeight={700}>Apparence</Typography>
              <FormControlLabel control={<Switch checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />} label={`Mode ${theme === 'dark' ? 'sombre' : 'clair'}`} />
            </Box>
          )}
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" fontWeight={700}>Seuils de confiance</Typography>
              <Box>
                <Typography gutterBottom>Seuil sentiment pour like auto: {Math.round(sentimentThreshold * 100)}%</Typography>
                <Slider value={sentimentThreshold} onChange={(_, v) => setSentimentThreshold(v as number)} min={0.5} max={0.99} step={0.01} marks valueLabelDisplay="auto" />
              </Box>
              <Box>
                <Typography gutterBottom>Seuil détection question: {Math.round(questionThreshold * 100)}%</Typography>
                <Slider value={questionThreshold} onChange={(_, v) => setQuestionThreshold(v as number)} min={0.5} max={0.99} step={0.01} marks valueLabelDisplay="auto" />
              </Box>
              <FormControlLabel control={<Switch checked={autoLikeEnabled} onChange={(e) => setAutoLikeEnabled(e.target.checked)} />} label="Activer le like automatique sur les commentaires positifs" />
            </Box>
          )}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" fontWeight={700}>WhatsApp</Typography>
              <FormControlLabel control={<Switch checked={whatsappNotificationsEnabled} onChange={(e) => setWhatsappNotificationsEnabled(e.target.checked)} />} label="Activer les notifications WhatsApp" />
              <TextField label="Numéro admin" placeholder="33612345678" fullWidth />
            </Box>
          )}
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" fontWeight={700}>Modifier le mot de passe</Typography>
              <TextField label="Mot de passe actuel" type="password" fullWidth />
              <TextField label="Nouveau mot de passe" type="password" fullWidth />
              <TextField label="Confirmer le mot de passe" type="password" fullWidth />
            </Box>
          )}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Sauvegarder</Button>
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
