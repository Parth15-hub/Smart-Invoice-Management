import { useEffect, useMemo, useState } from "react";

import {
  getInvoices,
  createInvoice,
  deleteInvoice,
  updateInvoiceStatus,
} from "./services/invoiceService";

function App() {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    invoiceDate: "",
    dueDate: "",
    amount: "",
    status: "Pending",
    description: "",
  });

  useEffect(() => {
    document.title = "Smart Invoice Management System";
    loadInvoices();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await getInvoices();
      setInvoices(response.data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast("Backend not connected. Please check Spring Boot server.");
    } finally {
      setLoading(false);
    }
  };

  const formatInvoiceId = (id) => `INV-${String(id).padStart(3, "0")}`;

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const filteredInvoices = invoices.filter((invoice) => {
    const invoiceCode = formatInvoiceId(invoice.id);

    const matchesSearch =
      invoice.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      invoiceCode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((i) => i.status === "Paid").length;
    const pendingInvoices = invoices.filter((i) => i.status === "Pending").length;
    const overdueInvoices = invoices.filter((i) => i.status === "Overdue").length;

    const totalRevenue = invoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
    };
  }, [invoices]);

  const resetForm = () => {
    setForm({
      clientName: "",
      clientEmail: "",
      invoiceDate: "",
      dueDate: "",
      amount: "",
      status: "Pending",
      description: "",
    });
  };

  const handleCreateInvoice = async (e) => {
  e.preventDefault();

  if (
    !form.clientName ||
    !form.clientEmail ||
    !form.invoiceDate ||
    !form.dueDate ||
    !form.amount
  ) {
    showToast("Please fill all required fields.");
    return;
  }

  const invoiceData = {
    clientName: form.clientName.trim(),
    clientEmail: form.clientEmail.trim(),
    invoiceDate: form.invoiceDate,
    dueDate: form.dueDate,
    amount: Number(form.amount),
    status: form.status || "Pending",
    description: form.description.trim(),
  };

  console.log("Sending invoice data:", invoiceData);

  try {
    const response = await createInvoice(invoiceData);
    console.log("Invoice created:", response.data);

    resetForm();
    await loadInvoices();
    setPage("invoices");
    showToast("Invoice created successfully.");
  } catch (error) {
    console.error("Full create invoice error:", error);
    console.error("Backend response:", error.response?.data);

    showToast(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create invoice. Check backend console."
    );
  }
};

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) return;

    try {
      await deleteInvoice(id);
      await loadInvoices();
      showToast("Invoice deleted successfully.");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      showToast("Failed to delete invoice.");
    }
  };

  const markAsPaid = async (id) => {
    try {
      await updateInvoiceStatus(id, "Paid");
      await loadInvoices();

      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice({ ...selectedInvoice, status: "Paid" });
      }

      showToast("Invoice marked as paid.");
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update invoice status.");
    }
  };

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setPage("details");
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon">₹</div>
          <div>
            <h2>InvoiceIQ</h2>
            <p>Smart Invoice System</p>
          </div>
        </div>

        <nav>
          <button
            className={page === "dashboard" ? "navBtn active" : "navBtn"}
            onClick={() => setPage("dashboard")}
          >
            <span>📊</span> Dashboard
          </button>

          <button
            className={page === "invoices" ? "navBtn active" : "navBtn"}
            onClick={() => setPage("invoices")}
          >
            <span>📄</span> Invoices
          </button>

          <button
            className={page === "create" ? "navBtn active" : "navBtn"}
            onClick={() => setPage("create")}
          >
            <span>➕</span> Create Invoice
          </button>
        </nav>

        <div className="apiBox">
          <span className="dot"></span>
          <span>Backend Connected</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>
            {page === "dashboard" && "Dashboard"}
            {page === "invoices" && "Invoice Management"}
            {page === "create" && "Create Invoice"}
            {page === "details" && "Invoice Details"}
          </h1>
        </header>

        {loading && (
          <div className="loadingBox">
            <p>Loading invoices...</p>
          </div>
        )}

        {!loading && page === "dashboard" && (
          <section className="content">
            <div className="statsGrid">
              <StatCard title="Total Invoices" value={stats.totalInvoices} />
              <StatCard title="Paid Invoices" value={stats.paidInvoices} />
              <StatCard title="Pending Invoices" value={stats.pendingInvoices} />
              <StatCard title="Overdue Invoices" value={stats.overdueInvoices} />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
              />
            </div>

            <div className="visualGrid">
              <div className="card">
                <div className="cardHeader">
                  <h2>Status Overview</h2>
                </div>

                <div className="statusOverview">
                  <ProgressRow
                    label="Paid"
                    value={stats.paidInvoices}
                    total={stats.totalInvoices}
                    type="Paid"
                  />
                  <ProgressRow
                    label="Pending"
                    value={stats.pendingInvoices}
                    total={stats.totalInvoices}
                    type="Pending"
                  />
                  <ProgressRow
                    label="Overdue"
                    value={stats.overdueInvoices}
                    total={stats.totalInvoices}
                    type="Overdue"
                  />
                </div>
              </div>

              <div className="card">
                <div className="cardHeader">
                  <h2>Revenue Summary</h2>
                </div>

                <div className="revenueBox">
                  <p>Paid Revenue</p>
                  <h3>{formatCurrency(stats.totalRevenue)}</h3>
                  <span>
                    Revenue is calculated only from invoices marked as paid.
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="cardHeader">
                <h2>Recent Invoices</h2>
                <button className="primaryBtn" onClick={() => setPage("invoices")}>
                  View All
                </button>
              </div>

              <InvoiceTable
                invoices={invoices.slice(0, 5)}
                onView={viewInvoice}
                onDelete={handleDelete}
                onPaid={markAsPaid}
                formatInvoiceId={formatInvoiceId}
                formatCurrency={formatCurrency}
              />
            </div>
          </section>
        )}

        {!loading && page === "invoices" && (
          <section className="content">
            <div className="toolbar">
              <input
                type="text"
                placeholder="Search by client name or invoice ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>

              <button className="primaryBtn" onClick={() => setPage("create")}>
                + New Invoice
              </button>
            </div>

            <div className="card">
              <InvoiceTable
                invoices={filteredInvoices}
                onView={viewInvoice}
                onDelete={handleDelete}
                onPaid={markAsPaid}
                formatInvoiceId={formatInvoiceId}
                formatCurrency={formatCurrency}
              />
            </div>
          </section>
        )}

        {!loading && page === "create" && (
          <section className="content">
            <div className="formCard">
              <h2>Create New Invoice</h2>

              <form onSubmit={handleCreateInvoice}>
                <div className="formGrid">
                  <label>
                    Client Name
                    <input
                      type="text"
                      value={form.clientName}
                      onChange={(e) =>
                        setForm({ ...form, clientName: e.target.value })
                      }
                      placeholder="Enter client name"
                    />
                  </label>

                  <label>
                    Client Email
                    <input
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) =>
                        setForm({ ...form, clientEmail: e.target.value })
                      }
                      placeholder="Enter client email"
                    />
                  </label>

                  <label>
                    Invoice Date
                    <input
                      type="date"
                      value={form.invoiceDate}
                      onChange={(e) =>
                        setForm({ ...form, invoiceDate: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Due Date
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  </label>

                  <label>
                    Amount
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                    >
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Overdue</option>
                    </select>
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Enter invoice description"
                  ></textarea>
                </label>

                <div className="formActions">
                  <button
                    type="button"
                    className="secondaryBtn"
                    onClick={() => setPage("invoices")}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="primaryBtn">
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {!loading && page === "details" && selectedInvoice && (
          <section className="content">
            <button className="backBtn" onClick={() => setPage("invoices")}>
              ← Back to Invoices
            </button>

            <div className="invoiceBox">
              <div className="invoiceHeader">
                <div>
                  <h2>InvoiceIQ Solutions</h2>
                  <p>Pune, Maharashtra</p>
                  <p>contact@invoiceiq.in</p>
                </div>

                <div className="invoiceTitle">
                  INVOICE
                  <span>{formatInvoiceId(selectedInvoice.id)}</span>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              <div className="invoiceInfo">
                <p>
                  Bill To
                  <strong>{selectedInvoice.clientName}</strong>
                  <strong>{selectedInvoice.clientEmail}</strong>
                </p>

                <p>
                  Invoice Date
                  <strong>{selectedInvoice.invoiceDate}</strong>
                </p>

                <p>
                  Due Date
                  <strong>{selectedInvoice.dueDate}</strong>
                </p>

                <p>
                  Status
                  <strong>{selectedInvoice.status}</strong>
                </p>
              </div>

              <table className="invoiceDetailTable">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>{selectedInvoice.description || "Invoice service"}</td>
                    <td>{formatCurrency(selectedInvoice.amount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="totalBox">
                <div>
                  <p>Total Amount</p>
                  <h3>{formatCurrency(selectedInvoice.amount)}</h3>
                </div>
              </div>

              <div className="formActions noPrint">
                {selectedInvoice.status !== "Paid" && (
                  <button
                    className="successBtn"
                    onClick={() => markAsPaid(selectedInvoice.id)}
                  >
                    Mark as Paid
                  </button>
                )}

                <button className="primaryBtn" onClick={printInvoice}>
                  Download / Print PDF
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --navy-950: #0a0f1e;
  --navy-900: #0d1424;
  --navy-800: #111827;
  --navy-700: #1a2235;
  --navy-600: #1e293b;
  --navy-500: #334155;

  --blue-600: #2563eb;
  --blue-500: #3b82f6;
  --blue-400: #60a5fa;
  --blue-100: #dbeafe;
  --blue-50:  #eff6ff;

  --green-600: #16a34a;
  --green-500: #22c55e;
  --green-100: #dcfce7;
  --green-50:  #f0fdf4;

  --yellow-600: #ca8a04;
  --yellow-500: #eab308;
  --yellow-100: #fef9c3;
  --yellow-50:  #fefce8;

  --red-600: #dc2626;
  --red-500: #ef4444;
  --red-100: #fee2e2;
  --red-50:  #fef2f2;

  --gray-900: #111827;
  --gray-800: #1f2937;
  --gray-700: #374151;
  --gray-600: #4b5563;
  --gray-500: #6b7280;
  --gray-400: #9ca3af;
  --gray-300: #d1d5db;
  --gray-200: #e5e7eb;
  --gray-100: #f3f4f6;
  --gray-50:  #f9fafb;
  --white:    #ffffff;

  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  14px;
  --radius-xl:  20px;

  --shadow-sm:  0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04);
  --shadow-lg:  0 10px 30px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.05);
  --shadow-card: 0 1px 4px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);

  --transition: 180ms ease;
  --font: 'DM Sans', sans-serif;
  --mono: 'DM Mono', monospace;
}

body {
  font-family: var(--font);
  background: var(--gray-50);
  color: var(--gray-900);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.app {
  display: flex;
  min-height: 100vh;
}

.toast {
  position: fixed;
  top: 18px;
  right: 24px;
  z-index: 9999;
  background: var(--navy-900);
  color: var(--white);
  padding: 12px 18px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: 13.5px;
  font-weight: 600;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--navy-900);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  border-right: 1px solid rgba(255,255,255,.04);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 28px;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.brandIcon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--blue-600), var(--blue-400));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(37,99,235,.4);
}

.brand h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--white);
  letter-spacing: -.3px;
}

