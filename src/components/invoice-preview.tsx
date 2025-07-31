"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { type Invoice, type Customer } from "@/lib/schemas";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface InvoicePreviewProps {
  invoice: Invoice;
  customer: Customer | null;
}

export function InvoicePreview({ invoice, customer }: InvoicePreviewProps) {
  const subtotal = React.useMemo(() => {
    return invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [invoice.lineItems]);

  const taxRate = 0.21; // 21% IVA
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div id="invoice-preview-container">
        <Card className="shadow-lg">
          <CardHeader className="bg-muted/50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-primary">FACTURA</CardTitle>
                <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg">eFactura Simplificada</h3>
                <p className="text-sm text-muted-foreground">Calle Falsa 123, Ciudad</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold mb-2">Facturar a:</h4>
                <div className="text-sm text-muted-foreground">
                  <p className="font-bold text-foreground">{customer?.name || "Seleccione un cliente"}</p>
                  <p>{customer?.address}</p>
                  <p>{customer?.email}</p>
                  <p>NIF/IVA: {customer?.vatNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold">Fecha Emisión:</span>
                  <span>{format(new Date(invoice.issueDate), "dd/MM/yyyy", { locale: es })}</span>
                  <span className="font-semibold">Fecha Venc.:</span>
                  <span>{format(new Date(invoice.dueDate), "dd/MM/yyyy", { locale: es })}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-semibold p-2">Descripción</th>
                  <th className="text-center font-semibold p-2">Cant.</th>
                  <th className="text-right font-semibold p-2">Precio Unit.</th>
                  <th className="text-right font-semibold p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-dashed">
                    <td className="p-2">{item.description || "..."}</td>
                    <td className="text-center p-2">{item.quantity}</td>
                    <td className="text-right p-2">{item.unitPrice.toFixed(2)}€</td>
                    <td className="text-right p-2">{(item.quantity * item.unitPrice).toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-6">
              <div className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA ({(taxRate * 100).toFixed(0)}%):</span>
                  <span className="font-medium">{taxAmount.toFixed(2)}€</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>TOTAL:</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-center text-xs text-muted-foreground p-4 border-t">
            Gracias por su confianza.
          </CardFooter>
        </Card>
      </div>
      <div className="text-center mt-6 no-print">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir / Exportar PDF
        </Button>
      </div>
    </>
  );
}
