'use client';

import React from 'react';

export default function PostCardMedia({ title, image }) {
	return (
		<div style={{padding:10}}>
			<h4 className="_feed_inner_timeline_post_title">{title || 'Untitled Post'}</h4>
			{image &&
				<div className="_feed_inner_timeline_image">
					<img src={image} alt="" className="_time_img" />
				</div>
			}
		</div>
	);
}
