"use client";

import React, { useState } from "react";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePreview } from "@/components/invoice-preview";
import { type Invoice, type Customer, type LineItem } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";

// Note: In a real app, you'd install uuid and its types. For now, we'll mock it.
declare module "uuid" {
  export function v4(): string;
}

const getNewInvoice = (): Invoice => ({
  id: uuidv4(),
  invoiceNumber: `FACT-${new Date().getFullYear()}-`,
  customerId: "",
  issueDate: new Date(),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
  lineItems: [
    { id: uuidv4(), description: "", quantity: 1, unitPrice: 0 },
  ],
  status: "borrador",
});

export function InvoiceCreationPage() {
  const [invoice, setInvoice] = useState<Invoice>(getNewInvoice());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  React.useEffect(() => {
    // Load customers from local storage on mount
    const storedCustomers = localStorage.getItem("customers");
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
  }, []);

  const handleInvoiceChange = (newInvoiceData: Partial<Invoice>) => {
    setInvoice((prev) => ({ ...prev, ...newInvoiceData }));
  };
  
  const handleLineItemsChange = (newLineItems: LineItem[]) => {
    setInvoice((prev) => ({ ...prev, lineItems: newLineItems }));
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    handleInvoiceChange({ customerId: customerId });
  };
  
  const resetForm = () => {
    setInvoice(getNewInvoice());
    setSelectedCustomer(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div className="lg:col-span-3">
        <InvoiceForm
          invoice={invoice}
          onInvoiceChange={handleInvoiceChange}
          onLineItemsChange={handleLineItemsChange}
          customers={customers}
          onCustomerChange={handleCustomerChange}
          selectedCustomer={selectedCustomer}
          onFormReset={resetForm}
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
