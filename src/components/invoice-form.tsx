"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle, Trash2, RotateCcw, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VatValidator } from "./vat-validator";
import { invoiceSchema, type Invoice, type Customer, type LineItem } from "@/lib/schemas";

type InvoiceFormData = Omit<Invoice, "id">;

interface InvoiceFormProps {
  invoiceData: InvoiceFormData;
  onInvoiceChange: (data: Partial<InvoiceFormData>) => void;
  onLineItemsChange: (lineItems: LineItem[]) => void;
  customers: Customer[];
  onCustomerChange: (customerId: string) => void;
  onFormReset: () => void;
  onSave: (data: InvoiceFormData) => Promise<void>;
  isEditing: boolean;
}

export function InvoiceForm({
  invoiceData,
  onInvoiceChange,
  onLineItemsChange,
  customers,
  onCustomerChange,
  onFormReset,
  onSave,
  isEditing,
}: InvoiceFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema.omit({id: true})),
    defaultValues: invoiceData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });
  
  const selectedCustomer = customers.find(c => c.id === invoiceData.customerId) || null;

  useEffect(() => {
    form.reset(invoiceData);
  }, [invoiceData, form]);
  
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     onInvoiceChange({ [e.target.name]: e.target.value });
  };
  
  const handleDateChange = (field: 'issueDate' | 'dueDate', date?: Date) => {
    if (date) {
      onInvoiceChange({ [field]: date });
    }
  };

  const addLineItem = () => {
    const newLineItem = { id: uuidv4(), description: "", quantity: 1, unitPrice: 0 };
    append(newLineItem);
    onLineItemsChange([...invoiceData.lineItems, newLineItem]);
  };
  
  const removeLineItem = (index: number) => {
    remove(index);
    const updatedLineItems = invoiceData.lineItems.filter((_, i) => i !== index);
    onLineItemsChange(updatedLineItems);
  }

  const handleLineItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const updatedLineItems = [...invoiceData.lineItems];
      const typedName = name.split('.')[2] as keyof LineItem;
      const typedValue = (typedName === 'quantity' || typedName === 'unitPrice') ? parseFloat(value) || 0 : value;
      (updatedLineItems[index] as any)[typedName] = typedValue;
      onLineItemsChange(updatedLineItems);
  }

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSaving(true);
    await onSave(data);
    setIsSaving(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Factura" : "Crear Nueva Factura"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerId">Cliente</Label>
              <Controller
                name="customerId"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      onCustomerChange(value);
                    }} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.customerId && <p className="text-sm text-destructive">{form.formState.errors.customerId.message}</p>}
            </div>
            
            {selectedCustomer && (
              <VatValidator vatNumber={selectedCustomer.vatNumber} />
            )}

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Número de Factura</Label>
              <Input id="invoiceNumber" {...form.register("invoiceNumber")} onChange={handleLocalChange} />
              {form.formState.errors.invoiceNumber && <p className="text-sm text-destructive">{form.formState.errors.invoiceNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fecha de Emisión</Label>
              <Controller
                name="issueDate"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); handleDateChange('issueDate', date); }} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
             <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
               <Controller
                name="dueDate"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); handleDateChange('dueDate', date); }} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={(value) => onInvoiceChange({ status: value as Invoice['status'] })} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Artículos de la Factura</h3>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <Input placeholder="Descripción" {...form.register(`lineItems.${index}.description`)} className="col-span-5" onChange={(e) => handleLineItemChange(index, e)}/>
                    <Input type="number" placeholder="Cant." {...form.register(`lineItems.${index}.quantity`)} className="col-span-2" onChange={(e) => handleLineItemChange(index, e)} step="1" />
                    <Input type="number" placeholder="Precio" {...form.register(`lineItems.${index}.unitPrice`)} className="col-span-2" onChange={(e) => handleLineItemChange(index, e)} step="0.01" />
                    <p className="col-span-2 text-right">
                       {(invoiceData.lineItems[index]?.quantity * invoiceData.lineItems[index]?.unitPrice || 0).toFixed(2)} €
                    </p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)} className="col-span-1 text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
            </div>
             {form.formState.errors.lineItems && <p className="text-sm text-destructive mt-2">{form.formState.errors.lineItems.message}</p>}
            <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Artículo
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onFormReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {isEditing ? 'Cancelar' : 'Limpiar'}
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-accent hover:bg-accent/90">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Actualizar Factura' : 'Guardar Factura'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
