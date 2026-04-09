'use client';

import React, { useState } from 'react';
import PostCardHeader from './PostCardHeader';
import PostCardMedia from './PostCardMedia';
import PostReactionSummary from './PostReactionSummary';
import PostActionBar from './PostActionBar';
import CommentThread from './CommentThread';
import LikesModal from '@/components/ui/LikesModal';
import CommentsModal from '@/components/ui/CommentsModal';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { postsApi } from '@/lib/api';

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
	onShareComment,
	onDeletePost,
	isDarkMode = false
}) {
	const [showLikesModal, setShowLikesModal] = useState(false);
	const [showCommentsModal, setShowCommentsModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);

	// Show latest 2 comments inline
	const latestComments = post?.comments?.slice(0, 2) || [];
	const totalComments = post?.commentCount || 0;
	const isOwner = currentUser?.id === post?.author?.id;

	const handleDelete = async () => {
		setDeleting(true);
		const result = await postsApi.delete(post?.id);
		if (result.ok) {
			setShowDeleteModal(false);
			onDeletePost?.(post?.id);
		}
		setDeleting(false);
	};

	return (
		<>
			<div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
				<div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
					<PostCardHeader
						author={post?.author}
						timestamp={post?.timestamp}
						visibility={post?.visibility}
						onMenuToggle={onMenuToggle}
						isOwner={isOwner}
						onDelete={() => setShowDeleteModal(true)}
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
					onComment={() => setShowCommentsModal(true)}
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
					onReplyComment={(content, commentId, postId) => onReplyComment?.(content, commentId, postId)}
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
				isDarkMode={isDarkMode}
				onAddComment={() => onAddComment?.(null, post?.id)}
				onReplyComment={() => onReplyComment?.(null, null, post?.id)}
			/>
			<DeleteConfirmModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDelete}
				loading={deleting}
			/>
		</>
	);
}
