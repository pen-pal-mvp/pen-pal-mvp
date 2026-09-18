'use client'

import { blockUser } from '../actions/safety'

export default function ActionMenu({ letterId, senderId }: { letterId: string, senderId: string }) {
  return (
    <div className="flex z-10">
      <form action={blockUser.bind(null, senderId)}>
        <button 
          type="submit" 
          className="text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg bg-white shadow-sm cursor-pointer transition-all"
          onClick={(e) => {
            if(!confirm('このユーザーをブロックしますか？今後、この相手からの手紙は届かなくなります。')) {
              e.preventDefault()
            }
          }}
        >
          ブロック
        </button>
      </form>
    </div>
  )
}