import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Correo electrónico inválido."),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres."),
  vatNumber: z.string().min(5, "El NIF/IVA debe tener al menos 5 caracteres."),
});

export type Customer = z.infer<typeof customerSchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio debe ser un número positivo."),
});

export type Product = z.infer<typeof productSchema>;

export const lineItemSchema = z.object({
  id: z.string(),
  productId: z.string().optional().nullable(),
  description: z.string().min(1, "La descripción es obligatoria."),
  quantity: z.coerce.number().min(0.01, "La cantidad debe ser positiva."),
  unitPrice: z.coerce.number().min(0, "El precio debe ser positivo."),
});

export type LineItem = z.infer<typeof lineItemSchema>;

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().min(1, "El número de factura es obligatorio."),
  customerId: z.string().min(1, "Debe seleccionar un cliente."),
  issueDate: z.date(),
  dueDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, "Debe haber al menos un artículo."),
  status: z.enum(["borrador", "pagado", "vencido"]),
});

export type Invoice = z.infer<typeof invoiceSchema>;
