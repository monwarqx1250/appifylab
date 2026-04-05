'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { commentsApi } from '@/lib/api';
import Modal from './Modal';
import CommentComposer from '@/components/feed/CommentComposer';
import CommentItem from '@/components/feed/CommentItem';

export default function CommentsModal({ isOpen, onClose, postId, currentUser, onAddComment }) {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const loadComments = useCallback(async () => {
		if (!postId) return;
		setLoading(true);
		
		try {
			const result = await commentsApi.getByPostId(postId, 1, 50);
			if (result.ok && result.data) {
				const commentsArray = Array.isArray(result.data) ? result.data : (result.data.comments || []);
				const transformed = commentsArray.map(c => ({
					id: c.id,
					author: {
						name: c.author?.name || 'User',
						avatar: c.author?.avatar || 'assets/images/txt_img.png'
					},
					content: c.content,
					likes: c.likes || 0,
					isLiked: c.isLiked || false,
					timestamp: c.timestamp || '1m',
					repliesCount: c.repliesCount || 0
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
						name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'User',
						avatar: currentUser?.avatar || 'assets/images/comment_img.png'
					},
					content: content,
					likes: 0,
					isLiked: false,
					timestamp: 'Just now',
					repliesCount: 0
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

	const handleLike = (commentId) => {
		console.log('Like comment:', commentId);
	};

	const handleReply = (parentId, content) => {
		console.log('Reply to comment:', parentId, content);
	};

	const handleShare = (commentId) => {
		console.log('Share comment:', commentId);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Comments" maxWidth="500px">
			<div style={{ maxHeight: '60vh', display: 'flex', flexDirection: 'column', padding : '14px' }}>
				<div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
					<CommentComposer
						currentUser={currentUser}
						placeholder="Write a comment..."
						textareaId="modal-comment"
						onSubmit={handleAddComment}
						submitting={submitting}
					/>
				</div>
				
				<div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
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
								onLike={() => handleLike(comment.id)}
								onReply={(content) => handleReply(comment.id, content)}
								onShare={() => handleShare(comment.id)}
							/>
						))
					)}
				</div>
			</div>
		</Modal>
	);
}