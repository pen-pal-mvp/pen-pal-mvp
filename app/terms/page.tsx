'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function TermsPage() {
  const router = useRouter()
  
  const [selectedCulture, setSelectedCulture] = useState<string | null>(null)
  const [birthDate, setBirthDate] = useState<string>('')
  
  const [isProcessing, setIsProcessing] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handlePayment = async (provider: string) => {
    // 生年月日と文化の両方が入力されていない場合は進めない
    if (!selectedCulture || !birthDate || isProcessing) return
    setIsProcessing(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 文化と一緒に生年月日（birth_date）もユーザーのUUIDに紐づけて保存
        const { error } = await supabase
          .from('users')
          .update({ 
            target_culture: selectedCulture,
            birth_date: birthDate
          })
          .eq('id', user.id)

        if (error) {
          console.error('Error saving user data:', error)
          setIsProcessing(false)
          return
        }
      }
      
      // 決済APIの呼び出し
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        throw new Error('決済の準備に失敗しました');
      }

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('決済URLの取得に失敗しました');
      }
      
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('決済画面への移動中にエラーが発生しました。もう一度お試しください。')
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* ヘッダー部分 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-4 px-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 text-center md:text-left shrink-0">
            利用規約 / 이용약관
          </h1>
          <Link className="text-base text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-center md:items-end leading-tight gap-1 shrink-0" href="/welcome">
            <span>← 戻る</span>
            <span>뒤로 가기</span>
          </Link>
        </div>

        {/* 規約本文エリア */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-10 leading-relaxed text-slate-700">
          <section>
            <p className="text-lg font-medium mb-4">
              韓日ペンパル（以下「本サービス」）をご利用いただきありがとうございます。本サービスを利用する皆様（以下「ユーザー」）は、本規約に同意したものとみなされます。
              <br className="my-2"/>
              <span>한일 펜팔(이하 "본 서비스")을 이용해 주셔서 감사합니다. 본 서비스를 이용하는 모든 분(이하 "사용자")은 본 약관에 동의한 것으로 간주됩니다.</span>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              総則 / 총칙
            </h2>
            <p className="mb-2 font-bold text-lg text-slate-800">自分がして欲しくないことを他者にしてはならない。</p>
            <p className="font-bold text-lg text-slate-800">자신이 겪기 싫은 일을 타인에게 해서는 안 됩니다.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              1. 禁止事項 / 금지 사항
            </h2>
            <p className="mb-2 font-medium">ユーザーは、以下の行為を行ってはなりません。</p>
            <p className="mb-4 font-medium">사용자는 다음 행위를 해서는 안 됩니다.</p>
            <ul className="list-disc list-inside space-y-3 ml-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 font-medium">
              <li>法令や公序良俗に違反する行為<br/><span className="ml-5 inline-block mt-1">법령 및 공서양속에 위반되는 행위</span></li>
              <li>他のユーザーへの嫌がらせ、誹謗中傷、スパム行為<br/><span className="ml-5 inline-block mt-1">다른 사용자에 대한 괴롭힘, 비방, 스팸 행위</span></li>
              <li>個人情報の不正な収集や公開<br/><span className="ml-5 inline-block mt-1">개인정보의 부당한 수집 및 공개</span></li>
              <li>システムの破壊や不正アクセス<br/><span className="ml-5 inline-block mt-1">시스템 파괴 및 무단 접근</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              2. サービスの提供と停止 / 서비스 제공 및 중지
            </h2>
            <p className="mb-2 font-medium">本サービスは、メンテナンスや予期せぬトラブルにより、予告なくサービスを停止・変更する場合があります。</p>
            <p className="font-medium">본 서비스는 유지보수나 예기치 않은 문제로 인해 예고 없이 서비스를 중단하거나 변경할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              3. 免責事項 / 면책 조항
            </h2>
            <p className="mb-2 font-medium">運営者は、ユーザー同士のトラブルや、本サービスの利用によって生じた損害について、一切の責任を負いません。</p>
            <p className="font-medium">운영자는 사용자 간의 문제나 본 서비스 이용으로 인해 발생한 손해에 대해 어떠한 책임도 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              4. 規約の変更 / 약관 변경
            </h2>
            <p className="mb-2 font-medium">運営者は、必要と判断した場合、ユーザーに通知することなく本規約を変更できるものとします。</p>
            <p className="font-medium">운영자는 필요하다고 판단되는 경우 사용자에게 통지하지 않고 본 약관을 변경할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              5. 料金および返金について / 요금 및 환불에 대하여
            </h2>
            <p className="mb-2 font-medium">
              本サービスのプレミアム会員の月額料金は、デジタルコンテンツというサービスの性質上、お支払い手続き完了後の返金や日割り計算による精算は一切お受けできません。解約手続きを行った場合は、次回請求時からの更新停止となります。
            </p>
            <p className="font-medium">
              본 서비스의 프리미엄 회원 월간 요금은 디지털 콘텐츠라는 서비스 특성상 결제 절차가 완료된 후에는 환불이나 일할 계산을 통한 정산이 일절 불가합니다. 해지 절차를 진행할 경우, 다음 청구일 이후의 갱신이 중단됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              6. 手紙の仕様および制限 / 편지의 사양 및 제한 사항
            </h2>
            <p className="mb-2 font-medium">本サービスにおける手紙の送受信には、以下の仕様および制限が適用されます。あらかじめご了承ください。</p>
            <p className="mb-4 font-medium">본 서비스의 편지 송수신에는 다음과 같은 사양 및 제한이 적용됩니다. 미리 양해 부탁드립니다.</p>
            <ul className="list-disc list-inside space-y-3 ml-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 font-medium">
              <li>送信した手紙の取り消しおよび削除はできません。<br/><span className="ml-5 inline-block mt-1">발송한 편지는 취소 및 삭제가 불가능합니다.</span></li>
              <li>送信した手紙は、宛先のユーザーのみが閲覧できます。<br/><span className="ml-5 inline-block mt-1">발송한 편지는 수신자 본인만 열람할 수 있습니다.</span></li>
              <li>手紙は送信後すぐに相手の受信箱に届きますが、送信から36時間が経過するまで開封することはできません。<br/><span className="ml-5 inline-block mt-1">편지는 발송 즉시 상대방의 수신함에 도착하지만, 발송 후 36시간이 지날 때까지 열어볼 수 없습니다.</span></li>
              <li>手紙の送信は、1ヶ月あたり最大10通までに制限されています。<br/><span className="ml-5 inline-block mt-1">편지 발송은 월 최대 10통으로 제한됩니다.</span></li>
              <li>すべての手紙は、送信されてから300日が経過した時点でシステムにより自動的に削除されます。<br/><span className="ml-5 inline-block mt-1">모든 편지는 발송된 지 300일이 경과하면 시스템에 의해 자동으로 삭제됩니다.</span></li>
            </ul>
          </section>
        </div>

        {/* ユーザー情報入力エリア（生年月日と文化交流の同意） */}
        <div className="flex flex-col gap-6 items-center justify-center pt-2 w-full max-w-xl mx-auto">
          
          <div className="text-center text-rose-500 font-bold mb-2 flex flex-col gap-1 w-full">
            <span>⚠️ 一度登録・選択すると後から変更することはできません。</span>
            <span>한 번 등록/선택하면 나중에 변경할 수 없습니다.</span>
          </div>

          {/* 生年月日入力フォーム */}
          <div className="w-full bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-2">
            {/* ★変更：韓国語部分を覆っていたspanタグを削除し、日本語と同じスタイルが適用されるように修正しました */}
            <label className="font-bold text-slate-800 text-base sm:text-lg">
              生年月日を入力してください / 생년월일을 입력해 주세요
            </label>
            <input 
              type="date" 
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-slate-800 font-medium"
            />
          </div>

          <label className="flex items-center gap-4 cursor-pointer p-5 bg-white border border-slate-200 rounded-2xl hover:border-violet-300 hover:bg-violet-50 transition-all w-full shadow-sm">
            <input 
              type="radio" 
              name="agreement_culture" 
              value="korea"
              className="w-6 h-6 accent-violet-600 shrink-0 cursor-pointer" 
              onChange={(e) => setSelectedCulture(e.target.value)}
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-base sm:text-lg">利用規約に同意して韓国文化と交流する</span>
              <span className="font-bold text-slate-800 text-base sm:text-lg mt-1">이용약관에 동의하고 한국 문화와 교류하기</span>
            </div>
          </label>

          <label className="flex items-center gap-4 cursor-pointer p-5 bg-white border border-slate-200 rounded-2xl hover:border-violet-300 hover:bg-violet-50 transition-all w-full shadow-sm">
            <input 
              type="radio" 
              name="agreement_culture" 
              value="japan"
              className="w-6 h-6 accent-violet-600 shrink-0 cursor-pointer" 
              onChange={(e) => setSelectedCulture(e.target.value)}
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-base sm:text-lg">利用規約に同意して日本文化と交流する</span>
              <span className="font-bold text-slate-800 text-base sm:text-lg mt-1">이용약관에 동의하고 일본 문화와 교류하기</span>
            </div>
          </label>
        </div>
        
        {/* 下部アクション (LINE決済 & カカオ決済) */}
        <div className="flex flex-col items-center gap-3 pt-4 w-full max-w-md mx-auto">
          {(selectedCulture !== null && birthDate !== '') ? (
            <>
              <button 
                onClick={() => handlePayment('line')}
                disabled={isProcessing}
                className={`w-full px-8 py-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl font-bold text-lg shadow-sm transition-all flex flex-col items-center justify-center gap-1 leading-tight ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>LINE Pay で登録 (300円 / 月)</span>
                <span className="text-sm font-medium">라인페이로 등록 (300엔 / 월)</span>
              </button>
              
              <button 
                onClick={() => handlePayment('kakao')}
                disabled={isProcessing}
                className={`w-full px-8 py-4 bg-[#FEE500] hover:bg-[#e5ce00] text-slate-900 rounded-2xl font-bold text-lg shadow-sm transition-all flex flex-col items-center justify-center gap-1 leading-tight ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>カカオペイで登録 (3000ウォン / 月)</span>
                <span className="text-sm font-medium">카카오페이로 구독 (3000원 / 월)</span>
              </button>
            </>
          ) : (
            <>
              <button disabled className="w-full px-8 py-4 bg-slate-300 text-slate-500 cursor-not-allowed rounded-2xl font-bold text-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight">
                <span>LINE Pay で登録 (300円 / 月)</span>
                <span className="text-sm font-medium">라인페이로 등록 (300엔 / 월)</span>
              </button>
              
              <button disabled className="w-full px-8 py-4 bg-slate-300 text-slate-500 cursor-not-allowed rounded-2xl font-bold text-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight">
                <span>カカオペイで登録 (3000ウォン / 月)</span>
                <span className="text-sm font-medium">카카오페이로 구독 (3000원 / 월)</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}