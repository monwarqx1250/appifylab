'use client';

import React, { useState } from 'react';
import CommentItem from './CommentItem';
import CommentComposer from './CommentComposer';

export default function CommentThread({
	comments = [],
	previousCommentsCount = 0,
	currentUser,
	onLoadPrevious,
	onAddComment,
	onLikeComment,
	onReplyComment,
	onShareComment
}) {
	const [showPrevious, setShowPrevious] = useState(false);

	const handleLoadPrevious = () => {
		setShowPrevious(true);
		onLoadPrevious?.();
	};

	return (
		<div className="_timline_comment_main">
			{previousCommentsCount > 0 && !showPrevious && (
				<div className="_previous_comment">
					<button
						type="button"
						className="_previous_comment_txt"
						onClick={handleLoadPrevious}
					>
						View {previousCommentsCount} previous comments
					</button>
				</div>
			)}
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					currentUser={currentUser}
					onLike={() => onLikeComment?.(comment.id)}
					onReply={(content) => {
						console.log('CommentThread onReply:', { commentId: comment.id, postId: comment.postId, content });
						onReplyComment(content, comment.id, comment.postId)
					}}
					onShare={() => onShareComment?.(comment.id)}
				/>
			))}

			<CommentComposer
				currentUser={currentUser}
				placeholder="Write a comment"
				textareaId="main-comment"
				onSubmit={onAddComment}
			/>

		</div>
	);
}
