"use server";

import {
  validateVat as validateVatFlow,
  type ValidateVatInput,
  type ValidateVatOutput,
} from "@/ai/flows/vat-validator";
import { getDb } from "@/lib/db";
import { type Customer, type Invoice, type LineItem, type Product, customerSchema, invoiceSchema, productSchema } from "@/lib/schemas";
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


// Product Actions
export async function getProducts(): Promise<Product[]> {
    const db = await getDb();
    const products = await db.all<Product[]>("SELECT * FROM products ORDER BY name");
    return products.map(p => productSchema.parse(p));
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const db = await getDb();
    const newProduct = { ...productData, id: uuidv4() };
    await db.run(
        "INSERT INTO products (id, name, description, price) VALUES (?, ?, ?, ?)",
        newProduct.id, newProduct.name, newProduct.description, newProduct.price
    );
    return newProduct;
}

export async function updateProduct(product: Product): Promise<Product> {
    const db = await getDb();
    await db.run(
        "UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?",
        product.name, product.description, product.price, product.id
    );
    return product;
}

export async function deleteProduct(productId: string): Promise<{ success: boolean }> {
    const db = await getDb();
    await db.run("DELETE FROM products WHERE id = ?", productId);
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

export async function getInvoice(id: string): Promise<Invoice | null> {
    const db = await getDb();
    const invoiceData = await db.get("SELECT * FROM invoices WHERE id = ?", id);
    if (!invoiceData) return null;
    
    const lineItems = await db.all<LineItem[]>("SELECT * FROM line_items WHERE invoiceId = ?", id);
    return invoiceSchema.parse({
        ...invoiceData,
        issueDate: new Date(invoiceData.issueDate),
        dueDate: new Date(invoiceData.dueDate),
        lineItems: lineItems,
    });
}

export async function saveInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const db = await getDb();
    const newInvoice = { ...invoice, id: uuidv4() };
    await db.run('BEGIN TRANSACTION');
    try {
        await db.run(
            "INSERT INTO invoices (id, invoiceNumber, customerId, issueDate, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)",
            newInvoice.id, newInvoice.invoiceNumber, newInvoice.customerId, newInvoice.issueDate.toISOString(), newInvoice.dueDate.toISOString(), newInvoice.status
        );
        for (const item of newInvoice.lineItems) {
            await db.run(
                "INSERT INTO line_items (id, invoiceId, productId, description, quantity, unitPrice) VALUES (?, ?, ?, ?, ?, ?)",
                uuidv4(), newInvoice.id, item.productId, item.description, item.quantity, item.unitPrice
            );
        }
        await db.run('COMMIT');
        return newInvoice;
    } catch (err) {
        await db.run('ROLLBACK');
        throw err;
    }
}

export async function updateInvoice(invoice: Invoice): Promise<Invoice> {
    const db = await getDb();
    await db.run('BEGIN TRANSACTION');
    try {
        await db.run(
            "UPDATE invoices SET invoiceNumber = ?, customerId = ?, issueDate = ?, dueDate = ?, status = ? WHERE id = ?",
            invoice.invoiceNumber, invoice.customerId, invoice.issueDate.toISOString(), invoice.dueDate.toISOString(), invoice.status, invoice.id
        );

        await db.run("DELETE FROM line_items WHERE invoiceId = ?", invoice.id);
        
        for (const item of invoice.lineItems) {
            await db.run(
                "INSERT INTO line_items (id, invoiceId, productId, description, quantity, unitPrice) VALUES (?, ?, ?, ?, ?, ?)",
                uuidv4(), invoice.id, item.productId, item.description, item.quantity, item.unitPrice
            );
        }
        await db.run('COMMIT');
        return invoice;
    } catch (err) {
        await db.run('ROLLBACK');
        throw err;
    }
}

export async function deleteInvoice(invoiceId: string): Promise<{ success: boolean }> {
    const db = await getDb();
    await db.run("DELETE FROM invoices WHERE id = ?", invoiceId); // relies on ON DELETE CASCADE for line_items
    return { success: true };
}
