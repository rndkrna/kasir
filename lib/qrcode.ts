import QRCode from 'qrcode';

export const generateQRDataURL = async (tableNumber: number): Promise<string> => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/menu?table=${tableNumber}`;
  
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
