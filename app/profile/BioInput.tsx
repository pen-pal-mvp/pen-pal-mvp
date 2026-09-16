'use client'

import { useState } from 'react'

export default function BioInput({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // ペースト等で改行が入った場合、改行を自動で削除する
    const newValue = e.target.value.replace(/\r?\n/g, '')
    setValue(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enterキーが押されたら入力を無効化（ブロック）する
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <textarea 
      name="bio" 
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      maxLength={144}
      rows={4}
      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-800 resize-none text-lg font-medium leading-relaxed"
      placeholder="はじめまして！韓国の文化や言語に興味があります。 / 만나서 반갑습니다! 한국 문화와 언어에 관심이 있습니다."
    />
  )
}