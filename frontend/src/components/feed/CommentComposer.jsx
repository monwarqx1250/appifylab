'use client';

import React, { useRef } from 'react';
import { SendIcon } from '../icons/SendIcon';
import { EmojiIcon } from '../icons/EmojiIcon';

export default function CommentComposer({ currentUser, onSubmit, placeholder = "Write a comment", textareaId, submitting = false }) {
	const textareaRef = useRef(null);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (submitting) return;
		const textarea = textareaRef.current;
		const content = textarea.value.trim();
		if (content) {
			onSubmit?.(content);
			textarea.value = '';
		}
	};

	const handleKeyDown = (e) => {
		if (submitting) return;
		if (e.key === 'Enter' || e.keyCode === 13) {
			if (!e.shiftKey) {
				e.preventDefault();
				e.stopPropagation();
				const textarea = textareaRef.current;
				const content = textarea.value.trim();
				if (content) {
					onSubmit?.(content);
					textarea.value = '';
				}
			}
		}
	};

	return (
		<div className="_feed_inner_comment_box">
			<form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
				<div className="_feed_inner_comment_box_content">
					<div className="_feed_inner_comment_box_content_image">
						<img 
							src={currentUser?.avatar || "assets/images/comment_img.png"} 
							alt="" 
							className="_comment_img" 
						/>
					</div>
					<div className="_feed_inner_comment_box_content_txt">
						<textarea 
							ref={textareaRef}
							className="form-control _comment_textarea" 
							placeholder={placeholder} 
							id={textareaId}
							onKeyDown={handleKeyDown}
							disabled={submitting}
						></textarea>
					</div>
				</div>
				<div className="_feed_inner_comment_box_icon">
					<button type="submit" className="_feed_inner_comment_box_icon_btn" disabled={submitting}>
						{submitting ? (
							<span style={{ fontSize: '12px' }}>...</span>
						) : (
							<SendIcon />
						)}
					</button>
					<button type="button" className="_feed_inner_comment_box_icon_btn">
						<EmojiIcon />
					</button>
				</div>
			</form>
		</div>
	);
}
