export default function NotificationFilters({ activeFilter, onFilterChange }) {
	return (
		<div className="_notifications_drop_btn_grp">
			<button 
				className={`_notifications_btn_link ${activeFilter === 'all' ? 'active' : ''}`}
				onClick={() => onFilterChange('all')}
			>
				All
			</button>
			<button 
				className={`_notifications_btn_link1 ${activeFilter === 'unread' ? 'active' : ''}`}
				onClick={() => onFilterChange('unread')}
			>
				Unread
			</button>
		</div>
	);
}