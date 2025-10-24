import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { supabase, CompanySettings, Invoice, InvoiceItem } from '../lib/supabase';
import { numberToWordsFrench } from '../utils/numberToWords';

interface InvoicePDFProps {
  invoiceId: string;
  settings: CompanySettings;
  onClose: () => void;
}

export default function InvoicePDF({ invoiceId, settings, onClose }: InvoicePDFProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    const { data: itemsData } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('order_index');

    if (invoiceData) setInvoice(invoiceData);
    if (itemsData) setItems(itemsData);
  };

  // ✅ Génération du PDF (téléchargement direct)
  const handleDownloadPDF = () => {
    if (!printRef.current || !invoice) return;

    const element = printRef.current.cloneNode(true) as HTMLElement;
    addWatermark(element);

    const opt = {
      margin: 0.5,
      filename: `${invoice.invoice_number || 'facture'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  // 👁️ Aperçu PDF (ouvre un modal plein écran)
  const handlePreviewPDF = () => {
    setShowPreview(true);
  };

  // 💧 Ajout du filigrane “PRO FORMA”
  const addWatermark = (element: HTMLElement) => {
    const watermark = document.createElement('div');
    watermark.textContent = 'PRO FORMA';
    Object.assign(watermark.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-30deg)',
      fontSize: '120px',
      fontWeight: '700',
      color: 'rgba(25, 88, 133, 0.1)',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      zIndex: '0',
    });
    element.style.position = 'relative';
    element.appendChild(watermark);
  };

  if (!invoice) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatCIPExpiry = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barre d’action */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center text-[#195885] hover:text-[#134266] font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewPDF}
              className="flex items-center bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Eye className="w-5 h-5 mr-2" />
              Aperçu PDF
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center bg-[#195885] text-white px-6 py-2 rounded-lg hover:bg-[#134266] transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Télécharger
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-[210mm] mx-auto p-4 sm:p-8">
        <div
          ref={printRef}
          className="bg-white shadow-lg relative"
          style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
        >
          {/* Filigrane visible sur l’écran */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] text-[120px] font-bold text-[#195885]/10 pointer-events-none select-none">
            PRO FORMA
          </div>

          {/* En-tête */}
          <div className="border-b-4 border-[#195885] pb-6 mb-6 relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-start mb-4 sm:mb-0">
                {settings.logo_url && (
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="w-16 h-16 object-contain mr-3"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-[#195885] mb-1">{settings.name}</h1>
                  <p className="text-sm text-gray-700">
                    Tél : {settings.phone1} / {settings.phone2}
                  </p>
                  <p className="text-sm text-gray-700">
                    N° CIP : {settings.cip_number} — Expire le : {formatCIPExpiry(settings.cip_expiry)}
                  </p>
                  <p className="text-sm text-gray-700">IFU : {settings.ifu}</p>
                  <p className="text-sm text-gray-700">Email : {settings.email}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-[#195885]">FACTURE PRO FORMA</h2>
                {settings.website && <p className="text-sm text-gray-600 mt-1">{settings.website}</p>}
              </div>
            </div>
          </div>

          {/* Client et détails */}
          <div className="flex flex-col sm:flex-row justify-between mb-8 relative z-10">
            <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Le Client</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-xl font-bold text-gray-900 mb-2">{invoice.client_name}</p>
                <p className="text-sm text-gray-700">{invoice.client_phone}</p>
                {invoice.client_email && <p className="text-sm text-gray-700">{invoice.client_email}</p>}
                {invoice.client_address && <p className="text-sm text-gray-700">{invoice.client_address}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://wa.me/22996346435`}
                alt="QR"
                className="w-24 h-24 mb-2"
              />
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  N° : <span className="font-bold">{invoice.invoice_number}</span>
                </p>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  {formatDate(invoice.invoice_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Tableau des articles */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-8 text-sm">
              <thead>
                <tr className="bg-[#195885] text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">N°</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Désignation</th>
                  <th className="border border-gray-300 px-4 py-3 text-center">Qté</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Prix</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-2">{i + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.designation}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      {item.unit_price.toFixed(0)} FCFA
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                      {item.total_amount.toFixed(0)} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="flex justify-end mb-6 relative z-10">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Montant Total</span>
                <span className="font-semibold">{invoice.subtotal.toFixed(0)} FCFA</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between py-2 text-orange-600">
                  <span>Réduction</span>
                  <span>-{invoice.discount_amount.toFixed(0)} FCFA</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between py-2">
                  <span>Tax {invoice.tax_percentage}%</span>
                  <span>{invoice.tax_amount.toFixed(0)} FCFA</span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-[#195885] text-white px-4 rounded mt-2">
                <span className="font-bold">Montant Total TTC :</span>
                <span className="font-bold text-lg">{invoice.total_amount.toFixed(0)} FCFA</span>
              </div>
            </div>
          </div>

          {/* Montant en lettres */}
          <p className="text-sm text-gray-700 italic mb-6">
            Montant en lettres :{' '}
            {numberToWordsFrench(parseFloat(invoice.total_amount.toString()))}
          </p>

          {/* Signature */}
          <div className="flex justify-end mt-10">
            <div className="text-right">
              <p className="italic text-sm text-gray-600 mb-1">{invoice.responsible_name}</p>
              <p className="font-bold text-sm text-gray-900">{invoice.responsible_name}</p>
              <p className="text-xs text-gray-600">Le responsable</p>
            </div>
          </div>

          {/* Pied de page */}
          <div className="border-t-4 border-[#195885] pt-4 mt-10 text-center text-xs text-gray-600">
            <p>{settings.phone1} / {settings.phone2} — {settings.email}</p>
            <p>{settings.address}</p>
            <p className="mt-1">
              Tous Travaux d'Affichage, Décoration, Sérigraphie et Fabrication de panneaux statiques
            </p>
          </div>
        </div>
      </div>

      {/* 🪟 Aperçu modal plein écran */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full h-[90vh] overflow-auto relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
            >
              Fermer
            </button>
            <div className="p-6">
              <div ref={printRef} className="scale-95 origin-top">
                {/* 👉 Le même contenu du document s’affiche ici (reprend celui ci-dessus) */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