.brand p {
  font-size: 11px;
  color: rgba(255,255,255,.4);
  font-weight: 400;
  margin-top: 1px;
}

nav {
  padding: 16px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.navBtn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: rgba(255,255,255,.55);
  font-family: var(--font);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background var(--transition), color var(--transition);
}

.navBtn:hover {
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.85);
}

.navBtn.active {
  background: var(--blue-600);
  color: var(--white);
  box-shadow: 0 2px 8px rgba(37,99,235,.35);
}

.apiBox {
  margin: 12px;
  padding: 10px 14px;
  background: rgba(255,255,255,.04);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,.07);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255,255,255,.5);
  font-weight: 500;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-500);
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(34,197,94,.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .5; }
}

.main {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  padding: 18px 32px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -.4px;
}

.content {
  padding: 32px;
  flex: 1;
}

.loadingBox {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--gray-500);
  font-size: 14px;
  gap: 10px;
}

.loadingBox::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-200);
  border-top-color: var(--blue-600);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.statCard {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--gray-200);
  transition: transform var(--transition), box-shadow var(--transition);
  position: relative;
  overflow: hidden;
}

.statCard::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--blue-600), var(--blue-400));
  opacity: 0;
  transition: opacity var(--transition);
}

.statCard:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.statCard:hover::before {
  opacity: 1;
}

