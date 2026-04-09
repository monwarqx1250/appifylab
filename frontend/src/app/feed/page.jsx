
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { transformPost, transformComment, buildCurrentUser } from '@/utils/feed';

export default function FeedPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [posts, setPosts] = useState([]);
	const [postsLoading, setPostsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const loadMoreRef = useRef(null);
	const fetchingRef = useRef(false);
	const postsFetchedRef = useRef(false);

	const { likePost, likeComment, loading: likeLoading } = useLike();
	const { fetchComments, addComment, replyToComment, loading: commentLoading } = useComments();

	const fetchPosts = async (pageNum = 1) => {
		if (pageNum === 1) {
			setPostsLoading(true);
		} else {
			setLoadingMore(true);
		}
		
		const result = await postsApi.getAll(pageNum);
		if (result.ok) {
			const data = result.data;
			if (!data || !data.posts) {
				console.error('Invalid response:', data);
				setLoadingMore(false);
				fetchingRef.current = false;
				return;
			}
			const postsList = data.posts;
			const transformed = postsList.map(transformPost);
			if (pageNum === 1) {
				setPosts(transformed);
			} else {
				setPosts(prev => {
					const existingIds = new Set(prev.map(p => p.id));
					const newPosts = transformed.filter(p => !existingIds.has(p.id));
					return [...prev, ...newPosts];
				});
			}
			setHasMore(data.hasMore === true);
		} else {
			setHasMore(false);
		}
		
		if (pageNum === 1) {
			setPostsLoading(false);
		} else {
			setLoadingMore(false);
			fetchingRef.current = false;
		}
	};

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [isLoading, isAuthenticated, router]);

	useEffect(() => {
		if (isAuthenticated && !postsFetchedRef.current) {
			postsFetchedRef.current = true;
			fetchPosts(1);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		if (!hasMore || loadingMore || postsLoading || fetchingRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !fetchingRef.current) {
					fetchingRef.current = true;
					const nextPage = page + 1;
					setPage(nextPage);
					fetchPosts(nextPage);
				}
			},
			{ rootMargin: '200px' }
		);

		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}

		return () => observer.disconnect();
	}, [hasMore, loadingMore, postsLoading, page, fetchPosts]);

	const handlePostCreated = useCallback((newPost) => {
		console.log('handlePostCreated - raw:', newPost);
		const transformed = transformPost(newPost);
		console.log('handlePostCreated - transformed:', transformed);
		setPosts(prev => [transformed, ...prev]);
	}, []);

	const handleReact = useCallback(async (postId) => {
		const result = await likePost(postId);
		if (!result) return;
		
		setPosts(prev => prev.map(post => {
			if (post.id === postId) {
				const isLiked = result?.liked ?? !post.isLiked;
				const currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : 'You';
				
				let newLikedBy;
				if (isLiked) {
					newLikedBy = [{ id: user?.id, name: currentUserName }, ...(post.likedBy || [])].slice(0, 5);
				} else {
					newLikedBy = (post.likedBy || []).filter(l => l.id !== user?.id);
				}
				
				return {
					...post,
					isLiked,
					likesCount: isLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 1) - 1),
					likedBy: newLikedBy,
				};
			}
			return post;
		}));
	}, [likePost, user]);

	const handleComment = useCallback((postId) => {
		const post = posts.find(p => p.id === postId);
		if (post && !post.commentsLoaded) {
			fetchComments(postId).then(comments => {
				console.log('handleComment API result:', comments);
				const transformed = (comments || []).map(c => {
					console.log('Comment before transform:', c);
					return transformComment(c);
				});
				console.log('Comments after transform:', transformed);
				setPosts(prev => prev.map(p => {
					if (p.id === postId) {
						return {
							...p,
							comments: transformed,
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
						comments: [transformComment(newComment), ...(post.comments || [])],
						commentCount: (post.commentCount || 0) + 1,
					};
				}
				return post;
			}));
		}
	}, [addComment]);

	const handleLoadPreviousComments = useCallback((postId) => {
		console.log('Load previous comments for post:', postId);
	}, []);

	const handleLikeComment = useCallback(async (commentId) => {
		await likeComment(commentId);
	}, [likeComment]);

	const handleReplyComment = useCallback(async (content, parentId, postId) => {
		const newComment = await replyToComment(postId, content, parentId);
		if (newComment) {
			setPosts(prev => prev.map(post => {
				if (post.id === postId) {
					const addReplyToParent = (comments, depth = 0) => {
						return comments.map(comment => {
							if (comment.id === parentId) {
								return {
									...comment,
									replies: [...(comment.replies || []), transformComment(newComment)],
									repliesCount: (comment.repliesCount || 0) + 1,
								};
							}
							if (comment.replies && comment.replies.length > 0) {
								return {
									...comment,
									replies: addReplyToParent(comment.replies, depth + 1),
								};
							}
							return comment;
						});
					};

					const updatedComments = addReplyToParent(post.comments || []);
					return {
						...post,
						comments: updatedComments,
						commentCount: (post.commentCount || 0) + 1,
					};
				}
				return post;
			}));
		}
	}, [replyToComment]);

	const handleShareComment = useCallback((commentId) => {
		console.log('Share comment:', commentId);
	}, []);

	const handleDeletePost = useCallback((postId) => {
		setPosts(prev => prev.filter(p => p.id !== postId));
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

	const currentUser = buildCurrentUser(user);

	return (
		<>
			<div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
				<ThemeSwitcher isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
				<div className="_main_layout">
					<DesktopNavbar user={user} />
					<MobileHeader user={user} />
					<MobileBottomNav user={user} />
					<div className="container _custom_container">
						<div className="_layout_inner_wrap">
							<div className="row">
								<LeftSidebar user={user} />
								<div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
									<div className="_layout_middle_wrap">
										<div className="_layout_middle_inner">
											<StoryCarousel />
											<StoryCarouselMobile />
											<CreatePostBox onPostCreated={handlePostCreated} />
											{postsLoading ? (
												<p>Loading posts...</p>
											) : posts.length === 0 ? (
												<p>No posts yet. Be the first to post!</p>
											) : (
												posts.map(post => (
													<PostCard 
														key={post.id}
														post={post}
														currentUser={currentUser}
														onReact={handleReact}
														onComment={handleComment}
														onShare={handleShare}
														onAddComment={(content) => handleAddComment(content, post.id)}
														onLoadPreviousComments={handleLoadPreviousComments}
														onLikeComment={handleLikeComment}
														onReplyComment={handleReplyComment}
														onShareComment={handleShareComment}
														onDeletePost={handleDeletePost}
														isDarkMode={isDarkMode}
													/>
												))
											)}
											{loadingMore && (
												<p style={{ textAlign: 'center', padding: '20px' }}>Loading more posts...</p>
											)}
											{!hasMore && posts.length > 0 && (
												<p style={{ textAlign: 'center', padding: '20px', color: isDarkMode ? '#aaa' : '#666' }}>No more posts</p>
											)}
											<div ref={loadMoreRef} style={{ height: '1px' }} />
										</div>
									</div>
								</div>
								<RightSidebar user={user} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
