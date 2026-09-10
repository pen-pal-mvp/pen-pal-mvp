import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export default async function NewProfilePage() {
  // 1. セッション（ログイン状態）の確認（※ここでエラーが起きて弾かれていたのを修正済！）
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
  
  const { data: { session } } = await supabase.auth.getSession();

  // セッションがない場合はログイン画面へ
  if (!session) {
    redirect('/'); 
  }

  // 2. プロフィールをDBに保存する処理（サーバーアクション）
  async function saveProfile(formData: FormData) {
    'use server';
    
    // 保存時にもCookieを正しく読み込む
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return;

    // フォームの入力値を取得
    const pen_name = formData.get('pen_name') as string;
    const avatar_type = formData.get('avatar_type') as string;
    const bio = formData.get('bio') as string;

    // usersテーブルに保存（INSERT or UPDATE）
    const { error } = await supabase.from('users').upsert({
      id: session.user.id,
      email: session.user.email,
      pen_name,
      avatar_type,
      bio,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('保存エラー:', error.message);
      return;
    }

    // 保存に成功したらユーザー一覧画面へ自動移動！
    redirect('/users');
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">プロフィールを作成する</h1>
      
      <form action={saveProfile} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ペンネーム</label>
          <input 
            type="text" 
            name="pen_name" 
            required 
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="例: 夜更かしフクロウ" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">アイコン (絵文字など)</label>
          <input 
            type="text" 
            name="avatar_type" 
            required 
            defaultValue="✉️" 
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介 (最大144文字)</label>
          <textarea 
            name="bio" 
            maxLength={144} 
            required 
            className="w-full border border-gray-300 rounded-md p-3 text-gray-800 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="初めまして。のんびり文通したいです。"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          保存してペンパルを探す
        </button>
      </form>
    </div>
  );
}