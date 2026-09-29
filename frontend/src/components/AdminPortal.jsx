import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Users,
  Download,
  Trash2,
  Plus,
  Search,
  FileSpreadsheet,
  ArrowLeft,
  RefreshCw,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import './AdminPortal.css';

export default function AdminPortal({ onClose, showToast }) {
  const [adminPin, setAdminPin] = useState(() => sessionStorage.getItem('admin_pin') || '');
  const [isVerified, setIsVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'downloads'

  // Data states
  const [users, setUsers] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Form states for adding a user
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [downloadSearch, setDownloadSearch] = useState('');

  // Check saved PIN on mount
  useEffect(() => {
    if (adminPin) {
      verifyPin(adminPin, true);
    }
  }, []);

  const verifyPin = async (pinToTest, isAuto = false) => {
    setLoading(true);
    setPinError('');
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToTest }),
      });

      if (res.ok) {
        setIsVerified(true);
        setAdminPin(pinToTest);
        sessionStorage.setItem('admin_pin', pinToTest);
        fetchData(pinToTest);
      } else {
        setIsVerified(false);
        if (!isAuto) {
          setPinError('Invalid Admin PIN. Please check and try again.');
        } else {
          sessionStorage.removeItem('admin_pin');
        }
      }
    } catch (err) {
      console.error(err);
      if (!isAuto) setPinError('Server error while verifying PIN. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (pin = adminPin) => {
    if (!pin) return;
    setLoading(true);

    try {
      // Fetch users
      const uRes = await fetch('/api/admin/users', { headers: { 'X-Admin-Pin': pin } });
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(Array.isArray(uData) ? uData : []);
      } else {
        console.warn('Failed to fetch users:', uRes.status);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }

    try {
      // Fetch downloads
      const dRes = await fetch('/api/admin/downloads', { headers: { 'X-Admin-Pin': pin } });
      if (dRes.ok) {
        const dData = await dRes.json();
        setDownloads(Array.isArray(dData) ? dData : []);
      } else {
        console.warn('Failed to fetch downloads:', dRes.status);
      }
    } catch (err) {
      console.error('Error fetching downloads:', err);
    }

    setLoading(false);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    verifyPin(pinInput.trim());
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('admin_pin');
    setAdminPin('');
    setIsVerified(false);
    setPinInput('');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const cleanPhone = newPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': adminPin,
        },
        body: JSON.stringify({ phone: cleanPhone, name: newName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`User ${cleanPhone} whitelisted successfully!`, 'success');
        setNewPhone('');
        setNewName('');
        fetchData();
      } else {
        showToast(data.message || 'Failed to add user', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while adding user', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async (id, phone) => {
    if (!window.confirm(`Are you sure you want to revoke login access for ${phone}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Pin': adminPin },
      });

      if (res.ok) {
        showToast(`User ${phone} removed successfully`, 'success');
        setUsers((prev) => prev.filter((u) => u.id !== id));
        fetchData();
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting user', 'error');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  // Filtered lists with robust phone & name search
  const filteredUsers = users.filter((u) => {
    if (!userSearch || !userSearch.trim()) return true;
    const term = userSearch.trim().toLowerCase();
    const digitsOnly = term.replace(/\D/g, '');
    const phone = (u.phone || '').toLowerCase();
    const name = (u.name || '').toLowerCase();

    return (
      phone.includes(term) ||
      (digitsOnly.length > 0 && phone.includes(digitsOnly)) ||
      name.includes(term)
    );
  });

  const filteredDownloads = downloads.filter((d) => {
    if (!downloadSearch || !downloadSearch.trim()) return true;
    const term = downloadSearch.trim().toLowerCase();
    const digitsOnly = term.replace(/\D/g, '');
    const phone = (d.phone || '').toLowerCase();
    const name = (d.name || d.userName || '').toLowerCase();
    const ration = (d.rationNumber || '').toLowerCase();
    const dateInfo = (d.dateInfo || '').toLowerCase();
    const ip = (d.clientIp || '').toLowerCase();
    const resType = (d.resourceType || '').toLowerCase();

    return (
      phone.includes(term) ||
      (digitsOnly.length > 0 && phone.includes(digitsOnly)) ||
      (digitsOnly.length > 0 && ration.includes(digitsOnly)) ||
      name.includes(term) ||
      ration.includes(term) ||
      dateInfo.includes(term) ||
      ip.includes(term) ||
      resType.includes(term)
    );
  });

  // Client-side instant CSV export helper (with UTF-8 BOM for Microsoft Excel)
  const downloadCsvBlob = (filename, headers, rows) => {
    const BOM = '\ufeff';
    const headerLine = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
    const rowLines = rows.map((row) =>
      row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = BOM + [headerLine, ...rowLines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Export Whitelist Users
  const handleExportUsersCsv = () => {
    if (filteredUsers.length === 0) {
      showToast('No users to export', 'error');
      return;
    }
    setExporting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const filename = `gruhalakshmi_whitelist_users_${today}.csv`;
      const headers = ['User ID', 'Phone Number', 'Beneficiary Name', 'Date Added (IST)', 'Status'];
      const rows = filteredUsers.map((u) => [
        u.id,
        u.phone,
        u.name || '',
        formatDate(u.createdAt),
        'Allowed / Whitelisted'
      ]);
      downloadCsvBlob(filename, headers, rows);
      showToast(`Exported ${filteredUsers.length} whitelist users to CSV! 📊`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error exporting whitelist CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Export Download Logs with PDF Generation Details
  const handleExportDownloadsCsv = () => {
    if (filteredDownloads.length === 0) {
      showToast('No download records to export', 'error');
      return;
    }
    setExporting(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const filename = `gruhalakshmi_download_list_${today}.csv`;
      const headers = [
        'Log ID',
        'Downloaded By Phone',
        'Beneficiary Name (PDF)',
        'Ration Card Number',
        'Sanction Date Info',
        'Resource Type',
        'Client IP',
        'Downloaded Date & Time (IST)'
      ];
      const rows = filteredDownloads.map((d) => [
        d.id,
        d.phone || 'Unknown',
        d.name || d.userName || '',
        d.rationNumber || '',
        d.dateInfo || '',
        d.resourceType || 'PDF_SANCTION_ORDER',
        d.clientIp || '',
        formatDate(d.downloadedAt)
      ]);
      downloadCsvBlob(filename, headers, rows);
      showToast(`Exported ${filteredDownloads.length} download records to CSV! 📊`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error exporting downloads CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Render Lock Screen if not verified
  if (!isVerified) {
    return (
      <div className="admin-container admin-lock-wrapper">
        <div className="admin-lock-card">
          <div className="admin-lock-icon">
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Admin Security Passkey
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Enter your secret Administrator PIN to configure allowed login users and export download records.
          </p>

          <form onSubmit={handlePinSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div className="input-wrapper">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter Admin PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  autoFocus
                  required
                />
                <div className="input-icon">
                  <KeyRound size={18} />
                </div>
              </div>
            </div>

            {pinError && (
              <div className="status-banner banner-error" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.85rem' }}>{pinError}</span>
              </div>
            )}

            <div className="button-stack" style={{ gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner"></span> : <Unlock size={18} />}
                <span>Unlock Admin Portal</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ArrowLeft size={16} />
                <span>Return to Beneficiary Portal</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className="admin-container">
      {/* Top Banner */}
      <div className="admin-header-bar">
        <div className="admin-title-group">
          <h2>
            <ShieldCheck size={26} color="var(--accent-gold)" />
            <span>Administrator Control Center</span>
          </h2>
          <p>Configure allowed login phone numbers and download audit reports</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => fetchData()}
            disabled={loading}
            title="Refresh Data"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="quick-action-btn"
            onClick={handleLogoutAdmin}
            title="Lock Admin Session"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Lock size={14} />
            <span>Lock</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={14} />
            <span>Exit to Beneficiary Portal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          <span>Configurable Allowed Users (Whitelist)</span>
          <span className="admin-tab-badge">{users.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
          onClick={() => setActiveTab('downloads')}
        >
          <Download size={18} />
          <span>Download Audit & Export</span>
          <span className="admin-tab-badge">{downloads.length}</span>
        </button>
      </div>

      {/* TAB 1: USERS CONFIGURATION */}
      {activeTab === 'users' && (
        <>
          {/* Add User Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>
                <Plus size={18} color="var(--accent-gold)" />
                <span>Whitelist New Mobile Number for Login</span>
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Only phone numbers added here will be permitted to log in and generate Gruha Lakshmi Sanction Order PDFs.
            </p>

            <form onSubmit={handleAddUser} className="admin-add-form">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Mobile Number (10 Digits) *
                </label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                  <div className="input-icon">
                    <Phone size={16} />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Beneficiary Name (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gangamma / ಗಂಗಮ್ಮ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={addLoading || newPhone.length !== 10}
                style={{ padding: '0.72rem 1.4rem', whiteSpace: 'nowrap' }}
              >
                {addLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add to Whitelist</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Users List Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>
                  <Users size={18} color="var(--accent-gold)" />
                  <span>Whitelisted Users List ({filteredUsers.length} of {users.length})</span>
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div className="admin-search-bar">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search phone or name..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button
                      type="button"
                      onClick={() => setUserSearch('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0 0.5rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Export Whitelist CSV Button */}
                <button
                  type="button"
                  className="btn-csv-export"
                  onClick={handleExportUsersCsv}
                  disabled={exporting || filteredUsers.length === 0}
                  title="Export whitelisted phone numbers to a CSV file"
                >
                  <FileSpreadsheet size={16} />
                  <span>Export Whitelist CSV</span>
                </button>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mobile Number</th>
                    <th>Beneficiary Name</th>
                    <th>Date Added</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        {userSearch ? `No whitelisted users matching "${userSearch}".` : 'No users configured yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600, letterSpacing: '0.04em' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Phone size={14} color="var(--accent-gold)" />
                            {u.phone}
                          </span>
                        </td>
                        <td>{u.name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {formatDate(u.createdAt)}
                        </td>
                        <td>
                          <span className="badge-tag tag-allowed">
                            <CheckCircle2 size={12} />
                            Allowed
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-danger-outline"
                            onClick={() => handleDeleteUser(u.id, u.phone)}
                            title="Remove user and revoke login access"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: DOWNLOAD AUDIT LOGS & CSV EXPORT */}
      {activeTab === 'downloads' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>
                <Download size={18} color="#06d6a0" />
                <span>PDF Download Audit Logs ({filteredDownloads.length} of {downloads.length})</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Every PDF generated & downloaded by beneficiaries is recorded here with IP and timestamp.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="admin-search-bar">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search phone, name or IP..."
                  value={downloadSearch}
                  onChange={(e) => setDownloadSearch(e.target.value)}
                />
                {downloadSearch && (
                  <button
                    type="button"
                    onClick={() => setDownloadSearch('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0 0.5rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Client-side CSV Download Button */}
              <button
                type="button"
                className="btn-csv-export"
                onClick={handleExportDownloadsCsv}
                disabled={exporting || filteredDownloads.length === 0}
                title="Download complete audit log as a CSV spreadsheet file"
              >
                {exporting ? (
                  <>
                    <span className="spinner" style={{ borderColor: '#0b0f19', borderTopColor: 'transparent' }}></span>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={18} />
                    <span>Download CSV Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Downloaded By Phone</th>
                  <th>Beneficiary Name (PDF)</th>
                  <th>Ration Card Number</th>
                  <th>Sanction Date</th>
                  <th>Client IP</th>
                  <th>Downloaded Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredDownloads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      {downloadSearch ? `No download records matching "${downloadSearch}".` : 'No downloads recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredDownloads.map((d) => (
                    <tr key={d.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{d.id}</td>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Phone size={14} color="var(--accent-gold)" />
                          {d.phone}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {d.name || d.userName || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {d.rationNumber ? (
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            background: 'rgba(255, 255, 255, 0.06)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            letterSpacing: '0.04em',
                            color: 'var(--accent-gold)'
                          }}>
                            {d.rationNumber}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {d.dateInfo || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {d.clientIp || '127.0.0.1'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} />
                          {formatDate(d.downloadedAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
