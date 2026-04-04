import { useState, useCallback } from 'react';
import { commentsApi } from '@/lib/api';

export function useComments() {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchComments = useCallback(async (postId) => {
		setLoading(true);
		setError(null);

		try {
			const result = await commentsApi.getByPostId(postId);

			if (!result.ok) {
				throw new Error(String(result.data?.message || 'Failed to fetch comments'));
			}

			const commentsData = Array.isArray(result.data) ? result.data : result.data.comments || [];
			setComments(commentsData);
			return commentsData;
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'An error occurred';
			setError(errorMsg);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	const addComment = useCallback(async (postId, content, parentId = null) => {
		if (!content?.trim()) return null;

		setLoading(true);
		setError(null);

		try {
			const payload = { postId, content };
			if (parentId) payload.parentId = parentId;

			const result = await commentsApi.create(payload);

			if (!result.ok) {
				throw new Error(String(result.data?.message || 'Failed to add comment'));
			}

			const newComment = result.data;
			setComments((prev) => [...prev, newComment]);
			return newComment;
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'An error occurred';
			setError(errorMsg);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const replyToComment = useCallback(async (postId, content, parentId) => {
		return addComment(postId, content, parentId);
	}, [addComment]);

	return {
		comments,
		fetchComments,
		addComment,
		replyToComment,
		loading,
		error,
	};
}