export default function MenuItem({ icon, label, onClick, variant = 'default' }) {
	if (variant === 'button') {
		return (
			<button 
				type="button" 
				className="_nav_dropdown_link" 
				onClick={onClick}
				style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
			>
				<div className="_nav_drop_info">
					<span dangerouslySetInnerHTML={{ __html: icon }} />
					{label}
				</div>
			</button>
		);
	}

	return (
		<a href="#0" className="_nav_dropdown_link">
			<div className="_nav_drop_info">
				<span dangerouslySetInnerHTML={{ __html: icon }} />
				{label}
			</div>
			<button type="submit" className="_nav_drop_btn_link">
				<svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" fill="none" viewBox="0 0 6 10">
					<path fill="#112032" d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z" opacity=".5" />
				</svg>
			</button>
		</a>
	);
}