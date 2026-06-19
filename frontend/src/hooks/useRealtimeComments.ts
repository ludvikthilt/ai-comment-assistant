import { useEffect } from 'react';
import { commentsService } from '@/services';
import { useCommentsStore } from '@/stores';
import type { Comment } from '@/types';

export function useRealtimeComments() {
  const { addComment, updateComment } = useCommentsStore();

  useEffect(() => {
    const newCommentsChannel = commentsService.subscribeToNewComments((payload) => {
      const comment = payload.new as Comment;
      addComment(comment);
    });

    const updateChannel = commentsService.subscribeToCommentUpdates((payload) => {
      const comment = payload.new as Comment;
      updateComment(comment.id, comment);
    });

    return () => {
      newCommentsChannel.unsubscribe();
      updateChannel.unsubscribe();
    };
  }, [addComment, updateComment]);
}
