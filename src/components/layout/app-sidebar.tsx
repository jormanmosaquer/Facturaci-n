"use client";

import {
  FilePlus,
  Users,
  FileText,
  Briefcase,
  Box,
  LogOut,
  Building,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const menuItems = [
  { href: "/", label: "Dashboard", icon: Briefcase },
  { href: "/invoices/new", label: "Nueva Factura", icon: FilePlus },
  { href: "/invoices", label: "Facturas", icon: FileText },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/products", label: "Productos", icon: Box },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    toast({ title: "Sesión cerrada correctamente." });
  };
  
  if (pathname === '/login') {
    return null; // Don't show sidebar on login page
  }


  return (
    <Sidebar collapsible="icon" className="no-print">
      <SidebarHeader>
         <div className="flex items-center gap-2 p-2">
            <Building className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                eFactura
            </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem>
                 <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Cerrar Sesión'}}>
                    <LogOut />
                    <span>Cerrar Sesión</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
