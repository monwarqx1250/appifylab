'use client';

import React, { useState } from 'react';
import CommentComposer from './CommentComposer';
import { LikeIcon } from '../icons/LikeIcon';
import { HeartIcon } from '../icons/HeartIcon';

export default function CommentItem({ comment, currentUser, onLike, onReply, onShare }) {
	const [showReplyBox, setShowReplyBox] = useState(false);

	const handleReplyClick = () => {
		setShowReplyBox(!showReplyBox);
	};

	return (
		<div className="_comment_main">
			<div className="_comment_image">
				<a href="profile.html" className="_comment_image_link">
					<img src={comment?.author?.avatar || "assets/images/txt_img.png"} alt="" className="_comment_img1" />
				</a>
			</div>
			<div className="_comment_area">
				<div className="_comment_details">
					<div className="_comment_details_top">
						<div className="_comment_name">
							<a href="profile.html">
								<h4 className="_comment_name_title">{comment?.author?.name || 'Unknown'}</h4>
							</a>
						</div>
					</div>
					<div className="_comment_status">
						<p className="_comment_status_text">
							<span>{comment?.content || 'No content'}</span>
						</p>
					</div>
				<div className="_total_reactions">
					<div className="_total_react">
						<span className="_reaction_like">
							<LikeIcon />
						</span>
						<span className="_reaction_heart">
							<HeartIcon />
						</span>
					</div>
					<span className="_total">{comment?.likes || 0}</span>
				</div>
					<div className="_comment_reply">
						<div className="_comment_reply_num">
							<ul className="_comment_reply_list">
								<li><span onClick={onLike}>Like.</span></li>
								<li><span onClick={handleReplyClick}>Reply.</span></li>
								<li><span onClick={onShare}>Share</span></li>
								<li><span className="_time_link">.{comment?.timestamp || '1m'}</span></li>
							</ul>
						</div>
					</div>
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
