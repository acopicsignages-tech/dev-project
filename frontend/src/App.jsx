import React, { useState } from 'react';
import Header from './components/Header';
import FormCard from './components/FormCard';
import PdfViewerSection from './components/PdfViewerSection';
import LoginCard from './components/LoginCard';
import AdminPortal from './components/AdminPortal';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { transliterateToKannada, isKannadaText } from './utils/kannadaTransliterate';
import './App.css';

const EMPTY_FORM = {
  date: '',
  rationCardNumber: '',
  name: '',
};

export default function App() {
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('auth_token'));
  const [userPhone, setUserPhone] = useState(() => sessionStorage.getItem('phone'));
  const [showAdmin, setShowAdmin] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [paymentStage, setPaymentStage] = useState('idle');
  const [paymentError, setPaymentError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState(null);

  const paymentConfig = { amount: 0, currency: 'INR', keyId: '' };
  const lastCapturedOrderId = null;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLoginSuccess = (token, phone) => {
    setAuthToken(token);
    setUserPhone(phone);
    showToast(`Logged in successfully as ${phone} 🎉`, 'success');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('phone');
    setAuthToken(null);
    setUserPhone(null);
    setFormData(EMPTY_FORM);
    setPaymentStage('idle');
    setPaymentError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    showToast('Logged out successfully');
  };

  const validateAndPreparePayload = () => {
    if (!formData.date || !formData.date.trim()) {
      showToast('Please select a Date (ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ)', 'error');
      return null;
    }
    if (!formData.rationCardNumber || !formData.rationCardNumber.trim()) {
      showToast('Please enter Ration Card Number (ಪಡಿತರ ಚೀಟಿ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ)', 'error');
      return null;
    }
    if (!formData.name || !formData.name.trim()) {
      showToast('Please enter Beneficiary Name (ಹೆಸರನ್ನು ನಮೂದಿಸಿ)', 'error');
      return null;
    }

    let finalName = formData.name.trim();
    if (!isKannadaText(finalName)) {
      finalName = transliterateToKannada(finalName);
      setFormData((prev) => ({ ...prev, name: finalName }));
    }
    if (!finalName || !isKannadaText(finalName)) {
      showToast('Please enter a valid Kannada name (ಕನ್ನಡದಲ್ಲಿ ಹೆಸರು ನಮೂದಿಸಿ)', 'error');
      return null;
    }

    return {
      date: formData.date.trim(),
      rationCardNumber: formData.rationCardNumber.trim(),
      name: finalName,
    };
  };

  /**
   * Directly generates and downloads the PDF via /api/pdf/generate.
   * Completely bypasses any payment gateway.
   */
  const handleGeneratePdf = async () => {
    const payload = validateAndPreparePayload();
    if (!payload) return;

    try {
      setPaymentStage('creating');
      setPaymentError(null);

      const token = sessionStorage.getItem('auth_token');

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF. Please check your inputs and try again.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Trigger automatic download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Gruhalakshmi_Sanction_Order_${payload.rationCardNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      setPaymentStage('success');
      showToast('PDF generated & downloaded successfully! 🎉', 'success');
    } catch (err) {
      console.error(err);
      setPaymentStage('failed');
      setPaymentError(err.message || 'PDF generation failed. Please try again.');
      showToast(err.message || 'PDF generation failed', 'error');
    }
  };

  /** Re-download the already-generated PDF */
  const handleRetryDownload = async () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `Gruhalakshmi_Sanction_Order_${formData.rationCardNumber || 'order'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('PDF downloaded!', 'success');
    } else {
      await handleGeneratePdf();
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (paymentStage !== 'idle' && paymentStage !== 'creating') {
      setPaymentStage('idle');
      setPaymentError(null);
    }
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setPaymentStage('idle');
    setPaymentError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    showToast('Form cleared');
  };

  return (
    <div className="app-container">
      <Header
        authToken={authToken}
        userPhone={userPhone}
        onLogout={handleLogout}
        onOpenAdmin={() => setShowAdmin(!showAdmin)}
        isAdminOpen={showAdmin}
      />

      <main className="main-content">
        {showAdmin ? (
          <AdminPortal
            onClose={() => setShowAdmin(false)}
            showToast={showToast}
          />
        ) : !authToken ? (
          <LoginCard onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            <div className="hero-banner">
              <h2>Gruha Lakshmi Sanction Order Generator</h2>
              <p>
                Official Karnataka Government Gruha Lakshmi Sanction Order Generator.
              </p>
              <div className="kannada-tag">
                ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಜನೆ ಮಂಜೂರಾತಿ ಪತ್ರ
              </div>
            </div>

            <div className="app-grid">
              <FormCard
                formData={formData}
                setFormData={setFormData}
                onFieldChange={handleFieldChange}
                onProceedToPayment={handleGeneratePdf}
                onReset={handleReset}
                paymentStage={paymentStage}
                paymentError={paymentError}
                paymentConfig={paymentConfig}
                onRetryDownload={handleRetryDownload}
                lastCapturedOrderId={lastCapturedOrderId}
              />

              <PdfViewerSection
                previewUrl={previewUrl}
                previewLoading={paymentStage === 'creating'}
                onRefresh={handleRetryDownload}
                onDownload={handleRetryDownload}
                formData={formData}
              />
            </div>
          </>
        )}
      </main>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} color="#06d6a0" />
            ) : (
              <AlertCircle size={18} color="#e63946" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <p>Karnataka Government Gruha Lakshmi PDF Generator</p>
      </footer>
    </div>
  );
}
