
"use client";

import React, { useState, useEffect } from 'react';
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


export default function FeedPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [posts, setPosts] = useState([]);
	const [postsLoading, setPostsLoading] = useState(true);

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

	const handlePostCreated = (newPost) => {
		setPosts(prev => [transformPost(newPost), ...prev]);
	};

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

	const handleReact = () => console.log('React clicked');
	const handleComment = () => console.log('Comment clicked');
	const handleShare = () => console.log('Share clicked');
	const handleAddComment = (content, postId) => console.log('Add comment:', content, postId);
	const handleLoadPreviousComments = () => console.log('Load previous comments');
	const handleLikeComment = (commentId) => console.log('Like comment:', commentId);
	const handleReplyComment = (commentId, content) => console.log('Reply to comment:', commentId, content);
	const handleShareComment = (commentId) => console.log('Share comment:', commentId);

	return (
		<>

			{/* Feed Section Start */}
			<div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
				<ThemeSwitcher isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
				<div className="_main_layout">
					<DesktopNavbar />
					<MobileHeader />
					<MobileBottomNav />
					{/*  Main Layout Structure  */}
					<div className="container _custom_container">
						<div className="_layout_inner_wrap">
							<div className="row">
								<LeftSidebar />
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
								<RightSidebar />
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
