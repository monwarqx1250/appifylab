
"use client";

import React, { useState } from 'react';
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


export default function FeedPage() {
	const [isDarkMode, setIsDarkMode] = useState(false);

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

	const currentUser = {
		avatar: 'assets/images/comment_img.png',
	};

	const handleReact = () => console.log('React clicked');
	const handleComment = () => console.log('Comment clicked');
	const handleShare = () => console.log('Share clicked');
	const handleAddComment = (content) => console.log('Add comment:', content);
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
											<CreatePostBox />
											<PostCard 
												post={samplePost}
												currentUser={currentUser}
												onReact={handleReact}
												onComment={handleComment}
												onShare={handleShare}
												onAddComment={handleAddComment}
												onLoadPreviousComments={handleLoadPreviousComments}
												onLikeComment={handleLikeComment}
												onReplyComment={handleReplyComment}
												onShareComment={handleShareComment}
											/>
											<PostCard post={samplePost} currentUser={currentUser} />
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
