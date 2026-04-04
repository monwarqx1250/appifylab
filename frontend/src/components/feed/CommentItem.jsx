'use client';

import React, { useState } from 'react';
import CommentComposer from './CommentComposer';

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
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up">
									<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
								</svg>
							</span>
							<span className="_reaction_heart">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart">
									<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
								</svg>
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
