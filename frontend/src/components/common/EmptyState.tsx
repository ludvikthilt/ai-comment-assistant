import { Box, Typography, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title = 'Aucune donnée', description = 'Commencez par ajouter des éléments.', action }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: action ? 2 : 0 }}>{description}</Typography>
      {action && <Button variant="contained" onClick={action.onClick}>{action.label}</Button>}
    </Box>
  );
}
