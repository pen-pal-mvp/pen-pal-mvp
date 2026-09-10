import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import RequestButton from './RequestButton';

export default async function UsersPage() {
  // TypeScriptの過渡期の型エラーを回避するための最終形
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore as any });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <div className="p-4">ログインが必要です。</div>;
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, pen_name, avatar_type, bio')
    .neq('id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-4 text-red-500">エラーが発生しました: {error.message}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">ペンパルを探す</h1>
      
      {users && users.length === 0 ? (
        <p className="text-gray-500">まだ他のユーザーがいません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users?.map((user) => (
            <div key={user.id} className="bg-white border p-5 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  {user.avatar_type || '✉️'}
                </div>
                <h2 className="font-semibold text-lg text-gray-800">{user.pen_name}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-5 line-clamp-3">
                {user.bio || '自己紹介がありません。'}
              </p>
              
              <RequestButton receiverId={user.id} />
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}