.statCard p {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: .6px;
  margin-bottom: 10px;
}

.statCard h3 {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -1px;
  line-height: 1;
}

.visualGrid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 28px;
}

.statusOverview {
  padding: 24px;
}

.progressRow {
  margin-bottom: 20px;
}

.progressTop {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
}

.progressTrack {
  height: 9px;
  background: var(--gray-100);
  border-radius: 999px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  border-radius: 999px;
}

.progressFill.Paid {
  background: var(--green-500);
}

.progressFill.Pending {
  background: var(--yellow-500);
}

.progressFill.Overdue {
  background: var(--red-500);
}

.revenueBox {
  padding: 28px;
}

.revenueBox p {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.revenueBox h3 {
  font-size: 34px;
  color: var(--blue-600);
  letter-spacing: -1px;
  margin-bottom: 8px;
}

.revenueBox span {
  font-size: 13px;
  color: var(--gray-500);
}

.card {
  background: var(--white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.cardHeader {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cardHeader h2,
.cardHeader h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -.2px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar input,
.toolbar select {
  padding: 9px 14px;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-family: var(--font);
  font-size: 13.5px;
  color: var(--gray-800);
  background: var(--white);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.toolbar input { flex: 1; min-width: 200px; }
.toolbar select { min-width: 130px; }

.toolbar input:focus,
.toolbar select:focus {
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px rgba(59,130,246,.12);
}

.primaryBtn, .secondaryBtn, .dangerBtn, .successBtn, .backBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: var(--radius-md);
  border: none;
  font-family: var(--font);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition);
  letter-spacing: -.1px;
}

.primaryBtn {
  background: var(--blue-600);
  color: var(--white);
  box-shadow: 0 2px 6px rgba(37,99,235,.3);
}
.primaryBtn:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37,99,235,.4);
  transform: translateY(-1px);
}

.secondaryBtn {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1.5px solid var(--gray-200);
}
.secondaryBtn:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}

