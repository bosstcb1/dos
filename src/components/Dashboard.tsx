import { useEffect, useState } from 'react';
import { FileText, Users, Settings, Plus, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalClients: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: invoices } = await supabase.from('invoices').select('total_amount');
    const { data: clients } = await supabase.from('clients').select('id');

    setStats({
      totalInvoices: invoices?.length || 0,
      totalAmount:
        invoices?.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0) || 0,
      totalClients: clients?.length || 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            GBEFFA REIS BE KOM
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Plateforme de Gestion de Factures Pro Forma
          </p>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard
            color="blue"
            icon={<FileText className="w-8 h-8 text-blue-600" />}
            label="Total Factures"
            value={stats.totalInvoices}
          />
          <StatCard
            color="green"
            icon={<DollarSign className="w-8 h-8 text-green-600" />}
            label="Montant Total"
            value={`${stats.totalAmount.toLocaleString()} FCFA`}
          />
          <StatCard
            color="orange"
            icon={<Users className="w-8 h-8 text-orange-600" />}
            label="Nombre de Clients"
            value={stats.totalClients}
          />
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            color="blue"
            icon={<Plus className="w-12 h-12 mb-3" />}
            title="Nouvelle Facture"
            subtitle="Créer une facture pro forma"
            onClick={() => onNavigate('create-invoice')}
          />
          <ActionCard
            color="green"
            icon={<FileText className="w-12 h-12 mb-3" />}
            title="Toutes les Factures"
            subtitle="Voir l'historique"
            onClick={() => onNavigate('invoices')}
          />
          <ActionCard
            color="yellow"
            icon={<Users className="w-12 h-12 mb-3" />}
            title="Clients"
            subtitle="Gérer les clients"
            onClick={() => onNavigate('clients')}
          />
          <ActionCard
            color="red"
            icon={<Settings className="w-12 h-12 mb-3" />}
            title="Paramètres"
            subtitle="Configuration entreprise"
            onClick={() => onNavigate('settings')}
          />
        </div>
      </div>
    </div>
  );
}

/* ---- COMPOSANTS RÉUTILISABLES ---- */

function StatCard({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  const borderColors: Record<string, string> = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    orange: 'border-orange-500 bg-orange-50',
  };

  return (
    <div
      className={`rounded-xl border-l-4 ${borderColors[color]} shadow-md p-5 flex items-center justify-between transition-transform hover:scale-[1.02]`}
    >
      <div>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-3 bg-white rounded-lg shadow-inner">{icon}</div>
    </div>
  );
}

function ActionCard({
  color,
  icon,
  title,
  subtitle,
  onClick,
}: {
  color: 'blue' | 'green' | 'yellow' | 'red';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-500 hover:bg-green-600 text-white',
    yellow: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900',
    red: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`${bgColors[color]} rounded-2xl shadow-lg p-8 text-center transition-all transform hover:scale-105 active:scale-95 focus:outline-none`}
    >
      <div className="flex flex-col items-center justify-center">
        {icon}
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-sm opacity-80">{subtitle}</p>
      </div>
    </button>
  );
}
