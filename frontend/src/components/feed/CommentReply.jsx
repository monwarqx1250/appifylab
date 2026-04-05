'use client';

import React, { useState } from 'react';
import CommentItem from './CommentItem';
import { commentsApi } from '../../lib/api';
import { RepliesLink, HideRepliesLink, LoadMoreReplies } from './CommentParts';

export default function CommentReply({ 
  commentId, 
  repliesCount, 
  currentUser, 
  onLike, 
  onReply, 
  onShare,
  depth = 0 
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleShowReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setLoadingReplies(true);
    const result = await commentsApi.getReplies(commentId, 1, 10);
    if (result.ok && result.data) {
      setReplies(result.data.comments || []);
      setHasMore(result.data.hasMore || false);
      setRepliesPage(1);
      setShowReplies(true);
    }
    setLoadingReplies(false);
  };

  const handleLoadMoreReplies = async () => {
    const nextPage = repliesPage + 1;
    const result = await commentsApi.getReplies(commentId, nextPage, 10);
    if (result.ok && result.data) {
      setReplies(prev => [...prev, ...(result.data.comments || [])]);
      setHasMore(result.data.hasMore || false);
      setRepliesPage(nextPage);
    }
  };

  return (
    <>
      <RepliesLink 
        count={repliesCount} 
        onClick={handleShowReplies} 
        loading={loadingReplies} 
      />

      {showReplies && (
        <div className="_replies_container">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onLike={onLike}
              onReply={onReply}
              onShare={onShare}
              depth={depth + 1}
            />
          ))}
          {hasMore && <LoadMoreReplies onClick={handleLoadMoreReplies} />}
          {repliesCount > 0 && <HideRepliesLink onClick={() => setShowReplies(false)} />}
        </div>
      )}
    </>
  );
}
