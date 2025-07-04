"use client";

import React, { useState, useEffect } from 'react';

// Type definitions
interface FundsData {
  type?: string;
  email?: string;
  balance?: number;
}

interface DepositRequest {
  amount: number;
  mode: string;
}

interface DepositResponse {
  success?: boolean;
  message?: string;
  balance?: number;
  data?: {
    url?: string;
  };
}

type PaymentMode = 'NB';

const FundsManagement: React.FC = () => {
  const [funds, setFunds] = useState<FundsData | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositMode] = useState<PaymentMode>('NB');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [authToken, setAuthToken] = useState<string>('');

  // Base URL for your API
  const BASE_URL: string = 'http://13.202.238.76:3000/api/v1';

  // Fetch funds data
  const fetchFunds = async (): Promise<void> => {
    if (!authToken) {
      setError('Please enter your Bearer token first');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response: Response = await fetch(`${BASE_URL}/funds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: FundsData = await response.json();
      setFunds(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to fetch funds: ${errorMessage}`);
      console.error('Error fetching funds:', err);
    } finally {
      setLoading(false);
    }
  };

  // Deposit funds
  const depositFunds = async (): Promise<void> => {
    if (!authToken) {
      setError('Please enter your Bearer token first');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const requestBody: DepositRequest = {
        amount: parseFloat(depositAmount),
        mode: depositMode
      };

      const response: Response = await fetch(`${BASE_URL}/funds/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData: DepositResponse = await response.json();
      
      // Check if it's a Net Banking deposit that returns a payment URL
      if (depositMode === 'NB' && responseData.data?.url) {
        setSuccess(`Redirecting to payment gateway...`);
        
        // Show success message briefly, then redirect
        setTimeout(() => {
          window.open(responseData.data!.url, '_blank');
          setSuccess('Payment gateway opened in new tab. Complete your payment there.');
          setDepositAmount('');
        }, 1500);
      } else {
        // For other payment modes or direct deposits
        setSuccess(`Successfully deposited ₹${depositAmount}`);
        setDepositAmount('');
        
        // Refresh funds data after successful deposit
        setTimeout(() => {
          fetchFunds();
          setSuccess('');
        }, 2000);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to deposit funds: ${errorMessage}`);
      console.error('Error depositing funds:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle token input change
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAuthToken(e.target.value);
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDepositAmount(e.target.value);
  };

  // Load funds data on component mount - but only if token is available
  useEffect(() => {
    if (authToken) {
      fetchFunds();
    }
  }, [authToken]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      colorScheme: 'light'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1E293B',
            marginBottom: '8px'
          }}>
            Funds Management System
          </h1>
          <p style={{ color: '#64748B' }}>
            Manage your account deposits and view fund details
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: '#DC2626', marginRight: '8px', fontWeight: 'bold' }}>×</span>
            <span style={{ color: '#B91C1C' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: '#16A34A', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
            <span style={{ color: '#15803D' }}>{success}</span>
          </div>
        )}

        {/* Auth Token Input */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1E293B',
            marginBottom: '16px'
          }}>
            Authentication
          </h2>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Bearer Token
            </label>
            <input
              type="password"
              value={authToken}
              onChange={handleTokenChange}
              placeholder="Enter your Bearer token"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#6B7280',
              marginTop: '4px'
            }}>
              This token will be sent as &quot;Authorization: Bearer {'{token}'}&quot; header
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {/* Account Information Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1E293B'
              }}>
                Account Information
              </h2>
              <button
                onClick={fetchFunds}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  color: '#3B82F6',
                  backgroundColor: loading ? '#F3F4F6' : '#EBF8FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                type="button"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {loading && !funds ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  height: '16px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <div style={{
                  height: '16px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  width: '75%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <div style={{
                  height: '16px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  width: '50%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
              </div>
            ) : funds ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {funds.type && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#6B7280', fontWeight: '500', marginRight: '8px' }}>
                      Account Type:
                    </span>
                    <span style={{ color: '#1E293B', textTransform: 'capitalize' }}>
                      {funds.type}
                    </span>
                  </div>
                )}
                {funds.email && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#6B7280', fontWeight: '500', marginRight: '8px' }}>
                      Email:
                    </span>
                    <span style={{ color: '#1E293B' }}>{funds.email}</span>
                  </div>
                )}
                {funds.balance !== undefined && (
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748B',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        Current Balance
                      </p>
                      <p style={{
                        fontSize: '30px',
                        fontWeight: 'bold',
                        color: '#1E293B'
                      }}>
                        ₹{funds.balance?.toLocaleString() || '0.00'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{
                color: '#6B7280',
                textAlign: 'center',
                padding: '32px 0'
              }}>
                No account data available
              </p>
            )}
          </div>

          {/* Deposit Funds Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1E293B',
              marginBottom: '24px'
            }}>
              Deposit Funds
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Deposit Amount (INR)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '12px',
                    color: '#9CA3AF',
                    fontSize: '16px'
                  }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      paddingLeft: '32px',
                      paddingRight: '16px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Payment Method
                </label>
                <select
                  value={depositMode}
                  onChange={() => {}} // No change needed since only one option
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    cursor: 'default'
                  }}
                  disabled
                >
                  <option value="NB">Net Banking</option>
                </select>
              </div>

              <button
                onClick={depositFunds}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
                  color: 'white',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                type="button"
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#3B82F6';
                  }
                }}
              >
                {loading ? 'Processing Payment...' : 'Proceed to Net Banking'}
              </button>

              <div style={{
                padding: '12px',
                backgroundColor: '#F0F9FF',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#0C4A6E',
                border: '1px solid #BAE6FD'
              }}>
                <strong>Note:</strong> You will be redirected to a secure payment gateway to complete your transaction.
              </div>
            </div>
          </div>
        </div>

      <style jsx>{`
        * {
          color-scheme: light !important;
        }
        
        html, body {
          color-scheme: light !important;
          background-color: white !important;
        }
        
        input, select, button {
          color-scheme: light !important;
          background-color: white !important;
        }
        
        @media (prefers-color-scheme: dark) {
          * {
            color-scheme: light !important;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      </div>
    </div>
  );
}

export default FundsManagement;