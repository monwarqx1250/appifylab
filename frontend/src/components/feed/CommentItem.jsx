'use client';

import React, { useState } from 'react';
import CommentComposer from './CommentComposer';
import { HeartIcon } from '../icons/HeartIcon';
import { commentsApi } from '../../lib/api';

export default function CommentItem({ comment, currentUser, onLike, onReply, onShare, depth = 0 }) {
	const [showReplyBox, setShowReplyBox] = useState(false);
	const [isLiked, setIsLiked] = useState(comment?.isLiked || false);
	const [likesCount, setLikesCount] = useState(comment?.likes || 0);
	const [showReplies, setShowReplies] = useState(false);
	const [replies, setReplies] = useState([]);
	const [loadingReplies, setLoadingReplies] = useState(false);
	const [repliesPage, setRepliesPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	const repliesCount = comment?.repliesCount || 0;

	const handleReplyClick = () => {
		setShowReplyBox(!showReplyBox);
	};

	const handleLike = () => {
		setIsLiked(!isLiked);
		setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
		onLike?.(comment?.id);
	};

	const handleShowReplies = async () => {
		if (showReplies) {
			setShowReplies(false);
			return;
		}
		setLoadingReplies(true);
		const result = await commentsApi.getReplies(comment.id, 1, 10);
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
		const result = await commentsApi.getReplies(comment.id, nextPage, 10);
		if (result.ok && result.data) {
			setReplies(prev => [...prev, ...(result.data.comments || [])]);
			setHasMore(result.data.hasMore || false);
			setRepliesPage(nextPage);
		}
	};

	const containerClass = depth > 0 ? '_comment_main _comment_nested' : '_comment_main';

	return (
		<div className={containerClass}>
			<div className="_comment_image">
				<a href="profile.html" className="_comment_image_link">
					<img src={comment?.author?.avatar || "assets/images/txt_img.png"} alt="" className="_comment_img1" />
				</a>
			</div>

			<div className="_comment_area">
				<div className="_comment_details">

					<div className="_comment_details_top">
						<div className="_comment_name">
							<a href="#">
								<h4 className="_comment_name_title">{comment?.author?.name || 'Unknown'}</h4>
							</a>
						</div>
					</div>

					<div className="_comment_status">
						<p className="_comment_status_text">
							<span>{comment?.content || 'No content'}</span>
						</p>
					</div>

					<div className="_comment_reply" style={{minWidth: 250}}>
						<div className="_comment_reply_num">
							<ul className="_comment_reply_list">
								<li><span onClick={handleLike}>{isLiked ? 'Liked' : 'Like'}.</span></li>
								<li><span onClick={handleReplyClick}>Reply.</span></li>
								<li><span onClick={onShare}>Share</span></li>
								<li><span className="_time_link">.{comment?.timestamp || '1m'}</span></li>
							</ul>
						</div>
					</div>

					<div className="_total_reactions">
						<div className="_total_react">
							<span className={isLiked ? "_reaction_heart liked" : "_reaction_heart"}>
								{isLiked ? <HeartIcon filled /> : <HeartIcon />}
							</span>
						</div>
						<span className="_total">{likesCount}</span>
					</div>

					{repliesCount > 0 && !showReplies && (
						<div className="_replies_link">
							<span onClick={handleShowReplies} className="_replies_text">
								{loadingReplies ? 'Loading...' : `Show ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}`}
							</span>
						</div>
					)}

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
							{hasMore && (
								<div className="_load_more_replies">
									<span onClick={handleLoadMoreReplies} className="_load_more_text">
										Load more replies
									</span>
								</div>
							)}
							{repliesCount > 0 && (
								<div className="_hide_replies">
									<span onClick={() => setShowReplies(false)} className="_hide_replies_text">
										Hide replies
									</span>
								</div>
							)}
						</div>
					)}
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
