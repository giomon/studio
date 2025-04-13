// filepath: /workspaces/studio/pages/index.tsx
import OrderTable from "../components/OrderTable"; // Note the updated import path

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      <OrderTable />
    </div>
  );
}
