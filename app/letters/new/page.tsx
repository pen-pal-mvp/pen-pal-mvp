import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NewLetterPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string }>
}) {
  const params = await searchParams;
  const partnerId = params.partnerId;

  if (!partnerId) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center mt-10">
        <p className="text-gray-600">エラー: 送信先のペンパルが指定されていません。</p>
        <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">マイページへ戻る</Link>
      </div>
    );
  }

  // --- サーバーアクション（手紙の送信処理） ---
  async function sendLetter(formData: FormData) {
    'use server';
    const content = formData.get('content') as string;
    const receiverId = formData.get('partnerId') as string;

    if (!content || content.length > 144) {
      throw new Error('文字数制限(144文字)を超えているか、内容が空です。');
    }

    const cookieStore = await cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore as any,
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証エラー: ログインしていません。');

    // ▼ 追加ロジック：配達日時（delivery_at）の計算 ▼
    // 現在時刻から24時間後（1日後）を配達日時に設定するわ。
    // ※ 開発中のテストですぐに届けたい場合は、 `24 * 60 * 60 * 1000` の部分を `1 * 60 * 1000` (1分後) などに変更してね。
    const deliveryAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('letters')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content,
        delivery_at: deliveryAt, // 不足していた必須データ（配達予定日時）を追加！
      });

    if (error) {
      console.error('DBエラー:', error);
      throw new Error('手紙の送信に失敗しました。');
    }

    // 送信完了後、マイページへ戻る
    redirect('/dashboard');
  }

  // --- 画面のレンダリング ---
  return (
    <div className="max-w-2xl mx-auto p-4 mt-10 space-y-6">
      <h1 className="text-2xl font-bold border-b pb-2">手紙を書く</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form action={sendLetter} className="space-y-6">
          <input type="hidden" name="partnerId" value={partnerId} />
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              メッセージ <span className="text-gray-400 text-xs">（最大144文字）</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={6}
              maxLength={144}
              required
              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-gray-50 text-gray-800"
              placeholder="ここに手紙の本文を書いてください。送信後は相手に届くまで24時間かかります..."
            ></textarea>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 font-medium transition">
              キャンセル
            </Link>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              ポストに投函する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}