// src/components/pages/invoice-detail-page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InvoicePreview } from '@/components/invoice-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getCustomers, deleteInvoice } from '@/app/actions';
import { type Invoice, type Customer } from '@/lib/schemas';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface InvoiceDetailPageProps {
    invoice: Invoice;
}

export function InvoiceDetailPage({ invoice }: InvoiceDetailPageProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [customer, setCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            const customers = await getCustomers();
            const currentCustomer = customers.find(c => c.id === invoice.customerId);
            setCustomer(currentCustomer || null);
        };
        fetchCustomer();
    }, [invoice.customerId]);
    
    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
            try {
                await deleteInvoice(invoice.id);
                toast({ title: 'Factura Eliminada' });
                router.push('/invoices');
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la factura.' });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                     <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </Button>
                </div>
            </div>
            <InvoicePreview invoice={invoice} customer={customer} />
        </div>
    );
}
