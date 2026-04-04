import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import NavLogo from './NavLogo';
import SearchBar from './SearchBar';
import HomeIcon from './HomeIcon';
import FriendsIcon from './FriendsIcon';
import ChatIcon from './ChatIcon';
import NotificationsIcon from './NotificationsIcon';
import ProfileSection from './ProfileSection';

export default function DesktopNavbar() {
	const [isNotifyOpen, setIsNotifyOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const router = useRouter();
	const { user, logout } = useAuth();

	const handleLogout = () => {
		logout();
		router.push('/login');
	};

	return (
		<>
			{/* Desktop Menu Start */}
			<nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
				<div className="container _custom_container">
					<div className="_logo_wrap">
						<NavLogo />
					</div>
					<button className="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"> <span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarSupportedContent">
						<div className="_header_form ms-auto">
							<SearchBar />
						</div>
						<ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
							<li className="nav-item _header_nav_item">
								<HomeIcon />
							</li>
							<li className="nav-item _header_nav_item">
								<FriendsIcon />
							</li>
							<NotificationsIcon isOpen={isNotifyOpen} onToggle={() => setIsNotifyOpen(!isNotifyOpen)} />
							<li className="nav-item _header_nav_item">
								<ChatIcon />
							</li>
						</ul>
						<ProfileSection 
							isOpen={isProfileOpen} 
							user={user} 
							onToggle={() => setIsProfileOpen(!isProfileOpen)}
							onLogout={handleLogout}
						/>
					</div>
				</div>
			</nav>
			{/* Desktop Menu End */}
		</>
	);
}