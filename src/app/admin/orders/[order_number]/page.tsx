import { getAdminOrderDetailsAction } from "@/lib/actions/admin";
import { notFound } from "next/navigation";
import OrderDetailsClient from "./OrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }: { params: { order_number: string } }) {
  const order = await getAdminOrderDetailsAction(params.order_number);

  if (!order) {
    notFound();
  }

  return <OrderDetailsClient order={order} />;
}
