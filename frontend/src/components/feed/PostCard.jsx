'use client';

import React, { useState } from 'react';
import PostCardHeader from './PostCardHeader';
import PostCardMedia from './PostCardMedia';
import PostReactionSummary from './PostReactionSummary';
import PostActionBar from './PostActionBar';
import CommentThread from './CommentThread';
import LikesModal from '@/components/ui/LikesModal';
import CommentsModal from '@/components/ui/CommentsModal';

export default function PostCard({ 
	post,
	currentUser,
	onMenuToggle,
	onReact,
	onComment,
	onShare,
	onAddComment,
	onLoadPreviousComments,
	onLikeComment,
	onReplyComment,
	onShareComment
}) {
	const [showLikesModal, setShowLikesModal] = useState(false);
	const [showCommentsModal, setShowCommentsModal] = useState(false);

	// Show latest 2 comments inline
	const latestComments = post?.comments?.slice(0, 2) || [];
	const totalComments = post?.commentCount || 0;

	return (
		<>
			<div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
				<div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
					<PostCardHeader 
						author={post?.author}
						timestamp={post?.timestamp}
						visibility={post?.visibility}
						onMenuToggle={onMenuToggle}
					/>
					<PostCardMedia 
						title={post?.title}
						image={post?.image}
					/>
				</div>
				<PostReactionSummary 
					reactions={post?.reactions}
					likesCount={post?.likesCount || 0}
					likedBy={post?.likedBy || []}
					commentCount={post?.commentCount}
					shareCount={post?.shareCount}
					postId={post?.id}
					onLikesClick={() => setShowLikesModal(true)}
				/>
				<PostActionBar 
					onReact={onReact}
					onComment={(postId) => {
						if (totalComments > 2) {
							setShowCommentsModal(true);
						} else {
							onComment?.(postId);
						}
					}}
					onShare={onShare}
					isLiked={post?.isLiked || false}
					postId={post?.id}
				/>
				{/* Comments section */}
				<CommentThread 
					comments={latestComments}
					previousCommentsCount={totalComments > 2 ? totalComments - 2 : 0}
					currentUser={currentUser}
					onLoadPrevious={() => setShowCommentsModal(true)}
					onAddComment={(content) => onAddComment?.(content, post?.id)}
					onLikeComment={(commentId) => onLikeComment?.(commentId, post?.id)}
					onReplyComment={(commentId, content) => onReplyComment?.(content, commentId, post?.id)}
					onShareComment={onShareComment}
				/>
			</div>
			<LikesModal 
				isOpen={showLikesModal} 
				onClose={() => setShowLikesModal(false)} 
				postId={post?.id}
			/>
			<CommentsModal 
				isOpen={showCommentsModal} 
				onClose={() => setShowCommentsModal(false)} 
				postId={post?.id}
				currentUser={currentUser}
				onAddComment={() => onAddComment?.(null, post?.id)}
			/>
		</>
	);
}
