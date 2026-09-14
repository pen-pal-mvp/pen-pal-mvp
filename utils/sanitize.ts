// utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHtml = (dirtyHtml: string): string => {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [], // 属性を空にしてクラスやリンクの注入を防止
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'object'],
  });
};