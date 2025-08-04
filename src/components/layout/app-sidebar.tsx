"use client";

import {
  FilePlus2,
  Users,
  ScrollText,
  Building2,
  LayoutDashboard,
  Package,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices/new", label: "Nueva Factura", icon: FilePlus2 },
  { href: "/invoices", label: "Facturas", icon: ScrollText },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/products", label: "Productos", icon: Package },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Sesión cerrada correctamente." });
      router.push("/login");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cerrar la sesión." });
    }
  };
  
  if (pathname === '/login') {
    return null; // Don't show sidebar on login page
  }


  return (
    <Sidebar collapsible="icon" className="no-print">
      <SidebarHeader>
         <div className="flex items-center gap-2 p-2">
            <Building2 className="w-6 h-6 text-primary" />
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
