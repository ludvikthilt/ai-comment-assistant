import { Card, CardContent, Box, Typography, Chip, Avatar } from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';
import { getSentimentColor, getSentimentLabel, formatRelativeDate } from '@/utils';
import type { Comment } from '@/types';

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <CommentIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>{comment.author_name}</Typography>
              <Typography variant="caption" color="text.secondary">{formatRelativeDate(comment.created_at)}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{comment.content}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {comment.sentiment && (
                <Chip label={getSentimentLabel(comment.sentiment)} size="small"
                  sx={{ bgcolor: `${getSentimentColor(comment.sentiment)}15`, color: getSentimentColor(comment.sentiment), fontWeight: 600, fontSize: '0.7rem' }} />
              )}
              {comment.is_question && <Chip label="Question" size="small" sx={{ bgcolor: 'info.light', color: 'info.main', fontWeight: 600, fontSize: '0.7rem' }} />}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
