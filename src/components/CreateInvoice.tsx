import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Download } from 'lucide-react';
import { supabase, CompanySettings, Client } from '../lib/supabase';
import { numberToWordsFrench } from '../utils/numberToWords';
import InvoicePDF from './InvoicePDF';

interface InvoiceItem {
  id: string;
  designation: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

interface CreateInvoiceProps {
  onNavigate: (page: string) => void;
}

export default function CreateInvoice({ onNavigate }: CreateInvoiceProps) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');

  const [invoiceData, setInvoiceData] = useState({
    invoice_number: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    invoice_date: new Date().toISOString().split('T')[0],
    tax_percentage: 18,
    apply_tax: true,
    discount_type: '' as '' | 'fixed' | 'percentage',
    discount_value: 0,
    payment_terms: '',
    responsible_name: 'Komla DOS-REIS'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', designation: '', quantity: 1, unit_price: 0, total_amount: 0 }
  ]);

  const [showPDF, setShowPDF] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadClients();
    generateInvoiceNumber();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('company_settings')
      .select('*')
      .maybeSingle();
    if (data) setSettings(data);
  };

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    if (data) setClients(data);
  };

  const generateInvoiceNumber = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (data?.invoice_number) {
      const match = data.invoice_number.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    setInvoiceData(prev => ({
      ...prev,
      invoice_number: `INV-${String(nextNumber).padStart(5, '0')}`
    }));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setInvoiceData(prev => ({
        ...prev,
        client_name: client.name,
        client_phone: client.phone,
        client_email: client.email || '',
        client_address: client.address || ''
      }));
    }
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      designation: '',
      quantity: 1,
      unit_price: 0,
      total_amount: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total_amount = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total_amount, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (invoiceData.discount_type === 'fixed') {
      return invoiceData.discount_value;
    } else if (invoiceData.discount_type === 'percentage') {
      return (subtotal * invoiceData.discount_value) / 100;
    }
    return 0;
  };

  const calculateTax = () => {
    if (!invoiceData.apply_tax) return 0;
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * invoiceData.tax_percentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const saveInvoice = async () => {
    if (!invoiceData.client_name || !invoiceData.client_phone) {
      alert('Veuillez remplir les informations du client');
      return;
    }

    if (items.some(item => !item.designation || item.quantity <= 0 || item.unit_price <= 0)) {
      alert('Veuillez remplir tous les articles correctement');
      return;
    }

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const total = calculateTotal();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceData.invoice_number,
        client_id: selectedClient || null,
        client_name: invoiceData.client_name,
        client_phone: invoiceData.client_phone,
        client_email: invoiceData.client_email,
        client_address: invoiceData.client_address,
        invoice_date: invoiceData.invoice_date,
        subtotal,
        tax_percentage: invoiceData.tax_percentage,
        tax_amount: tax,
        discount_type: invoiceData.discount_type || null,
        discount_value: invoiceData.discount_value,
        discount_amount: discount,
        total_amount: total,
        payment_terms: invoiceData.payment_terms,
        responsible_name: invoiceData.responsible_name
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      alert('Erreur lors de la sauvegarde de la facture');
      return;
    }

    const itemsToInsert = items.map((item, index) => ({
      invoice_id: invoice.id,
      designation: item.designation,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_amount: item.total_amount,
      order_index: index
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      alert('Erreur lors de la sauvegarde des articles');
      return;
    }

    if (!selectedClient && invoiceData.client_name && invoiceData.client_phone) {
      await supabase.from('clients').insert({
        name: invoiceData.client_name,
        phone: invoiceData.client_phone,
        email: invoiceData.client_email || null,
        address: invoiceData.client_address || null
      });
    }

    setSavedInvoiceId(invoice.id);
    setShowPDF(true);
  };

  if (showPDF && savedInvoiceId && settings) {
    return (
      <InvoicePDF
        invoiceId={savedInvoiceId}
        settings={settings}
        onClose={() => {
          setShowPDF(false);
          onNavigate('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-[#195885] hover:text-[#134266] font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Facture Pro Forma</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de facture</label>
              <input
                type="text"
                value={invoiceData.invoice_number}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de facturation</label>
              <input
                type="date"
                value={invoiceData.invoice_date}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoice_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du client</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un client existant (optionnel)</label>
              <select
                value={selectedClient}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
              >
                <option value="">-- Nouveau client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={invoiceData.client_name}
                  onChange={(e) => setInvoiceData({ ...invoiceData, client_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="text"
                  value={invoiceData.client_phone}
                  onChange={(e) => setInvoiceData({ ...invoiceData, client_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={invoiceData.client_email}
                  onChange={(e) => setInvoiceData({ ...invoiceData, client_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={invoiceData.client_address}
                  onChange={(e) => setInvoiceData({ ...invoiceData, client_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Articles</h2>
              <button
                onClick={addItem}
                className="flex items-center bg-[#195885] text-white px-4 py-2 rounded-lg hover:bg-[#134266] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un article
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#195885] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Désignation</th>
                    <th className="px-4 py-3 text-left w-24">Quantité</th>
                    <th className="px-4 py-3 text-left w-32">Prix unitaire</th>
                    <th className="px-4 py-3 text-left w-32">Montant</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.designation}
                          onChange={(e) => updateItem(item.id, 'designation', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          placeholder="Description de l'article"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {item.total_amount.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Options de facturation</h3>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={invoiceData.apply_tax}
                    onChange={(e) => setInvoiceData({ ...invoiceData, apply_tax: e.target.checked })}
                    className="w-4 h-4 text-[#195885] rounded focus:ring-[#195885]"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Appliquer la TVA</span>
                </label>
              </div>

              {invoiceData.apply_tax && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pourcentage TVA (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={invoiceData.tax_percentage}
                    onChange={(e) => setInvoiceData({ ...invoiceData, tax_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de réduction</label>
                <select
                  value={invoiceData.discount_type}
                  onChange={(e) => setInvoiceData({ ...invoiceData, discount_type: e.target.value as '' | 'fixed' | 'percentage' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                >
                  <option value="">Aucune réduction</option>
                  <option value="fixed">Montant fixe</option>
                  <option value="percentage">Pourcentage</option>
                </select>
              </div>

              {invoiceData.discount_type && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur de la réduction {invoiceData.discount_type === 'percentage' ? '(%)' : '(FCFA)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceData.discount_value}
                    onChange={(e) => setInvoiceData({ ...invoiceData, discount_value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition de paiement</label>
                <textarea
                  value={invoiceData.payment_terms}
                  onChange={(e) => setInvoiceData({ ...invoiceData, payment_terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                  placeholder="Ex: Paiement à 30 jours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du responsable</label>
                <input
                  type="text"
                  value={invoiceData.responsible_name}
                  onChange={(e) => setInvoiceData({ ...invoiceData, responsible_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#195885] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total:</span>
                  <span className="font-semibold">{calculateSubtotal().toLocaleString()} FCFA</span>
                </div>

                {invoiceData.discount_type && (
                  <div className="flex justify-between text-orange-600">
                    <span>Réduction:</span>
                    <span className="font-semibold">-{calculateDiscount().toLocaleString()} FCFA</span>
                  </div>
                )}

                {invoiceData.apply_tax && (
                  <div className="flex justify-between text-gray-700">
                    <span>TVA ({invoiceData.tax_percentage}%):</span>
                    <span className="font-semibold">{calculateTax().toLocaleString()} FCFA</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-xl font-bold text-[#195885]">
                  <span>Total:</span>
                  <span>{calculateTotal().toLocaleString()} FCFA</span>
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <p className="text-sm text-gray-600 font-medium">Montant en lettres:</p>
                  <p className="text-sm text-gray-800 mt-1 italic">{numberToWordsFrench(calculateTotal())}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={saveInvoice}
            className="w-full bg-[#195885] text-white px-6 py-4 rounded-lg hover:bg-[#134266] transition-colors flex items-center justify-center text-lg font-semibold"
          >
            <Download className="w-6 h-6 mr-2" />
            Enregistrer et télécharger en PDF
          </button>
        </div>
      </div>
    </div>
  );
}