'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { commentsApi } from '@/lib/api';
import Modal from './Modal';
import CommentComposer from '@/components/feed/CommentComposer';

function CommentItem({ comment, currentUser, onLike, onReply }) {
	const [showReplyBox, setShowReplyBox] = useState(false);

	return (
		<div className="_comment_main" style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
			<div className="_comment_image" style={{ float: 'left', marginRight: '10px' }}>
				<a href="profile.html" className="_comment_image_link">
					<img src={comment?.author?.avatar || "assets/images/txt_img.png"} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
				</a>
			</div>
			<div className="_comment_area">
				<div className="_comment_details">
					<div className="_comment_name">
						<a href="profile.html">
							<h4 className="_comment_name_title" style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>
								{`${comment.author?.firstName || ''} ${comment.author?.lastName || ''}`.trim() || 'User'}
							</h4>
						</a>
					</div>
					<div className="_comment_status">
						<p className="_comment_status_text" style={{ fontSize: '14px', margin: '4px 0' }}>
							<span>{comment.content}</span>
						</p>
					</div>
					<div className="_comment_reply" style={{ marginTop: '4px' }}>
						<ul className="_comment_reply_list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
							<li><span onClick={onLike} style={{ cursor: 'pointer' }}>Like</span></li>
							<li><span onClick={() => setShowReplyBox(!showReplyBox)} style={{ cursor: 'pointer' }}>Reply</span></li>
							<li><span className="_time_link">{comment.timestamp || '1m'}</span></li>
						</ul>
					</div>
				</div>
				{showReplyBox && (
					<div style={{ marginTop: '8px' }}>
						<CommentComposer 
							currentUser={currentUser} 
							placeholder="Write a reply"
							textareaId={`reply-${comment.id}`}
							onSubmit={(content) => {
								onReply?.(comment.id, content);
								setShowReplyBox(false);
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default function CommentsModal({ isOpen, onClose, postId, currentUser, onAddComment }) {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const loadComments = useCallback(async () => {
		if (!postId) return;
		setLoading(true);
		
		try {
			const result = await commentsApi.getAllByPostId(postId);
			if (result.ok) {
				// Transform comments for display
				const transformed = result.data.map(c => ({
					id: c.id,
					author: {
						firstName: c.author?.firstName,
						lastName: c.author?.lastName,
						avatar: c.author?.avatar || 'assets/images/txt_img.png'
					},
					content: c.content,
					likes: c._count?.likes || 0,
					timestamp: new Date(c.createdAt).toLocaleDateString(),
					replies: c._count?.replies || 0
				}));
				setComments(transformed);
			}
		} catch (error) {
			console.error('Failed to load comments:', error);
		} finally {
			setLoading(false);
		}
	}, [postId]);

	useEffect(() => {
		if (isOpen && postId) {
			loadComments();
		}
	}, [isOpen, postId, loadComments]);

	const handleAddComment = async (content) => {
		if (!content?.trim() || !postId) return;
		setSubmitting(true);
		
		try {
			const result = await commentsApi.create({ postId, content });
			if (result.ok && result.data) {
				const newComment = {
					id: result.data.id,
					author: {
						firstName: currentUser?.firstName,
						lastName: currentUser?.lastName,
						avatar: currentUser?.avatar || 'assets/images/comment_img.png'
					},
					content: content,
					likes: 0,
					timestamp: 'Just now',
					replies: 0
				};
				setComments(prev => [...prev, newComment]);
				onAddComment?.();
			}
		} catch (error) {
			console.error('Failed to add comment:', error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Comments" maxWidth="500px">
			<div style={{ maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
				<div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
					<CommentComposer
						currentUser={currentUser}
						placeholder="Write a comment..."
						textareaId="modal-comment"
						onSubmit={handleAddComment}
						submitting={submitting}
					/>
				</div>
				
				<div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
					{loading ? (
						<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
							Loading comments...
						</div>
					) : comments.length === 0 ? (
						<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
							No comments yet. Be the first to comment!
						</div>
					) : (
						comments.map(comment => (
							<CommentItem 
								key={comment.id} 
								comment={comment}
								currentUser={currentUser}
								onLike={() => console.log('Like comment:', comment.id)}
								onReply={(content) => console.log('Reply:', comment.id, content)}
							/>
						))
					)}
				</div>
			</div>
		</Modal>
	);
}