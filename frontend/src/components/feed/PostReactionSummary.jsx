'use client';

import React from 'react';
import LikesModal from '@/components/ui/LikesModal';

export default function PostReactionSummary({ reactions, commentCount, shareCount, likesCount, likedBy = [], postId, onLikesClick }) {
	return (
		<>
			<div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
				{likesCount > 0 && (
					<div 
						className="_feed_inner_timeline_total_reacts_image"
						onClick={onLikesClick}
						style={{ cursor: 'pointer' }}
					>
						{likedBy.slice(0, 3).map((liker, index) => (
							<img 
								key={liker.id || index}
								src="assets/images/react_img1.png" 
								alt={liker.name} 
								className={index === 0 ? "_react_img1" : "_react_img"}
								title={liker.name}
							/>
						))}
						{likesCount > 3 && (
							<p className="_feed_inner_timeline_total_reacts_para">+{likesCount - 3}</p>
						)}
					</div>
				)}
				<div className="_feed_inner_timeline_total_reacts_txt">
					<p className="_feed_inner_timeline_total_reacts_para1">
						<span>{commentCount || 0}</span> Comment{commentCount !== 1 ? 's' : ''}
					</p>
					<p className="_feed_inner_timeline_total_reacts_para2">
						<span>{shareCount || 0}</span> Share{shareCount !== 1 ? 's' : ''}
					</p>
				</div>
			</div>
		</>
	);
}
