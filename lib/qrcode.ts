import QRCode from 'qrcode';

export const generateQRDataURL = async (tableNumber: number, baseUrl?: string): Promise<string> => {
  // Use baseUrl if provided, otherwise check window.location.origin, 
  // fallback to NEXT_PUBLIC_APP_URL, then localhost
  const effectiveBaseUrl = baseUrl || 
    (typeof window !== 'undefined' ? window.location.origin : '') || 
    process.env.NEXT_PUBLIC_APP_URL || 
    'http://localhost:3000';
    
  const url = `${effectiveBaseUrl}/menu?table=${tableNumber}`;
  
  try {
    const dataURL = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: {
        dark: '#1a1c19', // Espresso
        light: '#ffffff',
      },
    });
    return dataURL;
  } catch (err) {
    console.error('QR Code Generation Error:', err);
    throw err;
  }
};
