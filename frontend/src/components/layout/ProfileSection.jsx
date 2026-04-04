import ProfileDropdown from './ProfileDropdown';

export default function ProfileSection({ isOpen, user, onToggle, onLogout }) {
	return (
		<div className="_header_nav_profile">
			<div className="_header_nav_profile_image">
				<img src="assets/images/profile.png" alt="Image" className="_nav_profile_img" />
			</div>
			<div className="_header_nav_dropdown">
				<p className="_header_nav_para">{user?.firstName} {user?.lastName}</p>
				<button id="_profile_drop_show_btn" className="_header_nav_dropdown_btn _dropdown_toggle" type="button" onClick={onToggle}>
					<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
						<path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
					</svg>
				</button>
			</div>
			<ProfileDropdown isOpen={isOpen} user={user} onLogout={onLogout} />
		</div>
	);
}