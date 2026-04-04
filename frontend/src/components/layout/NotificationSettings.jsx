export default function NotificationSettings() {
	return (
		<div className="_notification_box_right">
			<button type="button" className="_notification_box_right_link">
				<svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
					<circle cx="2" cy="2" r="2" fill="#C4C4C4" />
					<circle cx="2" cy="8" r="2" fill="#C4C4C4" />
					<circle cx="2" cy="15" r="2" fill="#C4C4C4" />
				</svg>
			</button>
			<div className="_notifications_drop_right">
				<ul className="_notification_list">
					<li className="_notification_item">
						<span className="_notification_link">Mark as all read</span>
					</li>
					<li className="_notification_item">
						<span className="_notification_link">Notifications settings</span>
					</li>
					<li className="_notification_item">
						<span className="_notification_link">Open Notifications</span>
					</li>
				</ul>
			</div>
		</div>
	);
}