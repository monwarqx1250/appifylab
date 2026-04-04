'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { likesApi } from '@/lib/api';
import Modal from './Modal';

function LikerItem({ user }) {
	return (
		<div 
			style={{
				display: 'flex',
				alignItems: 'center',
				padding: '12px 16px',
				gap: '12px',
				borderBottom: '1px solid #f0f0f0',
			}}
		>
			<img 
				src="assets/images/react_img1.png" 
				alt={user.name}
				style={{
					width: '40px',
					height: '40px',
					borderRadius: '50%',
					objectFit: 'cover',
				}}
			/>
			<div>
				<p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>
					{user.firstName} {user.lastName}
				</p>
			</div>
		</div>
	);
}

export default function LikesModal({ isOpen, onClose, postId }) {
	const [likers, setLikers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(1);
	const [totalLikes, setTotalLikes] = useState(0);

	const loadLikers = useCallback(async (pageNum) => {
		if (loading) return;
		setLoading(true);
		
		try {
			const result = await likesApi.getPostLikers(postId, pageNum, 20);
			if (result.ok) {
				if (pageNum === 1) {
					setLikers(result.data.likers);
				} else {
					setLikers(prev => [...prev, ...result.data.likers]);
				}
				setHasMore(result.data.hasMore);
				setTotalLikes(result.data.totalLikes);
			}
		} catch (error) {
			console.error('Failed to load likers:', error);
		} finally {
			setLoading(false);
		}
	}, [postId, loading]);

	useEffect(() => {
		if (isOpen && postId) {
			setLikers([]);
			setPage(1);
			setHasMore(true);
			loadLikers(1);
		}
	}, [isOpen, postId]);

	const handleScroll = (e) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
			const nextPage = page + 1;
			setPage(nextPage);
			loadLikers(nextPage);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={`${totalLikes} Likes`}>
			<div 
				onScroll={handleScroll}
				style={{
					maxHeight: '60vh',
					overflowY: 'auto',
				}}
			>
				{likers.length === 0 && !loading ? (
					<div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
						No likes yet
					</div>
				) : (
					likers.map(user => (
						<LikerItem key={user.id} user={user} />
					))
				)}
				
				{loading && (
					<div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
						Loading...
					</div>
				)}
				
				{!hasMore && likers.length > 0 && (
					<div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
						No more likes to load
					</div>
				)}
			</div>
		</Modal>
	);
}