import { Nav, NavLink } from "@/components/Nav";

//caching not needed for admins
export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
    <Nav>
      <NavLink href="/admin">Dashboard</NavLink>
      <NavLink href="/admin/products">Products</NavLink>
      <NavLink href="/admin/users">Customers</NavLink>
      <NavLink href="/admin/orders">Sales</NavLink>
    </Nav>
    <div className="container mx-auto my-6 w-full px-4">{children}</div>
    </>
  )
}