import React from 'react';
import { LogOut, Phone, ShieldCheck } from 'lucide-react';

export default function Header({ authToken, userPhone, onLogout, onOpenAdmin, isAdminOpen }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo-badge" title="Government of Karnataka">
            🏛️
          </div>
          <div className="brand-text">
            <h1>
              <span>Gruha Lakshmi Scheme</span>
              <span className="kannada-subtitle">ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Official Sanction Order (ಮಂಜೂರಾತಿ ಪತ್ರ) Generator
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="quick-action-btn"
            onClick={onOpenAdmin}
            title={isAdminOpen ? 'Close Admin Portal' : 'Open Admin Portal to configure phone whitelist & downloads'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: isAdminOpen ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.15)',
              color: isAdminOpen ? 'var(--accent-gold)' : 'var(--text-main)',
              background: isAdminOpen ? 'rgba(244, 162, 97, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <ShieldCheck size={15} color="var(--accent-gold)" />
            <span>Admin Portal</span>
          </button>

          {authToken && (
            <>
              {userPhone && (
                <div
                  className="chip"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Phone size={14} color="var(--accent-gold)" />
                  <span>{userPhone}</span>
                </div>
              )}
              <button
                type="button"
                className="quick-action-btn"
                onClick={onLogout}
                title="Logout from session"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
