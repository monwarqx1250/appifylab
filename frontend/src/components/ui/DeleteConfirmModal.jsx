'use client';

import React from 'react';
import Modal from './Modal';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = 'Delete Post', message = 'Are you sure you want to delete this post? This action cannot be undone.', loading = false }) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
			<div style={{ padding: '20px' }}>
				<p style={{ margin: '0 0 24px', color: '#333', fontSize: '15px', lineHeight: '1.5' }}>
					{message}
				</p>
				<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
					<button
						onClick={onClose}
						disabled={loading}
						style={{
							padding: '10px 20px',
							borderRadius: '8px',
							border: '1px solid #ddd',
							background: '#fff',
							color: '#333',
							fontSize: '14px',
							fontWeight: '500',
							cursor: loading ? 'not-allowed' : 'pointer',
							opacity: loading ? 0.6 : 1,
						}}
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={loading}
						style={{
							padding: '10px 20px',
							borderRadius: '8px',
							border: 'none',
							background: '#ff4d4f',
							color: '#fff',
							fontSize: '14px',
							fontWeight: '500',
							cursor: loading ? 'not-allowed' : 'pointer',
							opacity: loading ? 0.6 : 1,
						}}
					>
						{loading ? 'Deleting...' : 'Delete'}
					</button>
				</div>
			</div>
		</Modal>
	);
}
