"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui";
import { PlusCircle, MoreHorizontal, Trash2, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customerSchema, type Customer } from "@/lib/schemas";

declare module "uuid" {
  export function v4(): string;
}

export function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<Customer>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      address: "",
      vatNumber: "",
    },
  });

  useEffect(() => {
    try {
        const storedCustomers = localStorage.getItem("customers");
        if (storedCustomers) {
            setCustomers(JSON.parse(storedCustomers));
        }
    } catch (error) {
        console.error("Failed to parse customers from localStorage", error);
        setCustomers([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const saveCustomersToStorage = (updatedCustomers: Customer[]) => {
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
  };
  
  const handleDialogOpen = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    form.reset(customer || { id: "", name: "", email: "", address: "", vatNumber: "" });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: Customer) => {
    try {
      if (editingCustomer) {
        const updatedCustomers = customers.map((c) =>
          c.id === editingCustomer.id ? { ...data, id: c.id } : c
        );
        saveCustomersToStorage(updatedCustomers);
        toast({ title: "Cliente actualizado" });
      } else {
        const newCustomer = { ...data, id: uuidv4() };
        saveCustomersToStorage([...customers, newCustomer]);
        toast({ title: "Cliente añadido" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el cliente." });
    }
  };
  
  const handleDeleteCustomer = (customerId: string) => {
      if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
        const updatedCustomers = customers.filter(c => c.id !== customerId);
        saveCustomersToStorage(updatedCustomers);
        toast({ title: "Cliente eliminado" });
      }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>Gestiona tu lista de clientes.</CardDescription>
            </div>
            <Button onClick={() => handleDialogOpen()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>NIF/IVA</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                </TableRow>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.vatNumber}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleDialogOpen(customer)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCustomer(customer.id)}><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No hay clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Editar Cliente" : "Añadir Cliente"}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Modifica los datos del cliente." : "Rellena los datos para añadir un nuevo cliente."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...form.register("email")} />
                 {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" {...form.register("address")} />
                 {form.formState.errors.address && <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">NIF/IVA</Label>
                <Input id="vatNumber" {...form.register("vatNumber")} />
                 {form.formState.errors.vatNumber && <p className="text-sm text-destructive">{form.formState.errors.vatNumber.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
