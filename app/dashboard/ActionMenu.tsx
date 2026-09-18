'use client'

import { blockUser } from '../actions/safety'

export default function ActionMenu({ letterId, senderId }: { letterId: string, senderId: string }) {
  return (
    <div className="flex z-10">
      <form action={blockUser.bind(null, senderId)}>
        <button 
          type="submit" 
          className="inline-flex flex-col items-center justify-center border-2 border-rose-400 text-rose-600 hover:bg-rose-50 px-6 py-1.5 rounded-xl text-xs font-bold transition-colors leading-tight gap-1 shadow-sm"
          onClick={(e) => {
            if(!confirm('このユーザーをブロックしますか？今後、この相手からの手紙は届かなくなります。')) {
              e.preventDefault()
            }
          }}
        >
          <span>ブロック 🚫</span>
          <span>차단</span>
        </button>
      </form>
    </div>
  )
}