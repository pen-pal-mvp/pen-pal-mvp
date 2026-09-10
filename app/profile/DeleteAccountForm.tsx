'use client'

import { deleteAccount } from '../actions/safety'

export default function DeleteAccountForm() {
  return (
    <form action={deleteAccount}>
      <button 
        type="submit" 
        className="w-full text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 py-3 rounded-lg text-sm font-medium transition"
        onClick={(e) => {
          if(!confirm('本当に退会しますか？この操作は取り消せません。手紙の本文は相手に残りますが、あなたの情報は匿名化されます。')) {
            e.preventDefault()
          }
        }}
      >
        アカウントを削除（退会）する
      </button>
    </form>
  )
}