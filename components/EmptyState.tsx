import { FileQuestion, Search, Home, MessageSquare, Calendar, User } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: keyof typeof iconMap;
  action?: {
    label: string;
    href: string;
  };
}

const iconMap = {
  FileQuestion,
  Search,
  Home,
  MessageSquare,
  Calendar,
  User,
};

export default function EmptyState({ title, description, icon = "FileQuestion", action }: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6 max-w-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
