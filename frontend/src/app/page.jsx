'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/feed');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div style={styles.container}>
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Buddy Script</h1>
            <p style={styles.subtitle}>Your companion for scripting success</p>
            <div style={styles.buttonGroup}>
                <a href="/register" style={styles.primaryBtn}>Get Started</a>
                <a href="/login" style={styles.secondaryBtn}>Sign In</a>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        padding: '24px',
        gap: '24px',
    },
    title: {
        fontSize: '48px',
        fontWeight: '700',
        color: '#000',
        letterSpacing: '-2px',
    },
    subtitle: {
        fontSize: '18px',
        color: '#666',
        marginTop: '-8px',
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
    },
    primaryBtn: {
        padding: '14px 32px',
        background: '#000',
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '15px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
    },
    secondaryBtn: {
        padding: '14px 32px',
        background: 'transparent',
        color: '#333',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        transition: 'all 0.2s ease',
    },
}
