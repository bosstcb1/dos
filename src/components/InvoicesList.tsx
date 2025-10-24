import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Search, Trash2 } from 'lucide-react';
import { supabase, Invoice, CompanySettings } from '../lib/supabase';
import InvoicePDF from './InvoicePDF';

interface InvoicesListProps {
  onNavigate: (page: string) => void;
}

export default function InvoicesList({ onNavigate }: InvoicesListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    loadInvoices();
    loadSettings();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, invoices]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .maybeSingle();
    if (data) setSettings(data);
  };

  const loadInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setInvoices(data);
      setFilteredInvoices(data);
    }
  };

  const filterInvoices = () => {
    if (!searchTerm) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter(inv =>
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client_phone.includes(searchTerm)
    );

    setFilteredInvoices(filtered);
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (!error) {
      loadInvoices();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (selectedInvoice && settings) {
    return (
      <InvoicePDF
        invoiceId={selectedInvoice}
        settings={settings}
        onClose={() => setSelectedInvoice(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-[#195885] hover:text-[#134266] font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Toutes les Factures</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par numéro, nom de client ou téléphone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm ? 'Aucune facture trouvée' : 'Aucune facture créée'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#195885] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">N° Facture</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Téléphone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Montant Total</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <tr
                      key={invoice.id}
                      className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#195885]">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.client_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {invoice.client_phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                        {parseFloat(invoice.total_amount.toString()).toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => setSelectedInvoice(invoice.id)}
                            className="text-[#195885] hover:text-[#134266] transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-600">
          Total: {filteredInvoices.length} facture(s)
        </div>
      </div>
    </div>
  );
}