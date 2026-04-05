'use client';

import React, { useState } from 'react';
import CommentComposer from './CommentComposer';
import { commentsApi } from '../../lib/api';
import { CommentAvatar, CommentHeader, CommentContent, CommentActions, CommentReactions } from './CommentParts';
import CommentReply from './CommentReply';

export default function CommentItem({ comment, currentUser, onLike, onReply, onShare, depth = 0 }) {
	const [showReplyBox, setShowReplyBox] = useState(false);
	const [isLiked, setIsLiked] = useState(comment?.isLiked || false);
	const [likesCount, setLikesCount] = useState(comment?.likes || 0);

	const repliesCount = comment?.repliesCount || 0;

	const handleReplyClick = () => {
		setShowReplyBox(!showReplyBox);
	};

	const handleLike = () => {
		setIsLiked(!isLiked);
		setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
		onLike?.(comment?.id);
	};

	const containerClass = depth > 0 ? '_comment_main _comment_nested' : '_comment_main';

	return (
		<div className={containerClass}>
			<CommentAvatar src={comment?.author?.avatar} alt={comment?.author?.name} />

			<div className="_comment_area">
				<div className="_comment_details">
					<CommentHeader name={comment?.author?.name} />
					<CommentContent content={comment?.content} />
					<CommentActions 
						onLike={handleLike} 
						onReply={handleReplyClick} 
						onShare={onShare} 
						timestamp={comment?.timestamp}
						isLiked={isLiked}
					/>
					<CommentReactions isLiked={isLiked} likesCount={likesCount} />

					<CommentReply
						commentId={comment?.id}
						repliesCount={repliesCount}
						currentUser={currentUser}
						onLike={onLike}
						onReply={onReply}
						onShare={onShare}
						depth={depth}
					/>
				</div>
				{showReplyBox && (
					<CommentComposer
						currentUser={currentUser}
						placeholder="Write a reply"
						textareaId={`reply-${comment?.id || 'default'}`}
						onSubmit={(content) => {
							onReply?.(comment?.id, content);
							setShowReplyBox(false);
						}}
					/>
				)}
			</div>
		</div>
	);
}
