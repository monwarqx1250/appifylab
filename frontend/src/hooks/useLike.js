import { useState, useCallback } from 'react';
import { likesApi } from '@/lib/api';

export function useLike() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const toggleLike = useCallback(async (entityId, entityType) => {
		console.log('toggleLike called:', entityId, entityType);
		setLoading(true);
		setError(null);

		try {
			const result = await likesApi.toggle(entityId, entityType);
			console.log('likesApi.toggle result:', result);
			
			if (!result.ok) {
				throw new Error(String(result.data?.message || 'Failed to toggle like'));
			}

			return result.data;
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'An error occurred';
			setError(errorMsg);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const likePost = useCallback((postId) => toggleLike(postId, 'post'), [toggleLike]);
	const likeComment = useCallback((commentId) => toggleLike(commentId, 'comment'), [toggleLike]);

	return {
		likePost,
		likeComment,
		toggleLike,
		loading,
		error,
	};
}