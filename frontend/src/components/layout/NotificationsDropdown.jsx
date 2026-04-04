import { useState } from 'react';
import NotificationSettings from './NotificationSettings';
import NotificationFilters from './NotificationFilters';
import NotificationList from './NotificationList';

const notificationsData = [
	{ id: 1, user: 'Steve Jobs', action: 'posted a link in your timeline.', time: '42 minutes ago', image: 'assets/images/friend-req.png' },
	{ id: 2, user: 'Freelancer usa', action: 'changed the group name to Freelancer USA', time: '42 minutes ago', image: 'assets/images/profile-1.png' },
	{ id: 3, user: 'Steve Jobs', action: 'posted a link in your timeline.', time: '42 minutes ago', image: 'assets/images/friend-req.png' },
	{ id: 4, user: 'Freelancer usa', action: 'changed the group name to Freelancer USA', time: '42 minutes ago', image: 'assets/images/profile-1.png' },
	{ id: 5, user: 'Steve Jobs', action: 'posted a link in your timeline.', time: '1 hour ago', image: 'assets/images/friend-req.png' },
	{ id: 6, user: 'Freelancer usa', action: 'changed the group name to Freelancer USA', time: '1 hour ago', image: 'assets/images/profile-1.png' },
];

export default function NotificationsDropdown({ isOpen }) {
	const [activeFilter, setActiveFilter] = useState('all');

	return (
		<div id="_notify_drop" className={`_notification_dropdown ${isOpen ? 'show' : ''}`}>
			<div className="_notifications_content">
				<h4 className="_notifications_content_title">Notifications</h4>
				<NotificationSettings />
			</div>
			<div className="_notifications_drop_box">
				<NotificationFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
				<NotificationList notifications={notificationsData} />
			</div>
		</div>
	);
}