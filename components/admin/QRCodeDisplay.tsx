'use client';

import { useEffect, useState } from 'react';
import { generateQRDataURL } from '@/lib/qrcode';
import { Button } from '@/components/ui/Button';

interface QRCodeDisplayProps {
  tableNumber: number;
}

export const QRCodeDisplay = ({ tableNumber }: QRCodeDisplayProps) => {
  const [dataURL, setDataURL] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      try {
        const url = await generateQRDataURL(tableNumber);
        setDataURL(url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [tableNumber]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `QR_Meja_${tableNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="w-48 h-48 bg-[#fafaf5] rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-[#43493c]">Generating...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full group/qr">
      <div className="bg-[#fafaf5] p-2 rounded-xl border border-[#eeeee9] w-full flex justify-center">
        <img 
          src={dataURL} 
          alt={`QR Meja ${tableNumber}`} 
          className="w-full h-auto max-w-[120px] object-contain mix-blend-multiply"
        />
      </div>

      <button 
        onClick={handleDownload}
        className="text-[9px] font-bold text-brand-500 hover:underline uppercase tracking-tighter opacity-60 group-hover/qr:opacity-100 transition-opacity"
      >
        Unduh QR (.png)
      </button>
    </div>
  );
};
