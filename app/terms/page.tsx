import Link from 'next/link'

export default function TermsPage() {
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

          {/* 追加：総則 */}
          <section>
            <h2 className="text-xl font-bold text-violet-700 mb-3 border-l-4 border-violet-500 pl-3">
              総則 / 총칙
            </h2>
            <p className="mb-2 font-bold text-lg text-slate-800">
              自分がして欲しくないことを他者にしてはならない。
            </p>
            <p className="font-bold text-lg text-slate-800">
              자신이 겪기 싫은 일을 타인에게 해서는 안 됩니다.
            </p>
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
          
        </div>
        
        {/* 下部アクション */}
        <div className="flex justify-center pt-2">
          <Link href="/premium" className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-full font-bold text-lg shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1 leading-tight">
            <span>✨ プレミアム登録</span>
            <span className="text-sm">프리미엄 등록</span>
          </Link>
        </div>

      </div>
    </div>
  )
}