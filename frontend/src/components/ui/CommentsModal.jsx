'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { commentsApi } from '@/lib/api';
import Modal from './Modal';
import CommentComposer from '@/components/feed/CommentComposer';
import CommentItem from '@/components/feed/CommentItem';

export default function CommentsModal({ isOpen, onClose, postId, currentUser, onAddComment, onReplyComment, isDarkMode = false }) {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const loadMoreRef = useRef(null);
	const fetchingRef = useRef(false);

	const loadComments = useCallback(async (pageNum = 1) => {
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		
		if (pageNum === 1) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}
		console.log('Loading page:', pageNum);
		
		try {
			const result = await commentsApi.getByPostId(postId, pageNum, 20);
			console.log('API result:', result.ok, result.data);
			if (result.ok && result.data) {
				const commentsArray = Array.isArray(result.data) ? result.data : (result.data.comments || []);
				console.log('Comments array:', commentsArray.length);
				const transformed = commentsArray.map(c => ({
					id: c.id,
					postId: c.postId,
					author: {
						name: c.author?.name || 'User',
						avatar: c.author?.avatar || 'assets/images/txt_img.png'
					},
					content: c.content,
					likes: c.likes || 0,
					isLiked: c.isLiked || false,
					timestamp: c.timestamp || '1m',
					repliesCount: c.repliesCount || 0,
					replies: c.replies || []
				}));
				
				if (pageNum === 1) {
					setComments(transformed);
				} else {
					setComments(prev => [...prev, ...transformed]);
				}
				setHasMore(result.data.hasMore !== false);
				setPage(pageNum);
			}
		} catch (error) {
			console.error('Failed to load comments:', error);
		} finally {
			setLoading(false);
			setLoadingMore(false);
			fetchingRef.current = false;
		}
	}, [postId]);

	useEffect(() => {
		if (isOpen && postId) {
			fetchingRef.current = false;
			setComments([]);
			setPage(1);
			setHasMore(true);
			setLoading(false);
			loadComments(1);
		}
	}, [isOpen, postId, loadComments]);

	useEffect(() => {
		console.log('Observer effect:', hasMore, loading, !!loadMoreRef.current);
		if (!hasMore || loading || !loadMoreRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				console.log('Observer triggered:', entries[0].isIntersecting, fetchingRef.current);
				if (entries[0].isIntersecting && !fetchingRef.current) {
					loadComments(page + 1);
				}
			},
			{ rootMargin: '100px' }
		);

		observer.observe(loadMoreRef.current);
		return () => observer.disconnect();
	}, [hasMore, loading, page, loadComments]);

	const handleAddComment = async (content) => {
		if (!content?.trim() || !postId) return;
		setSubmitting(true);
		
		try {
			const result = await commentsApi.create({ postId, content });
			if (result.ok && result.data) {
				const newComment = {
					id: result.data.id,
					postId: postId,
					author: {
						name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'User',
						avatar: currentUser?.avatar || 'assets/images/comment_img.png'
					},
					content: content,
					likes: 0,
					isLiked: false,
					timestamp: 'Just now',
					repliesCount: 0,
					replies: []
				};
				setComments(prev => [newComment, ...prev]);
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

	const handleReply = async (parentId, content) => {
		console.log('CommentsModal handleReply input:', { parentId, content, postId });
		if (!content?.trim() || !postId) return;
		setSubmitting(true);
		
		try {
			const result = await commentsApi.replyToComment(postId, content, parentId);
			if (result.ok && result.data) {
				const newReply = {
					id: result.data.id,
					postId: postId,
					parentId: parentId,
					author: {
						name: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'User',
						avatar: currentUser?.avatar || 'assets/images/comment_img.png'
					},
					content: content,
					likes: 0,
					isLiked: false,
					timestamp: 'Just now',
					repliesCount: 0,
					replies: []
				};
				
				const addReplyToParent = (comments) => {
					return comments.map(comment => {
						if (comment.id === parentId) {
							return {
								...comment,
								repliesCount: (comment.repliesCount || 0) + 1,
								replies: [...(comment.replies || []), newReply]
							};
						}
						if (comment.replies && comment.replies.length > 0) {
							return {
								...comment,
								replies: addReplyToParent(comment.replies),
							};
						}
						return comment;
					});
				};
				
				setComments(prev => addReplyToParent(prev));
				onReplyComment?.();
			}
		} catch (error) {
			console.error('Failed to reply to comment:', error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleShare = (commentId) => {
		console.log('Share comment:', commentId);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Comments" maxWidth="500px" isDarkMode={isDarkMode}>
			<div style={{ maxHeight: '60vh', display: 'flex', flexDirection: 'column', padding : '14px' }}>
				<div style={{ padding: '12px 16px', borderBottom: `1px solid ${isDarkMode ? '#112032' : '#e5e5e5'}` }}>
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
						<div style={{ padding: '40px', textAlign: 'center', color: isDarkMode ? '#aaa' : '#666' }}>
							Loading comments...
						</div>
					) : comments.length === 0 ? (
						<div style={{ padding: '40px', textAlign: 'center', color: isDarkMode ? '#aaa' : '#666' }}>
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
					
					{loadingMore && (
						<div style={{ padding: '20px', textAlign: 'center', color: isDarkMode ? '#aaa' : '#666' }}>
							Loading more...
						</div>
					)}
					
					<div ref={loadMoreRef} style={{ height: '1px' }} />
				</div>
			</div>
		</Modal>
	);
}