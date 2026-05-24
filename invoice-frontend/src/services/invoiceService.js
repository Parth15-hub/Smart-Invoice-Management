import axios from "axios";

const API_URL = "https://smart-invoice-backend-t2fr.onrender.com/api/invoices";

export const getInvoices = () => axios.get(API_URL);
export const createInvoice = (invoice) => axios.post(API_URL, invoice);
export const updateInvoice = (id, invoice) => axios.put(`${API_URL}/${id}`, invoice);
export const deleteInvoice = (id) => axios.delete(`${API_URL}/${id}`);
export const updateInvoiceStatus = (id, status) => axios.patch(`${API_URL}/${id}/status`, { status });