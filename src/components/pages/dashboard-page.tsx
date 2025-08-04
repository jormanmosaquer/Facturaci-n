// src/components/pages/dashboard-page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getInvoices } from '@/app/actions';
import { type Invoice } from '@/lib/schemas';
import { DollarSign, FileText, AlertTriangle, Loader2 } from 'lucide-react';

export function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error("Failed to load invoices", error);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const totalRevenue = invoices
    .filter(inv => inv.status === 'pagado')
    .reduce((acc, inv) => acc + inv.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), 0);
  
  const tax = totalRevenue * 0.21;
  const totalWithTax = totalRevenue + tax;

  const totalPending = invoices
    .filter(inv => inv.status === 'borrador')
    .reduce((acc, inv) => acc + inv.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), 0);
  const pendingTax = totalPending * 0.21;
  const totalPendingWithTax = totalPending + pendingTax;

  const totalOverdue = invoices
    .filter(inv => inv.status === 'vencido')
    .reduce((acc, inv) => acc + inv.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), 0);
  const overdueTax = totalOverdue * 0.21;
  const totalOverdueWithTax = totalOverdue + overdueTax;

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales (Pagado)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithTax.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              + {invoices.filter(i => i.status === 'pagado').length} facturas pagadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingWithTax.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              en {invoices.filter(i => i.status === 'borrador').length} facturas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalOverdueWithTax.toFixed(2)}€</div>
             <p className="text-xs text-muted-foreground">
              de {invoices.filter(i => i.status === 'vencido').length} facturas vencidas
            </p>
          </CardContent>
        </Card>
      </div>
      {/* TODO: Add a chart with recent activity */}
    </div>
  );
}
