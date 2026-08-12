#!/bin/bash

# Define routes
declare -a customer_routes=(
  "(customer)/shop"
  "(customer)/products/[slug]"
  "(customer)/categories/[slug]"
  "(customer)/search"
  "(customer)/cart"
  "(customer)/checkout"
  "(customer)/orders"
  "(customer)/orders/[id]"
  "(customer)/profile"
  "(customer)/addresses"
)

declare -a auth_routes=(
  "(auth)/login"
  "(auth)/register"
  "(auth)/forgot-password"
)

declare -a admin_routes=(
  "(admin)/admin"
  "(admin)/admin/products"
  "(admin)/admin/categories"
  "(admin)/admin/inventory"
  "(admin)/admin/orders"
  "(admin)/admin/customers"
  "(admin)/admin/payments"
  "(admin)/admin/banners"
  "(admin)/admin/settings"
)

# Function to create page
create_page() {
  local route_path=$1
  local full_dir="src/app/${route_path}"
  mkdir -p "$full_dir"
  
  # Extract page name for the title
  local page_name=$(basename "$route_path")
  
  cat <<EOF > "${full_dir}/page.tsx"
export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold capitalize">${page_name} Page</h1>
    </div>
  );
}
EOF
}

# Create customer layout
mkdir -p src/app/\(customer\)
cat <<EOF > src/app/\(customer\)/layout.tsx
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 border-b flex items-center px-6">
        <h1 className="text-xl font-bold text-primary">Fresh Harvest</h1>
        <nav className="ml-8 space-x-4">
          <span className="text-sm">Shop</span>
          <span className="text-sm">Categories</span>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="h-16 border-t flex items-center justify-center">
        <p className="text-sm text-muted-foreground">© 2026 Fresh Harvest</p>
      </footer>
    </div>
  );
}
EOF

# Generate all pages
for route in "${customer_routes[@]}"; do
  create_page "$route"
done

for route in "${auth_routes[@]}"; do
  create_page "$route"
done

for route in "${admin_routes[@]}"; do
  create_page "$route"
done

echo "All routes generated successfully."
