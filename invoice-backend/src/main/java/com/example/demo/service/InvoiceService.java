package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Invoice;
import com.example.demo.repository.InvoiceRepository;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }

    public Invoice createInvoice(Invoice invoice) {
        if (invoice.getStatus() == null || invoice.getStatus().isEmpty()) {
            invoice.setStatus("Pending");
        }
        return invoiceRepository.save(invoice);
    }

    public Invoice updateInvoice(Long id, Invoice updatedInvoice) {
        Invoice invoice = getInvoiceById(id);

        invoice.setClientName(updatedInvoice.getClientName());
        invoice.setClientEmail(updatedInvoice.getClientEmail());
        invoice.setInvoiceDate(updatedInvoice.getInvoiceDate());
        invoice.setDueDate(updatedInvoice.getDueDate());
        invoice.setAmount(updatedInvoice.getAmount());
        invoice.setStatus(updatedInvoice.getStatus());
        invoice.setDescription(updatedInvoice.getDescription());

        return invoiceRepository.save(invoice);
    }

    public void deleteInvoice(Long id) {
        Invoice invoice = getInvoiceById(id);
        invoiceRepository.delete(invoice);
    }

    public Invoice updateStatus(Long id, String status) {
        Invoice invoice = getInvoiceById(id);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }
}