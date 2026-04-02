
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
											<PostCard />
											<PostCard />
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
