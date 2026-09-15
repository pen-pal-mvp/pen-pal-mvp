'use client'

import { deleteAccount } from '../actions/safety'

export default function DeleteAccountForm() {
  return (
    <form action={deleteAccount}>
      <button 
        type="submit" 
        className="w-full text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 py-4 rounded-2xl font-semibold text-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight"
        onClick={(e) => {
          if(!confirm('本当に退会しますか？この操作は取り消せません。手紙の本文は相手に残りますが、あなたの情報は匿名化されます。\n\n정말로 탈퇴하시겠습니까? 이 작업은 취소할 수 없습니다. 편지 본문은 상대방에게 남지만, 귀하의 정보는 익명화됩니다.')) {
            e.preventDefault()
          }
        }}
      >
        <span>アカウントを削除（退会）する</span>
        <span>계정 삭제 (탈퇴) 하기</span>
      </button>
    </form>
  )
}