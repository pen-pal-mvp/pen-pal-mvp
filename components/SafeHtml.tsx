// components/SafeHtml.tsx
import { sanitizeHtml } from '@/utils/sanitize';

interface SafeHtmlProps {
  content: string;
  className?: string;
}

export const SafeHtml = ({ content, className = '' }: SafeHtmlProps) => {
  const cleanHtml = sanitizeHtml(content);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};