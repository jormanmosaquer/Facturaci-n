"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Invoice, type Customer } from "@/lib/schemas";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getInvoices, getCustomers, deleteInvoice } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

export function InvoiceListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invoicesData, customersData] = await Promise.all([
        getInvoices(),
        getCustomers(),
      ]);
      setInvoices(invoicesData);
      setCustomers(customersData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || "N/A";
  };
  
  const getInvoiceTotal = (invoice: Invoice) => {
     const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
     const tax = subtotal * 0.21;
     return subtotal + tax;
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCustomerName(invoice.customerId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm, customers]);

  const handleDelete = async (invoiceId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      try {
        await deleteInvoice(invoiceId);
        toast({ title: "Factura eliminada" });
        loadData();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la factura.",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Facturas</CardTitle>
        <CardDescription>
          Aquí puedes ver, buscar, editar y eliminar todas tus facturas guardadas.
        </CardDescription>
        <div className="pt-4">
          <Input
            placeholder="Buscar por nº de factura o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                   <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                   </div>
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} onClick={() => router.push(`/invoices/${invoice.id}`)} className="cursor-pointer">
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                  <TableCell>{format(new Date(invoice.issueDate), "dd MMM, yyyy", { locale: es })}</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === "pagado" ? "default" :
                      invoice.status === "vencido" ? "destructive" :
                      "secondary"
                    } className="capitalize">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{getInvoiceTotal(invoice).toFixed(2)}€</TableCell>
                   <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> Ver
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(invoice.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                   </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No se encontraron facturas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
