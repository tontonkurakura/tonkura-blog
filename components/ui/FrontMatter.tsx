import { format } from "date-fns";

interface FrontMatterProps {
  frontMatter: {
    last_edited?: string;
    [key: string]: string | undefined;
  };
}

export default function FrontMatter({ frontMatter }: FrontMatterProps) {
  if (!frontMatter.last_edited) return null;

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "yyyy年MM月dd日");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="text-sm text-gray-500 mb-4 text-right">
      Last edited: {formatDate(frontMatter.last_edited)}
    </div>
  );
}