.dangerBtn {
  background: var(--red-50);
  color: var(--red-600);
  border: 1.5px solid var(--red-100);
}
.dangerBtn:hover {
  background: var(--red-100);
  border-color: var(--red-500);
}

.successBtn {
  background: var(--green-50);
  color: var(--green-600);
  border: 1.5px solid var(--green-100);
}
.successBtn:hover {
  background: var(--green-100);
  border-color: var(--green-500);
}

.backBtn {
  background: transparent;
  color: var(--gray-600);
  border: 1.5px solid var(--gray-200);
  padding: 8px 14px;
  margin-bottom: 18px;
}
.backBtn:hover {
  background: var(--gray-50);
  color: var(--gray-900);
  border-color: var(--gray-300);
}

.smallBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: var(--radius-sm);
  border: 1.5px solid transparent;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.smallBtn.view {
  background: var(--blue-50);
  color: var(--blue-600);
  border-color: var(--blue-100);
}
.smallBtn.view:hover {
  background: var(--blue-100);
  border-color: var(--blue-400);
}

.smallBtn.paid {
  background: var(--green-50);
  color: var(--green-600);
  border-color: var(--green-100);
}
.smallBtn.paid:hover {
  background: var(--green-100);
  border-color: var(--green-500);
}

.smallBtn.delete {
  background: var(--red-50);
  color: var(--red-600);
  border-color: var(--red-100);
}
.smallBtn.delete:hover {
  background: var(--red-100);
  border-color: var(--red-500);
}

.actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: .2px;
  white-space: nowrap;
}

.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge.Paid {
  background: var(--green-100);
  color: var(--green-600);
}
.badge.Paid::before { background: var(--green-500); }

.badge.Pending {
  background: var(--yellow-100);
  color: var(--yellow-600);
}
.badge.Pending::before { background: var(--yellow-500); }

.badge.Overdue {
  background: var(--red-100);
  color: var(--red-600);
}
.badge.Overdue::before { background: var(--red-500); }

.card table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.card table thead tr {
  background: var(--gray-50);
  border-bottom: 1.5px solid var(--gray-200);
}

.card table thead th {
  padding: 11px 20px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: .5px;
  white-space: nowrap;
}

.card table tbody tr {
  border-bottom: 1px solid var(--gray-100);
  transition: background var(--transition);
}

.card table tbody tr:last-child { border-bottom: none; }

.card table tbody tr:hover { background: var(--blue-50); }

.card table tbody td {
  padding: 14px 20px;
  color: var(--gray-700);
  vertical-align: middle;
}

.card table tbody td:first-child {
  font-weight: 600;
  color: var(--gray-900);
  font-family: var(--mono);
  font-size: 12.5px;
}

.card table tbody td[colspan] {
  text-align: center;
  color: var(--gray-400);
  padding: 48px 20px;
  font-size: 14px;
}

.card > p,
.card > div > p {
  text-align: center;
  color: var(--gray-400);
  padding: 48px 20px;
  font-size: 14px;
}

.formCard {
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-lg);
  padding: 36px 40px;
  max-width: 760px;
  margin: 0 auto;
}

.formCard h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -.4px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gray-100);
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
  margin-bottom: 20px;
}

.formGrid label,
.formCard label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  letter-spacing: -.1px;
}

.formGrid input,
.formGrid select,
.formGrid textarea,
.formCard input,
.formCard select,
.formCard textarea {
  padding: 10px 14px;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-family: var(--font);
  font-size: 14px;
  color: var(--gray-800);
  background: var(--gray-50);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}

.formGrid input:focus,
.formGrid select:focus,
.formGrid textarea:focus,
.formCard input:focus,
.formCard select:focus,
.formCard textarea:focus {
  border-color: var(--blue-500);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(59,130,246,.12);
}

.formGrid textarea,
.formCard textarea {
  resize: vertical;
  min-height: 100px;
}

.formActions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--gray-100);
  margin-top: 8px;
}

.invoiceBox {
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-lg);
  padding: 48px 52px;
  max-width: 820px;
  margin: 0 auto;
}

.invoiceHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--gray-100);
}

.invoiceHeader h2 {
  font-size: 22px;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.invoiceHeader p {
  color: var(--gray-600);
  font-size: 14px;
}

.invoiceTitle {
  font-size: 36px;
  font-weight: 800;
  color: var(--blue-600);
  letter-spacing: -1.5px;
  line-height: 1.1;
  text-align: right;
}

.invoiceTitle span {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-400);
  letter-spacing: .8px;
  text-transform: uppercase;
  margin-top: 6px;
  margin-bottom: 10px;
}

.invoiceInfo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 32px;
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid var(--gray-200);
}

.invoiceInfo p {
  font-size: 13px;
  color: var(--gray-500);
}

.invoiceInfo p strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  margin-top: 2px;
}

.invoiceDetailTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-bottom: 24px;
}

.invoiceDetailTable thead tr {
  background: var(--navy-900);
}

.invoiceDetailTable thead th {
  padding: 13px 18px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255,255,255,.7);
  text-transform: uppercase;
  letter-spacing: .5px;
}

.invoiceDetailTable thead th:last-child { text-align: right; }

.invoiceDetailTable tbody tr {
  border-bottom: 1px solid var(--gray-100);
}

.invoiceDetailTable tbody td {
  padding: 14px 18px;
  color: var(--gray-700);
}

.invoiceDetailTable tbody td:last-child {
  text-align: right;
  font-weight: 600;
  color: var(--gray-900);
}

.totalBox {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 32px;
}

.totalBox > div {
  background: var(--blue-600);
  color: var(--white);
  border-radius: var(--radius-lg);
  padding: 20px 28px;
  min-width: 220px;
  text-align: right;
}

.totalBox p {
  font-size: 12px;
  font-weight: 600;
  opacity: .75;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 4px;
}

.totalBox h3 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
}

@media (max-width: 900px) {
  .sidebar {
    width: 200px;
  }
  .main {
    margin-left: 200px;
  }
  .content {
    padding: 20px;
  }
  .formCard {
    padding: 24px 20px;
  }
  .invoiceBox {
    padding: 28px 20px;
  }
  .visualGrid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .sidebar {
    width: 60px;
  }
  .sidebar .brand h2,
  .sidebar .brand p,
  .navBtn span,
  .apiBox span {
    display: none;
  }
  .brand { padding: 16px 11px; }
  .navBtn { justify-content: center; padding: 12px; }
  .apiBox { justify-content: center; }
  .main { margin-left: 60px; }
  .statsGrid { grid-template-columns: 1fr; }
  .formGrid { grid-template-columns: 1fr; }
  .invoiceInfo { grid-template-columns: 1fr; }
  .invoiceHeader { flex-direction: column; gap: 16px; }
  .invoiceTitle { text-align: left; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .toolbar input { min-width: 0; }
}

@media print {
  .noPrint, .sidebar, .topbar, .toolbar, .backBtn, .actions, .toast { display: none !important; }
  .main { margin-left: 0 !important; }
  .content { padding: 0 !important; }
  .invoiceBox {
    box-shadow: none;
    border: none;
    border-radius: 0;
    padding: 20px;
    max-width: 100%;
  }
  .invoiceDetailTable thead tr {
    background: #111827 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .totalBox > div {
    background: #2563eb !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { background: white; }
}
      `}</style>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="statCard">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

function ProgressRow({ label, value, total, type }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="progressRow">
      <div className="progressTop">
        <span>{label}</span>
        <span>
          {value} / {total} ({percentage}%)
        </span>
      </div>
      <div className="progressTrack">
        <div
          className={`progressFill ${type}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{status}</span>;
}

function InvoiceTable({
  invoices,
  onView,
  onDelete,
  onPaid,
  formatInvoiceId,
  formatCurrency,
}) {
  if (invoices.length === 0) {
    return <p>No invoices found. Create your first invoice.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Client Name</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{formatInvoiceId(invoice.id)}</td>
              <td>
                <strong>{invoice.clientName}</strong>
                <br />
                <small>{invoice.clientEmail}</small>
              </td>
              <td>{invoice.invoiceDate}</td>
              <td>{invoice.dueDate}</td>
              <td>{formatCurrency(invoice.amount)}</td>
              <td>
                <StatusBadge status={invoice.status} />
              </td>
              <td>
                <div className="actions">
                  <button className="smallBtn view" onClick={() => onView(invoice)}>
                    View
                  </button>

                  {invoice.status !== "Paid" && (
                    <button
                      className="smallBtn paid"
                      onClick={() => onPaid(invoice.id)}
                    >
                      Paid
                    </button>
                  )}

                  <button
                    className="smallBtn delete"
                    onClick={() => onDelete(invoice.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;