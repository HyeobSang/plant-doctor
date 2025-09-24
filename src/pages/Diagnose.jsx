import { useEffect, useState } from 'react'
import { initDiagnosis, diagnose } from '../lib/diagnose'
import { downloadICS } from '../lib/ics'

export default function DiagnosePage(){
  const [files, setFiles] = useState([])
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ initDiagnosis() },[])

  async function onAnalyze(){
    if (!files.length) return alert('사진을 선택해 주세요')
    setLoading(true)
    try { setResult(await diagnose(files, answers)) }
    finally { setLoading(false) }
  }
  function toggle(key){
    setAnswers(v => v.includes(key) ? v.filter(x=>x!==key) : [...v, key])
  }
  function startPrescription(){
    const id = crypto.randomUUID(), now = Date.now()
    const tasks = [
      { id:'t1-'+id, title:'물주기 중단·받침 물 비우기', condition:'표토 2–3cm 건조', status:'todo' },
      { id:'t2-'+id, title:'T+24h 상태 점검', dueAt:new Date(now+24*3600e3).toISOString(), status:'todo' },
      { id:'t3-'+id, title:'T+72h 재평가',   dueAt:new Date(now+72*3600e3).toISOString(), status:'todo' },
    ]
    localStorage.setItem('tasks', JSON.stringify(tasks))
    alert('처방 스케줄 생성 완료')
  }
  function exportICS(){
    const tasks = JSON.parse(localStorage.getItem('tasks')||'[]')
    if (!tasks.length) return alert('스케줄이 없습니다')
    downloadICS(tasks)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">AI 진단 데모</h1>
      <input type="file" multiple accept="image/*" onChange={e=>setFiles([...e.target.files])} />
      <div className="flex gap-4 text-sm">
        <label><input type="checkbox" onChange={()=>toggle('sticky_or_web')} /> 끈적임/거미줄</label>
        <label><input type="checkbox" onChange={()=>toggle('white_powder')} /> 하얀 가루</label>
        <label><input type="checkbox" onChange={()=>toggle('soil_wet')} /> 토양 항상 젖음</label>
      </div>
      <button
  className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
  onClick={onAnalyze}
  disabled={loading}
>
  {loading ? '분석 중…' : '분석'}
</button>


      {result && (
  <div className="rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
    <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">이슈 후보</h2>

    <ul className="mt-2 space-y-1 text-sm text-zinc-800 dark:text-zinc-200">
      {result.issues.slice(0,3).map(it=>(
        <li key={it.code}>
          • {it.label} <span className="text-zinc-500">(확신도 {it.confidence})</span>
        </li>
      ))}
    </ul>

    <div className="mt-3 text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">결정:</span>
      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
        ${result.decision.action === 'start_protocol'
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}>
        {result.decision.action === 'start_protocol' ? '표준(B) 시작' : '보수(A) 시작'}
      </span>
    </div>

    <div className="mt-4 flex gap-2">
      <button
        className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        onClick={startPrescription}
      >
        처방 시작
      </button>
      <button
        className="inline-flex items-center px-4 py-2 rounded-lg border border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/50"
        onClick={exportICS}
      >
        캘린더(.ics) 내보내기
      </button>
      {result?.features?.color && (
  <p className="mt-2 text-xs text-zinc-500">
    색 분석: 황화 {(result.features.color.yellow*100|0)}% · 갈변 {(result.features.color.brown*100|0)}%
  </p>
)}

    </div>
  </div>
)}

    </div>
  )
}
