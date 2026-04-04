import ProfileMenu from './ProfileMenu';

export default function ProfileDropdown({ isOpen, user, onLogout }) {
	return (
		<div id="_prfoile_drop" className={`_nav_profile_dropdown _profile_dropdown ${isOpen ? 'show' : ''}`}>
			<div className="_nav_profile_dropdown_info">
				<div className="_nav_profile_dropdown_image">
					<img src="assets/images/profile.png" alt="Image" className="_nav_drop_img" />
				</div>
				<div className="_nav_profile_dropdown_info_txt">
					<h4 className="_nav_dropdown_title">{user?.firstName} {user?.lastName}</h4>
					<a href="profile.html" className="_nav_drop_profile">
						View Profile
					</a>
				</div>
			</div>
			<hr />
			<ProfileMenu onLogout={onLogout} />
		</div>
	);
}