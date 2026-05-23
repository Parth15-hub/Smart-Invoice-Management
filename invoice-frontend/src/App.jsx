import { useEffect, useMemo, useState } from "react";

const initialInvoices = [
  {
    id: "INV-001",
    clientName: "Acme Corp",
    clientEmail: "billing@acme.com",
    invoiceDate: "2026-05-01",
    dueDate: "2026-05-20",
    amount: 45000,
    status: "Paid",
    description: "Website development service",
  },
  {
    id: "INV-002",
    clientName: "NovaTech Solutions",
    clientEmail: "accounts@novatech.com",
    invoiceDate: "2026-05-05",
    dueDate: "2026-05-25",
    amount: 32000,
    status: "Pending",
    description: "Backend API development",
  },
  {
    id: "INV-003",
    clientName: "BlueSky Ventures",
    clientEmail: "finance@bluesky.com",
    invoiceDate: "2026-04-10",
    dueDate: "2026-04-30",
    amount: 28000,
    status: "Overdue",
    description: "Invoice automation dashboard",
  },
];

function App() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [page, setPage] = useState("dashboard");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName.toLowerCase().includes(search.toLowerCase()) ||
      invoice.id.toLowerCase().includes(search.toLowerCase());

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
      .reduce((sum, i) => sum + Number(i.amount), 0);

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

  const handleCreateInvoice = (e) => {
    e.preventDefault();

    if (
      !form.clientName ||
      !form.clientEmail ||
      !form.invoiceDate ||
      !form.dueDate ||
      !form.amount
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newInvoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      amount: Number(form.amount),
      status: form.status,
      description: form.description,
    };

    setInvoices([...invoices, newInvoice]);
    resetForm();
    setPage("invoices");
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this invoice?");
    if (confirmDelete) {
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
    }
  };

  const markAsPaid = (id) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status: "Paid" } : invoice
      )
    );
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
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon">₹</div>
          <div>
            <h2>InvoiceIQ</h2>
            <p>Smart Invoice System</p>
          </div>
        </div>

        <button
          className={page === "dashboard" ? "navBtn active" : "navBtn"}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "invoices" ? "navBtn active" : "navBtn"}
          onClick={() => setPage("invoices")}
        >
          Invoices
        </button>

        <button
          className={page === "create" ? "navBtn active" : "navBtn"}
          onClick={() => setPage("create")}
        >
          Create Invoice
        </button>

        <div className="apiBox">
          <span className="dot"></span>
          Frontend Running
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

        {page === "dashboard" && (
          <section className="content">
            <div className="statsGrid">
              <StatCard title="Total Invoices" value={stats.totalInvoices} />
              <StatCard title="Paid Invoices" value={stats.paidInvoices} />
              <StatCard title="Pending Invoices" value={stats.pendingInvoices} />
              <StatCard title="Overdue Invoices" value={stats.overdueInvoices} />
              <StatCard
                title="Total Revenue"
                value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
              />
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
              />
            </div>
          </section>
        )}

        {page === "invoices" && (
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
              />
            </div>
          </section>
        )}

        {page === "create" && (
          <section className="content">
            <div className="card formCard">
              <h2>Create New Invoice</h2>

              <form onSubmit={handleCreateInvoice}>
                <div className="formGrid">
                  <div>
                    <label>Client Name</label>
                    <input
                      type="text"
                      value={form.clientName}
                      onChange={(e) =>
                        setForm({ ...form, clientName: e.target.value })
                      }
                      placeholder="Enter client name"
                    />
                  </div>

                  <div>
                    <label>Client Email</label>
                    <input
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) =>
                        setForm({ ...form, clientEmail: e.target.value })
                      }
                      placeholder="Enter client email"
                    />
                  </div>

                  <div>
                    <label>Invoice Date</label>
                    <input
                      type="date"
                      value={form.invoiceDate}
                      onChange={(e) =>
                        setForm({ ...form, invoiceDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label>Amount</label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label>Status</label>
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
                  </div>
                </div>

                <div>
                  <label>Description</label>
                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Enter invoice description"
                  ></textarea>
                </div>

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

        {page === "details" && selectedInvoice && (
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
                  <h1>INVOICE</h1>
                  <p>{selectedInvoice.id}</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              <div className="invoiceInfo">
                <div>
                  <h3>Bill To</h3>
                  <p>{selectedInvoice.clientName}</p>
                  <p>{selectedInvoice.clientEmail}</p>
                </div>

                <div>
                  <h3>Invoice Date</h3>
                  <p>{selectedInvoice.invoiceDate}</p>
                </div>

                <div>
                  <h3>Due Date</h3>
                  <p>{selectedInvoice.dueDate}</p>
                </div>
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
                    <td>₹{selectedInvoice.amount.toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>

              <div className="totalBox">
                <h2>Total: ₹{selectedInvoice.amount.toLocaleString("en-IN")}</h2>
              </div>

              <div className="formActions noPrint">
                {selectedInvoice.status !== "Paid" && (
                  <button
                    className="successBtn"
                    onClick={() => {
                      markAsPaid(selectedInvoice.id);
                      setSelectedInvoice({
                        ...selectedInvoice,
                        status: "Paid",
                      });
                    }}
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
        * {
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        body {
          margin: 0;
          background: #f4f6f8;
          color: #1f2937;
        }

        .app {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 250px;
          background: #0f172a;
          color: white;
          padding: 24px 16px;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .brandIcon {
          width: 42px;
          height: 42px;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 24px;
          font-weight: bold;
        }

        .brand h2 {
          margin: 0;
          font-size: 20px;
        }

        .brand p {
          margin: 2px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .navBtn {
          width: 100%;
          display: block;
          padding: 12px 14px;
          margin-bottom: 8px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #cbd5e1;
          text-align: left;
          font-size: 15px;
          cursor: pointer;
        }

        .navBtn:hover,
        .navBtn.active {
          background: #1d4ed8;
          color: white;
        }

        .apiBox {
          margin-top: 40px;
          background: #1e293b;
          padding: 14px;
          border-radius: 10px;
          font-size: 14px;
          color: #bbf7d0;
        }

        .dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          background: #22c55e;
          border-radius: 50%;
          margin-right: 8px;
        }

        .main {
          margin-left: 250px;
          width: calc(100% - 250px);
        }

        .topbar {
          background: white;
          padding: 20px 30px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .topbar h1 {
          margin: 0;
          font-size: 24px;
        }

        .content {
          padding: 30px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .statCard {
          background: white;
          padding: 24px;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .statCard p {
          margin: 0 0 8px;
          color: #6b7280;
          font-size: 14px;
        }

        .statCard h2 {
          margin: 0;
          font-size: 28px;
          color: #111827;
        }

        .card {
          background: white;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .cardHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .cardHeader h2 {
          margin: 0;
        }

        .toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          font-size: 14px;
          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #2563eb;
        }

        .toolbar input {
          flex: 1;
          min-width: 250px;
        }

        .toolbar select {
          width: 160px;
        }

        .primaryBtn,
        .secondaryBtn,
        .dangerBtn,
        .successBtn,
        .backBtn {
          border: none;
          padding: 10px 16px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .primaryBtn {
          background: #2563eb;
          color: white;
        }

        .secondaryBtn {
          background: #e5e7eb;
          color: #111827;
        }

        .dangerBtn {
          background: #dc2626;
          color: white;
        }

        .successBtn {
          background: #16a34a;
          color: white;
        }

        .backBtn {
          background: transparent;
          color: #2563eb;
          padding-left: 0;
          margin-bottom: 16px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f9fafb;
          color: #374151;
          text-align: left;
          font-size: 13px;
          padding: 14px;
          border-bottom: 1px solid #e5e7eb;
        }

        td {
          padding: 14px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .smallBtn {
          padding: 6px 10px;
          border-radius: 7px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .view {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .paid {
          background: #dcfce7;
          color: #15803d;
        }

        .delete {
          background: #fee2e2;
          color: #b91c1c;
        }

        .badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: bold;
        }

        .badge.Paid {
          background: #dcfce7;
          color: #15803d;
        }

        .badge.Pending {
          background: #fef3c7;
          color: #92400e;
        }

        .badge.Overdue {
          background: #fee2e2;
          color: #b91c1c;
        }

        .formCard {
          max-width: 900px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        label {
          display: block;
          margin-bottom: 7px;
          margin-top: 12px;
          font-weight: 600;
          font-size: 14px;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 22px;
        }

        .invoiceBox {
          background: white;
          border-radius: 14px;
          padding: 36px;
          max-width: 900px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .invoiceHeader {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 25px;
        }

        .invoiceTitle {
          text-align: right;
        }

        .invoiceTitle h1 {
          margin: 0;
          color: #2563eb;
        }

        .invoiceInfo {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }

        .invoiceInfo h3 {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .invoiceInfo p {
          margin: 4px 0;
        }

        .invoiceDetailTable th,
        .invoiceDetailTable td {
          font-size: 15px;
        }

        .totalBox {
          text-align: right;
          margin-top: 25px;
          color: #111827;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: static;
            width: 100%;
            height: auto;
          }

          .app {
            flex-direction: column;
          }

          .main {
            margin-left: 0;
            width: 100%;
          }

          .formGrid,
          .invoiceInfo {
            grid-template-columns: 1fr;
          }

          .invoiceHeader {
            flex-direction: column;
          }

          .invoiceTitle {
            text-align: left;
          }

          .toolbar {
            flex-direction: column;
          }

          .toolbar select {
            width: 100%;
          }
        }

        @media print {
          .sidebar,
          .topbar,
          .backBtn,
          .noPrint {
            display: none !important;
          }

          .main {
            margin-left: 0;
            width: 100%;
          }

          .content {
            padding: 0;
          }

          .invoiceBox {
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="statCard">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{status}</span>;
}

function InvoiceTable({ invoices, onView, onDelete, onPaid }) {
  if (invoices.length === 0) {
    return <p>No invoices found.</p>;
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
              <td>{invoice.id}</td>
              <td>
                <strong>{invoice.clientName}</strong>
                <br />
                <small>{invoice.clientEmail}</small>
              </td>
              <td>{invoice.invoiceDate}</td>
              <td>{invoice.dueDate}</td>
              <td>₹{invoice.amount.toLocaleString("en-IN")}</td>
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