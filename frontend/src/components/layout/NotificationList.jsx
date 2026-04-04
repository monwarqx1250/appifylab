export default function NotificationList({ notifications }) {
	return (
		<div className="_notifications_all">
			{notifications.map((notification) => (
				<div key={notification.id} className="_notification_box">
					<div className="_notification_image">
						<img src={notification.image} alt="Image" className="_notify_img" />
					</div>
					<div className="_notification_txt">
						<p className="_notification_para">
							<span className="_notify_txt_link">{notification.user}</span>
							{notification.action}
						</p>
						<div className="_nitification_time">
							<span>{notification.time}</span>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}