import { Card, CardContent, Typography, Box, Avatar, Chip, Divider } from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';
import { formatRelativeDate, getSentimentColor, getSentimentLabel, truncateText } from '@/utils';
import type { Comment } from '@/types';

interface RecentCommentsProps {
  comments: Comment[];
}

export default function RecentComments({ comments }: RecentCommentsProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, height: '100%' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Commentaires récents
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {comments.map((comment) => (
            <Box key={comment.id}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                  <CommentIcon fontSize="small" />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {comment.author_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatRelativeDate(comment.created_at)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {truncateText(comment.content, 120)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {comment.sentiment && (
                      <Chip
                        label={getSentimentLabel(comment.sentiment)}
                        size="small"
                        sx={{
                          bgcolor: `${getSentimentColor(comment.sentiment)}15`,
                          color: getSentimentColor(comment.sentiment),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                    {comment.is_question && (
                      <Chip
                        label="Question"
                        size="small"
                        sx={{
                          bgcolor: 'info.light',
                          color: 'info.main',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ mt: 1.5 }} />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
