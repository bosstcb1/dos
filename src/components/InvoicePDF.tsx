import { useRef } from "react";
import html2pdf from "html2pdf.js";
import QRCode from "qrcode";
import { Share2, Download } from "lucide-react";

export default function InvoicePDFShare() {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // --- Fonction de partage / téléchargement intelligent
  const handleShare = async () => {
    if (!invoiceRef.current) return;

    // --- Génération du QR Code WhatsApp
    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, "https://wa.me/+22996346435", {
      width: 100,
      color: { dark: "#195885", light: "#ffffff" },
    });

    // --- Clone du contenu pour éviter d’altérer le DOM original
    const clone = invoiceRef.current.cloneNode(true) as HTMLElement;

    // --- Ajout d’un filigrane "PRO FORMA"
    const watermark = document.createElement("div");
    watermark.textContent = "PRO FORMA";
    Object.assign(watermark.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-30deg)",
      fontSize: "110px",
      fontWeight: "700",
      color: "rgba(25, 88, 133, 0.08)",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      zIndex: "0",
    });
    clone.style.position = "relative";
    clone.appendChild(watermark);

    // --- Ajout du QR code sur le document
    qrCanvas.style.position = "absolute";
    qrCanvas.style.bottom = "20px";
    qrCanvas.style.right = "20px";
    qrCanvas.style.opacity = "0.9";
    clone.appendChild(qrCanvas);

    // --- Génération du PDF (en Blob)
    const pdfBlob = await html2pdf()
      .set({
        margin: 0.5,
        filename: "facture-proforma.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
      })
      .from(clone)
      .output("blob"); // ✅ Correct : output() et non outputPdf()

    const file = new File([pdfBlob], "facture-proforma.pdf", { type: "application/pdf" });

    // --- Partage via Web Share API si compatible
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Facture Pro Forma",
        text: "Voici la facture pro forma générée par GBEFFA REIS BE KOM.",
        files: [file],
      });
    } else {
      // --- Téléchargement automatique si partage impossible
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "facture-proforma.pdf";
      link.click();
      URL.revokeObjectURL(url);
      alert("Le partage n’est pas supporté sur ce navigateur. Le fichier a été téléchargé.");
    }
  };

  // --- Téléchargement direct sans partage
  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    const clone = invoiceRef.current.cloneNode(true) as HTMLElement;

    // --- Ajout du filigrane
    const watermark = document.createElement("div");
    watermark.textContent = "PRO FORMA";
    Object.assign(watermark.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-30deg)",
      fontSize: "110px",
      fontWeight: "700",
      color: "rgba(25, 88, 133, 0.08)",
      pointerEvents: "none",
      zIndex: "0",
    });
    clone.style.position = "relative";
    clone.appendChild(watermark);

    await html2pdf()
      .set({
        margin: 0.5,
        filename: "facture-proforma.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
      })
      .from(clone)
      .save();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div
        ref={invoiceRef}
        className="bg-white w-full max-w-[800px] p-10 rounded-2xl shadow-lg relative font-sans"
        id="invoice-content"
      >
        {/* --- En-tête --- */}
        <div className="flex justify-between items-center border-b-4 border-[#195885] pb-6 mb-6">
          <div className="flex items-center">
            <img
              src="https://i.imgur.com/lT8fSct.png"
              alt="Logo"
              className="w-16 h-16 object-contain mr-3"
            />
            <div>
              <h1 className="text-2xl font-bold text-[#195885]">GBEFFA REIS BE KOM</h1>
              <p className="text-sm text-gray-700">
                Tous Travaux d’Affichage, Décoration, Sérigraphie et Fabrication de panneaux statiques
              </p>
              <p className="text-sm text-gray-700 mt-1">Tél : 01 96 34 64 35 / 01 94 14 52 69</p>
              <p className="text-sm text-gray-700 mt-1">
                N° CIP : 8382792325 — Expire le : 31/12/2025
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold text-[#195885]">FACTURE PRO FORMA</h2>
            <p className="text-sm text-gray-600 mt-1">N° 00015</p>
            <p className="text-sm text-gray-600">Date : 24 Octobre 2025</p>
          </div>
        </div>

        {/* --- Détails du client --- */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Client</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-lg font-bold text-gray-900 mb-2">Entreprise Bénin Vision</p>
            <p className="text-sm text-gray-700">Tél : +229 97 22 33 44</p>
            <p className="text-sm text-gray-700">Email : contact@beninvision.com</p>
            <p className="text-sm text-gray-700">Adresse : Cotonou, Bénin</p>
          </div>
        </div>

        {/* --- Tableau des articles --- */}
        <table className="w-full border-collapse mb-6 text-sm">
          <thead>
            <tr className="bg-[#195885] text-white">
              <th className="px-4 py-2 border border-gray-300 text-left">#</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Désignation</th>
              <th className="px-4 py-2 border border-gray-300 text-center">Qté</th>
              <th className="px-4 py-2 border border-gray-300 text-right">Prix Unit.</th>
              <th className="px-4 py-2 border border-gray-300 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="px-4 py-2 border border-gray-300">1</td>
              <td className="px-4 py-2 border border-gray-300">Panneau publicitaire 3x2m</td>
              <td className="px-4 py-2 border border-gray-300 text-center">2</td>
              <td className="px-4 py-2 border border-gray-300 text-right">75 000</td>
              <td className="px-4 py-2 border border-gray-300 text-right">150 000</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border border-gray-300">2</td>
              <td className="px-4 py-2 border border-gray-300">Installation sur site</td>
              <td className="px-4 py-2 border border-gray-300 text-center">1</td>
              <td className="px-4 py-2 border border-gray-300 text-right">25 000</td>
              <td className="px-4 py-2 border border-gray-300 text-right">25 000</td>
            </tr>
          </tbody>
        </table>

        {/* --- Totaux --- */}
        <div className="flex justify-end mb-4">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1">
              <span>Sous-total</span>
              <span>175 000 FCFA</span>
            </div>
            <div className="flex justify-between py-1">
              <span>TVA (18%)</span>
              <span>31 500 FCFA</span>
            </div>
            <div className="flex justify-between py-2 bg-[#195885] text-white font-semibold rounded mt-2 px-3">
              <span>Total TTC</span>
              <span>206 500 FCFA</span>
            </div>
          </div>
        </div>

        {/* --- Signature --- */}
        <div className="mt-8 text-right">
          <p className="italic text-sm text-gray-600">Le Responsable</p>
          <p className="font-bold text-gray-900 mt-1">GBEFFA REIS</p>
        </div>

        {/* --- Pied de page --- */}
        <div className="border-t-4 border-[#195885] mt-10 pt-3 text-center text-xs text-gray-600">
          <p>
            {`Tél : 01 96 34 64 35 / 01 94 14 52 69 — Email : gbeffa@exemple.com`}
          </p>
          <p>{`Cotonou, Bénin — N° CIP : 8382792325`}</p>
        </div>
      </div>

      {/* --- Boutons d’action --- */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-[#195885] text-white px-6 py-3 rounded-lg hover:bg-[#144063] transition-all"
        >
          <Share2 className="w-5 h-5" />
          Partager la facture
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all"
        >
          <Download className="w-5 h-5" />
          Télécharger
        </button>
      </div>
    </div>
  );
}
