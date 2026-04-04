'use client';

import React from 'react';
import PostCardHeader from './PostCardHeader';
import PostCardMedia from './PostCardMedia';
import PostReactionSummary from './PostReactionSummary';
import PostActionBar from './PostActionBar';
import CommentThread from './CommentThread';

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
	return (
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
				commentCount={post?.commentCount}
				shareCount={post?.shareCount}
			/>
			<PostActionBar 
				onReact={onReact}
				onComment={onComment}
				onShare={onShare}
				isLiked={post?.isLiked || false}
				postId={post?.id}
			/>
			<CommentThread 
				comments={post?.comments || []}
				previousCommentsCount={post?.previousCommentsCount || 0}
				currentUser={currentUser}
				onLoadPrevious={onLoadPreviousComments}
				onAddComment={onAddComment}
				onLikeComment={onLikeComment}
				onReplyComment={onReplyComment}
				onShareComment={onShareComment}
			/>
		</div>
	);
}
