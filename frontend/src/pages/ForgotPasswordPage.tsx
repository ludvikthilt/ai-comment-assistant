import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert, CircularProgress } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try { await resetPassword(email); setSent(true); } catch {} finally { setIsSubmitting(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2, background: 'linear-gradient(135deg, #1877F2 0%, #42B72A 100%)' }}>
      <Card sx={{ maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>Réinitialiser le mot de passe</Typography>
          {sent && <Alert severity="success" sx={{ mb: 2 }}>Email envoyé ! Vérifiez votre boîte de réception.</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}>
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 2 }}><Link component={RouterLink} to="/login" variant="body2">Retour à la connexion</Link></Box>
        </CardContent>
      </Card>
    </Box>
  );
}
