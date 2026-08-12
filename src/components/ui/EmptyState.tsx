import { SearchX } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({ 
  title = "No products found", 
  description = "We couldn't find any products matching your criteria.",
  actionText = "Clear filters",
  actionHref = "/shop"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 rounded-full bg-gray-50 p-6">
        <SearchX className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mb-6 max-w-md text-gray-500">{description}</p>
      {actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
