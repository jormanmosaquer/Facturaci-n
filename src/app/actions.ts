"use server";

import {
  validateVat as validateVatFlow,
  type ValidateVatInput,
  type ValidateVatOutput,
} from "@/ai/flows/vat-validator";
import { getDb } from "@/lib/db";
import { type Customer, type Invoice, type LineItem, customerSchema, invoiceSchema } from "@/lib/schemas";
import { v4 as uuidv4 } from "uuid";

export async function validateVatAction(
  input: ValidateVatInput
): Promise<{ success: true; data: ValidateVatOutput } | { success: false; error: string }> {
  try {
    const result = await validateVatFlow(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("VAT validation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Fallo al validar el IVA: ${errorMessage}` };
  }
}

// Customer Actions
export async function getCustomers(): Promise<Customer[]> {
    const db = await getDb();
    const customers = await db.all<Customer[]>("SELECT * FROM customers ORDER BY name");
    return customers.map(c => customerSchema.parse(c));
}

export async function addCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    const db = await getDb();
    const newCustomer = { ...customerData, id: uuidv4() };
    await db.run(
        "INSERT INTO customers (id, name, email, address, vatNumber) VALUES (?, ?, ?, ?, ?)",
        newCustomer.id, newCustomer.name, newCustomer.email, newCustomer.address, newCustomer.vatNumber
    );
    return newCustomer;
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
    const db = await getDb();
    await db.run(
        "UPDATE customers SET name = ?, email = ?, address = ?, vatNumber = ? WHERE id = ?",
        customer.name, customer.email, customer.address, customer.vatNumber, customer.id
    );
    return customer;
}

export async function deleteCustomer(customerId: string): Promise<{ success: boolean }> {
    const db = await getDb();
    await db.run("DELETE FROM customers WHERE id = ?", customerId);
    return { success: true };
}


// Invoice Actions
export async function getInvoices(): Promise<Invoice[]> {
    const db = await getDb();
    const invoicesData = await db.all("SELECT * FROM invoices ORDER BY issueDate DESC");
    const invoices: Invoice[] = [];
    for (const inv of invoicesData) {
        const lineItems = await db.all<LineItem[]>("SELECT * FROM line_items WHERE invoiceId = ?", inv.id);
        const invoice = invoiceSchema.parse({
            ...inv,
            issueDate: new Date(inv.issueDate),
            dueDate: new Date(inv.dueDate),
            lineItems: lineItems,
        });
        invoices.push(invoice);
    }
    return invoices;
}

export async function saveInvoice(invoice: Invoice): Promise<Invoice> {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');
    try {
        await db.run(
            "INSERT INTO invoices (id, invoiceNumber, customerId, issueDate, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)",
            invoice.id, invoice.invoiceNumber, invoice.customerId, invoice.issueDate.toISOString(), invoice.dueDate.toISOString(), invoice.status
        );
        for (const item of invoice.lineItems) {
            await db.run(
                "INSERT INTO line_items (id, invoiceId, description, quantity, unitPrice) VALUES (?, ?, ?, ?, ?)",
                item.id, invoice.id, item.description, item.quantity, item.unitPrice
            );
        }
        await db.run('COMMIT');
        return invoice;
    } catch (err) {
        await db.run('ROLLBACK');
        throw err;
    }
}
