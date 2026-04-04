'use client';

import React from 'react';

export default function PostReactionSummary({ reactions, commentCount, shareCount }) {
	return (
		<div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
			<div className="_feed_inner_timeline_total_reacts_image">
				{reactions?.slice(0, 5).map((reaction, index) => (
					<img 
						key={index}
						src={reaction.image || "assets/images/react_img1.png"} 
						alt="Reaction" 
						className={index === 0 ? "_react_img1" : "_react_img"}
					/>
				))}
				{reactions?.length > 5 && (
					<p className="_feed_inner_timeline_total_reacts_para">{reactions.length}+</p>
				)}
			</div>
			<div className="_feed_inner_timeline_total_reacts_txt">
				<p className="_feed_inner_timeline_total_reacts_para1">
					<span>{commentCount || 0}</span> Comment{commentCount !== 1 ? 's' : ''}
				</p>
				<p className="_feed_inner_timeline_total_reacts_para2">
					<span>{shareCount || 0}</span> Share{shareCount !== 1 ? 's' : ''}
				</p>
			</div>
		</div>
	);
}
