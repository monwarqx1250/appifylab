'use client';

import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div 
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 1000,
				padding: '20px',
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div 
				style={{
					backgroundColor: 'white',
					borderRadius: '12px',
					width: '100%',
					maxWidth: maxWidth,
					maxHeight: '80vh',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<div 
					style={{
						padding: '16px 20px',
						borderBottom: '1px solid #e5e5e5',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h3>
					<button
						onClick={onClose}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: '4px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
							<path d="M18 6L6 18M6 6l12 12"/>
						</svg>
					</button>
				</div>
				<div style={{ overflow: 'auto', flex: 1 }}>
					{children}
				</div>
			</div>
		</div>
	);
}