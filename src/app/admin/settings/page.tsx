import { getAdminSettingsAction, getAdminDeliveryAreasAction } from "@/lib/actions/admin";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  const [settings, deliveryAreas] = await Promise.all([
    getAdminSettingsAction(),
    getAdminDeliveryAreasAction()
  ]);

  return <SettingsClient initialSettings={settings} initialDeliveryAreas={deliveryAreas} />;
}
