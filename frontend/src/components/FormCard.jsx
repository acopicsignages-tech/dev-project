import React from 'react';
import { Calendar, CreditCard, User, Sparkles, Trash2, ShieldCheck, Lock, AlertCircle, RefreshCw, CheckCircle2, IndianRupee } from 'lucide-react';
import { transliterateToKannada, hasEnglishLetters } from '../utils/kannadaTransliterate';

export default function FormCard({
  formData,
  setFormData,
  onProceedToPayment,
  onReset,
  paymentStage, // 'idle' | 'creating' | 'checkout' | 'verifying' | 'success' | 'cancelled' | 'failed'
  paymentError,
  paymentConfig,
  onRetryDownload,
  lastCapturedOrderId,
  onFieldChange
}) {
  const handleChange = (field, value) => {
    if (onFieldChange) {
      onFieldChange(field, value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (formData.name && hasEnglishLetters(formData.name)) {
        const converted = transliterateToKannada(formData.name);
        handleChange('name', converted + (e.key === ' ' ? ' ' : ''));
      }
    }
  };

  const handleNameBlur = () => {
    if (formData.name && hasEnglishLetters(formData.name)) {
      handleChange('name', transliterateToKannada(formData.name));
    }
  };

  const setTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    handleChange('date', `${yyyy}-${mm}-${dd}`);
  };

  const needsConversion = formData.name && hasEnglishLetters(formData.name);
  const suggestedKannada = needsConversion ? transliterateToKannada(formData.name) : '';
  const amountToDisplay = paymentConfig?.amount || 100;
  const isBusy = paymentStage === 'creating' || paymentStage === 'verifying';

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title">
          <Sparkles size={20} color="var(--accent-gold)" />
          <span>Application Form (ಅರ್ಜಿ ವಿವರಗಳು)</span>
        </div>
        <button
          type="button"
          className="quick-action-btn"
          onClick={onReset}
          disabled={isBusy}
          title="Clear all fields"
        >
          <Trash2 size={14} />
          <span>Clear Form</span>
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onProceedToPayment();
        }}
      >
        {/* Field 1: Date */}
        <div className="form-group">
          <label className="form-label" htmlFor="date-input">
            <span>1. Date (ದಿನಾಂಕ)</span>
            <span className="kannada-label">ಮಂಜೂರಾತಿ ದಿನಾಂಕ</span>
          </label>
          <div className="input-wrapper">
            <input
              id="date-input"
              type="date"
              className="form-input"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              disabled={isBusy}
              required
            />
            <div className="input-icon">
              <Calendar size={18} />
            </div>
          </div>
          <div className="chips-container">
            <button
              type="button"
              className="chip"
              onClick={setTodayDate}
              disabled={isBusy}
            >
              📅 Today (ಇಂದು)
            </button>
          </div>
        </div>

        {/* Field 2: Ration Card Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="rc-input">
            <span>2. Ration Card Number (ಪಡಿತರ ಚೀಟಿ ಸಂಖ್ಯೆ)</span>
            <span className="kannada-label">12-ಅಂಕಿಗಳ ಸಂಖ್ಯೆ</span>
          </label>
          <div className="input-wrapper">
            <input
              id="rc-input"
              type="text"
              className="form-input"
              maxLength={14}
              value={formData.rationCardNumber}
              onChange={(e) => handleChange('rationCardNumber', e.target.value.replace(/[^0-9]/g, ''))}
              disabled={isBusy}
              required
            />
            <div className="input-icon">
              <CreditCard size={18} />
            </div>
          </div>
        </div>

        {/* Field 3: Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name-input">
            <span>3. Name (ಹೆಸರು)</span>
            <span className="kannada-label" style={{ color: '#06d6a0' }}>
              ✓ ನೇರವಾಗಿ ಕನ್ನಡದಲ್ಲೂ ನಮೂದಿಸಬಹುದು
            </span>
          </label>
          <div className="input-wrapper">
            <input
              id="name-input"
              type="text"
              className="form-input kannada-input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={handleNameBlur}
              disabled={isBusy}
              required
            />
            <div className="input-icon">
              <User size={18} />
            </div>
          </div>

          {/* Real-time preview chip if English is typed */}
          {needsConversion && suggestedKannada && (
            <div style={{ marginTop: '0.4rem' }}>
              <button
                type="button"
                className="chip"
                style={{ background: 'rgba(6, 214, 160, 0.15)', color: '#06d6a0', borderColor: 'rgba(6, 214, 160, 0.3)' }}
                onClick={() => handleChange('name', suggestedKannada)}
                title="Click to apply Kannada text"
              >
                ✨ Convert to: <strong>{suggestedKannada}</strong>
              </button>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="payment-info-box">
          <div className="payment-info-header">
            <div className="payment-amount-label">
              <ShieldCheck size={18} color="#06d6a0" />
              <span>Official Sanction Order PDF</span>
            </div>
          </div>
          <p className="payment-info-sub">
            Enter the details above and click <strong>Generate PDF</strong> to download your official Gruha Lakshmi Sanction Order.
          </p>
        </div>

        {/* Failure Message */}
        {paymentStage === 'failed' && (
          <div className="status-banner banner-error">
            <AlertCircle size={18} />
            <div>
              <p className="status-title">Generation Failed</p>
              <p className="status-desc">{paymentError || 'Please try again.'}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {paymentStage === 'success' && (
          <div className="status-banner banner-success">
            <CheckCircle2 size={18} />
            <div>
              <p className="status-title">PDF Generated Successfully!</p>
              <p className="status-desc">Your official Sanction Order PDF has been downloaded.</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="button-stack">
          <button
            id="proceed-payment-btn"
            type="submit"
            className="btn-primary"
            disabled={isBusy}
          >
            {paymentStage === 'creating' ? (
              <>
                <span className="spinner"></span>
                <span>Generating PDF...</span>
              </>
            ) : paymentStage === 'failed' ? (
              <>
                <RefreshCw size={18} />
                <span>Try Generating Again</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate & Download PDF</span>
              </>
            )}
          </button>

          {paymentStage === 'success' && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onRetryDownload}
              disabled={isBusy}
              style={{ width: '100%', justifyContent: 'center' }}
              title="Re-download the last generated PDF without regenerating"
            >
              <RefreshCw size={16} />
              <span>Re-download Last PDF</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
