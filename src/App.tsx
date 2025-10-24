import { useState } from 'react';
import Dashboard from './components/Dashboard';
import CreateInvoice from './components/CreateInvoice';
import InvoicesList from './components/InvoicesList';
import ClientsList from './components/ClientsList';
import Settings from './components/Settings';

type Page = 'dashboard' | 'create-invoice' | 'invoices' | 'clients' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'create-invoice':
        return <CreateInvoice onNavigate={setCurrentPage} />;
      case 'invoices':
        return <InvoicesList onNavigate={setCurrentPage} />;
      case 'clients':
        return <ClientsList onNavigate={setCurrentPage} />;
      case 'settings':
        return <Settings onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return <div className="min-h-screen">{renderPage()}</div>;
}

export default App;
