'use client'

import { blockUser, reportLetter } from '../actions/safety'

export default function ActionMenu({ letterId, senderId }: { letterId: string, senderId: string }) {
  return (
    <div className="absolute top-4 right-4 flex space-x-2 z-20">
      <form action={reportLetter.bind(null, letterId, senderId, '不適切なコンテンツ')}>
        <button 
          type="submit" 
          className="text-xs text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-md bg-white shadow-sm cursor-pointer transition-colors"
          onClick={(e) => {
            if(!confirm('この手紙を通報し、非表示にしますか？')) {
              e.preventDefault()
            }
          }}
        >
          通報
        </button>
      </form>
      <form action={blockUser.bind(null, senderId)}>
        <button 
          type="submit" 
          className="text-xs text-gray-500 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md bg-white shadow-sm cursor-pointer transition-colors"
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