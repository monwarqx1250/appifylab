
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StoryCarousel from '@/components/feed/StoryCarousel';
import StoryCarouselMobile from '@/components/feed/StoryCarouselMobile';

import CreatePostBox from '@/components/feed/CreatePostBox';
import PostCard from '@/components/feed/PostCard';

import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';

import ThemeSwitcher from '@/components/layout/ThemeSwitcher';
import DesktopNavbar from '@/components/layout/DesktopNavbar';
import MobileHeader from '@/components/layout/MobileHeader';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/context/AuthContext';
import { postsApi } from '@/lib/api';
import { useLike } from '@/hooks/useLike';
import { useComments } from '@/hooks/useComments';


export default function FeedPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [posts, setPosts] = useState([]);
	const [postsLoading, setPostsLoading] = useState(true);

	const { likePost, likeComment, loading: likeLoading } = useLike();
	const { fetchComments, addComment, replyToComment, loading: commentLoading } = useComments();

	const fetchPosts = async () => {
		setPostsLoading(true);
		const result = await postsApi.getAll();
		if (result.ok) {
			setPosts(result.data);
		}
		setPostsLoading(false);
	};

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isLoading, isAuthenticated, router]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchPosts();
		}
	}, [isAuthenticated]);

	const transformPost = (post) => ({
		id: post.id,
		author: {
			name: `${post.author.firstName} ${post.author.lastName}`,
			avatar: 'assets/images/post_img.png',
		},
		timestamp: formatTimeAgo(post.createdAt),
		visibility: post.visibility,
		title: post.content?.substring(0, 50) || '',
		image: post.attachments?.[0]?.fileUrl || null,
		reactions: [],
		likesCount: post.likesCount || post._count?.likes || 0,
		isLiked: post.isLiked || false,
		commentCount: post._count?.comments || 0,
		shareCount: 0,
		previousCommentsCount: 0,
		comments: [],
	});

	const formatTimeAgo = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);
		
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	};

	const transformComment = (comment) => ({
		id: comment.id,
		author: {
			name: `${comment.author?.firstName || 'User'} ${comment.author?.lastName || ''}`.trim(),
			avatar: comment.author?.avatar || 'assets/images/comment_img.png',
		},
		content: comment.content,
		likes: comment._count?.likes || 0,
		timestamp: formatTimeAgo(comment.createdAt),
		replies: comment.replies || [],
	});

	const handlePostCreated = (newPost) => {
		setPosts(prev => [transformPost(newPost), ...prev]);
	};

	const handleReact = useCallback(async (postId) => {
		console.log('handleReact called with postId:', postId);
		const result = await likePost(postId);
		console.log('likePost result:', result);
		if (!result) return;
		
		setPosts(prev => prev.map(post => {
			if (post.id === postId) {
				const isLiked = result?.liked ?? !post.isLiked;
				return {
					...post,
					isLiked,
					likesCount: isLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 1) - 1),
				};
			}
			return post;
		}));
	}, [likePost]);

	const handleComment = useCallback((postId) => {
		const post = posts.find(p => p.id === postId);
		if (post && !post.commentsLoaded) {
			fetchComments(postId).then(comments => {
				setPosts(prev => prev.map(p => {
					if (p.id === postId) {
						return {
							...p,
							comments: comments,
							commentsLoaded: true,
						};
					}
					return p;
				}));
			});
		}
	}, [posts, fetchComments]);

	const handleShare = useCallback(() => console.log('Share clicked'), []);

	const handleAddComment = useCallback(async (content, postId) => {
		const newComment = await addComment(postId, content);
		if (newComment) {
			setPosts(prev => prev.map(post => {
				if (post.id === postId) {
					return {
						...post,
						comments: [...(post.comments || []), transformComment(newComment)],
						commentCount: (post.commentCount || 0) + 1,
					};
				}
				return post;
			}));
		}
	}, [addComment, transformComment]);

	const handleLoadPreviousComments = useCallback((postId) => {
		console.log('Load previous comments for post:', postId);
	}, []);

	const handleLikeComment = useCallback(async (commentId, postId) => {
		await likeComment(commentId);
	}, [likeComment]);

	const handleReplyComment = useCallback(async (content, parentId, postId) => {
		const newComment = await replyToComment(postId, content, parentId);
		if (newComment) {
			setPosts(prev => prev.map(post => {
				if (post.id === postId) {
					return {
						...post,
						comments: [...(post.comments || []), transformComment(newComment)],
					};
				}
				return post;
			}));
		}
	}, [replyToComment, transformComment]);

	const handleShareComment = useCallback((commentId) => {
		console.log('Share comment:', commentId);
	}, []);

	if (isLoading) {
		return (
			<div className="_layout_main_wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
				<p>Loading...</p>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	const samplePost = {
		author: {
			name: 'Karim Saif',
			avatar: 'assets/images/post_img.png',
		},
		timestamp: '5 minute ago',
		visibility: 'Public',
		title: '-Healthy Tracking App',
		image: 'assets/images/timeline_img.png',
		reactions: [
			{ image: 'assets/images/react_img1.png' },
			{ image: 'assets/images/react_img2.png' },
			{ image: 'assets/images/react_img3.png' },
			{ image: 'assets/images/react_img4.png' },
			{ image: 'assets/images/react_img5.png' },
		],
		commentCount: 12,
		shareCount: 122,
		previousCommentsCount: 4,
		comments: [
			{
				id: 1,
				author: {
					name: 'Radovan SkillArena',
					avatar: 'assets/images/txt_img.png',
				},
				content: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
				likes: 198,
				timestamp: '21m',
			},
		],
	};

	const currentUser = user ? {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		avatar: 'assets/images/comment_img.png',
	} : null;

	return (
		<>

			{/* Feed Section Start */}
			<div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
				<ThemeSwitcher isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
				<div className="_main_layout">
					<DesktopNavbar user={user} />
					<MobileHeader user={user} />
					<MobileBottomNav user={user} />
					{/*  Main Layout Structure  */}
					<div className="container _custom_container">
						<div className="_layout_inner_wrap">
							<div className="row">
								<LeftSidebar user={user} />
								{/*  Layout Middle  */}
								<div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
									<div className="_layout_middle_wrap">
										<div className="_layout_middle_inner">
											{/* For Desktop */}
											<StoryCarousel />
											{/* For Desktop End */}
											{/* For Mobile */}
											<StoryCarouselMobile />
											{/* For Mobile End */}
											<CreatePostBox onPostCreated={handlePostCreated} />
											{postsLoading ? (
												<p>Loading posts...</p>
											) : posts.length === 0 ? (
												<p>No posts yet. Be the first to post!</p>
											) : (
												posts.map(post => (
													<PostCard 
														key={post.id}
														post={transformPost(post)}
														currentUser={currentUser}
														onReact={handleReact}
														onComment={handleComment}
														onShare={handleShare}
														onAddComment={(content) => handleAddComment(content, post.id)}
														onLoadPreviousComments={handleLoadPreviousComments}
														onLikeComment={handleLikeComment}
														onReplyComment={handleReplyComment}
														onShareComment={handleShareComment}
													/>
												))
											)}
										</div>
									</div>
								</div>
								{/*  Layout Middle  */}
								<RightSidebar user={user} />
							</div>
						</div>
					</div>
					{/*  Main Layout Structure  */}
				</div>
				{/* Feed Section End */}
			</div>


		</>
	);
}
