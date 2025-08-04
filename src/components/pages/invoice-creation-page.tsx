"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePreview } from "@/components/invoice-preview";
import { type Invoice, type Customer, type LineItem } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";
import { getCustomers, saveInvoice } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const getNewInvoice = (): Omit<Invoice, "id"> => ({
  invoiceNumber: `FACT-${new Date().getFullYear()}-`,
  customerId: "",
  issueDate: new Date(),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
  lineItems: [
    { id: uuidv4(), productId: null, description: "", quantity: 1, unitPrice: 0 },
  ],
  status: "borrador",
});

export function InvoiceCreationPage() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Omit<Invoice, "id">>(getNewInvoice());
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
    setInvoice(getNewInvoice());
  };

  const handleSave = async (data: Omit<Invoice, 'id'>) => {
    try {
      const savedInvoice = await saveInvoice(data);
      toast({
        title: "Factura Guardada",
        description: "La factura ha sido guardada con éxito.",
      });
      router.push(`/invoices/${savedInvoice.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Hubo un problema al guardar la factura.",
      });
    }
  };

  const previewInvoice: Invoice = {
      id: uuidv4(),
      ...invoice,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-3">
        <InvoiceForm
          invoiceData={invoice}
          onInvoiceChange={handleInvoiceChange}
          onLineItemsChange={handleLineItemsChange}
          customers={customers}
          onCustomerChange={handleCustomerChange}
          onFormReset={resetForm}
          onSave={handleSave}
          isEditing={false}
        />
      </div>
      <div className="lg:col-span-2">
        <div className="sticky top-20">
          <InvoicePreview invoice={previewInvoice} customer={selectedCustomer} />
        </div>
      </div>
    </div>
  );
}
