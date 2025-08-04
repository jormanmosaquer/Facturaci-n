// src/components/pages/invoice-edit-page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePreview } from "@/components/invoice-preview";
import { type Invoice, type Customer, type LineItem } from "@/lib/schemas";
import { getCustomers, updateInvoice } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface InvoiceEditPageProps {
  invoice: Invoice;
}

export function InvoiceEditPage({ invoice: initialInvoice }: InvoiceEditPageProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { toast } = useToast();

  const selectedCustomer = customers.find(c => c.id === invoice.customerId) || null;

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los clientes.",
        });
      }
    };
    loadCustomers();
  }, [toast]);
  
  // Ensure dates are Date objects
  useEffect(() => {
    setInvoice(prev => ({
        ...prev,
        issueDate: new Date(prev.issueDate),
        dueDate: new Date(prev.dueDate)
    }));
  }, [initialInvoice])

  const handleInvoiceChange = (newInvoiceData: Partial<Omit<Invoice, "id">>) => {
    setInvoice((prev) => ({ ...prev, ...newInvoiceData }));
  };
  
  const handleLineItemsChange = (newLineItems: LineItem[]) => {
    setInvoice((prev) => ({ ...prev, lineItems: newLineItems }));
  }

  const handleCustomerChange = (customerId: string) => {
    handleInvoiceChange({ customerId: customerId });
  };
  
  const resetForm = () => {
    router.back();
  };

  const handleSave = async (data: Omit<Invoice, 'id'>) => {
    try {
      const updatedData = { ...data, id: invoice.id };
      await updateInvoice(updatedData);
      toast({
        title: "Factura Actualizada",
        description: "La factura ha sido actualizada con éxito.",
      });
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "Hubo un problema al actualizar la factura.",
      });
    }
  };
  
  const { id, ...invoiceFormData } = invoice;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-3">
        <InvoiceForm
          invoiceData={invoiceFormData}
          onInvoiceChange={handleInvoiceChange}
          onLineItemsChange={handleLineItemsChange}
          customers={customers}
          onCustomerChange={handleCustomerChange}
          onFormReset={resetForm}
          onSave={handleSave}
          isEditing={true}
        />
      </div>
      <div className="lg:col-span-2">
        <div className="sticky top-20">
          <InvoicePreview invoice={invoice} customer={selectedCustomer} />
        </div>
      </div>
    </div>
  );
}
