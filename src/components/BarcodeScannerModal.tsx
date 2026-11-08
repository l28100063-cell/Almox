import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Barcode,
  Search,
  CheckCircle2,
  AlertCircle,
  Camera,
  CameraOff,
  Edit2
} from 'lucide-react';
import { Product } from '../types/product';
import { BarcodeDisplay } from './BarcodeDisplay';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProductToEdit: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProductToEdit
}) => {
  const [bipInput, setBipInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Focus barcode input upon open
  useEffect(() => {
    if (isOpen) {
      setBipInput('');
      setScannedProduct(null);
      setNotFoundBarcode(null);
      setCameraError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle camera stream cleanup
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (cameraActive && isOpen) {
      navigator.mediaDevices?.getUserMedia({
        video: { facingMode: 'environment' }
      })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      })
      .catch(() => {
        setCameraError('Câmera indisponível ou permissão negada. Use a leitura manual abaixo.');
        setCameraActive(false);
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive, isOpen]);

  if (!isOpen) return null;

  const handleProcessBarcode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    // Search by exact barcode or product internal code
    const found = products.find(
      p => p.codigoBarras === trimmed || p.codigo.toLowerCase() === trimmed.toLowerCase()
    );

    if (found) {
      setScannedProduct(found);
      setNotFoundBarcode(null);
    } else {
      setScannedProduct(null);
      setNotFoundBarcode(trimmed);
    }
    setBipInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessBarcode(bipInput);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scan-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 id="scan-title" className="text-base font-bold text-slate-900">
                Leitor de Código de Barras
              </h2>
              <p className="text-xs text-slate-500">
                Bipe com o leitor óptico USB/Bluetooth ou digite o código
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Bip Input */}
          <form onSubmit={handleSubmit}>
            <label htmlFor="scan-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Bipe ou digite o código de barras
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="scan-input"
                type="text"
                value={bipInput}
                onChange={e => setBipInput(e.target.value)}
                placeholder="Pressione o gatilho do leitor ou digite..."
                className="w-full pl-10 pr-24 py-3 bg-slate-50 border-2 border-indigo-400 rounded-xl font-mono-code font-bold text-base text-slate-900 focus:bg-white focus:outline-hidden focus:ring-4 focus:ring-indigo-100 transition-all shadow-xs"
              />
              <Barcode className="w-5 h-5 text-indigo-500 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                className="absolute right-2 top-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Dica: Leitores de código de barras USB/sem fio enviam o código seguido de [Enter] automaticamente.
            </p>
          </form>

          {/* Camera Scan Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Leitura com a Câmera</span>
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  cameraActive
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                {cameraActive ? (
                  <>
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Desligar Câmera</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Ligar Câmera</span>
                  </>
                )}
              </button>
            </div>

            {cameraActive && (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-300">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-red-500/80 m-6 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 animate-pulse" />
                </div>
              </div>
            )}
            {cameraError && (
              <p className="text-xs text-rose-600 mt-1">{cameraError}</p>
            )}
          </div>

          {/* Scanned Result Card */}
          {scannedProduct && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Produto Localizado!
                </span>
                <span className="font-mono-code text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {scannedProduct.codigo}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {scannedProduct.descricao}
                </h4>
              </div>

              {/* Barcode Visual */}
              <div className="bg-white p-2 rounded-lg border border-emerald-100 flex justify-center">
                <BarcodeDisplay
                  value={scannedProduct.codigoBarras}
                  height={32}
                  showText={true}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-bold">Quantidade em Estoque:</span>
                  <span className="text-lg font-black text-slate-900">
                    {scannedProduct.quantidade} <span className="text-xs font-normal text-slate-600">{scannedProduct.unidade || 'UN'}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectProductToEdit(scannedProduct);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Cadastro</span>
                </button>
              </div>
            </div>
          )}

          {/* Not Found Alert */}
          {notFoundBarcode && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 space-y-2 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Nenhum produto cadastrado com este código
                </h4>
              </div>
              <p className="text-xs">
                Código bipe: <strong className="font-mono-code">{notFoundBarcode}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                }}
                className="text-xs font-bold text-indigo-700 hover:underline"
              >
                Cadastrar novo produto com este código →
              </button>
            </div>
          )}

          {/* Quick Simulation shortcuts */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Simular bip de teste com produtos cadastrados:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {products.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProcessBarcode(p.codigoBarras)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] font-mono-code text-slate-700 border border-slate-200 transition-colors truncate max-w-[150px]"
                >
                  {p.codigo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
