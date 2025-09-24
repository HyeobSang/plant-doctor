// src/lib/diagnose.js
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as mobilenet from '@tensorflow-models/mobilenet'

let model
const labels = ['overwatering','spidermite','powdery','healthy']
const prototypes = {} // { label: [embedding Tensor, ...] }

export async function initDiagnosis() {
  try { await tf.setBackend('webgl') } catch { await tf.setBackend('cpu') }
  await tf.ready()
  model = await mobilenet.load({ version: 2, alpha: 1.0 })

  for (const lab of labels) {
    prototypes[lab] = []
    for (let i=1; i<=3; i++) {
      const url = `/proto/${lab}/${i}.jpg`
      const img = await loadImage(url).catch(()=>null)
      if (!img) continue
      const emb = tf.tidy(()=> model.infer(img, true))
      prototypes[lab].push(emb)
    }
  }
}

export async function diagnose(files, answers=[]) {
  if (!model) await initDiagnosis()
  const imgs = await Promise.all([...files].map(fileToImage))
  const embs = imgs.map(img => tf.tidy(()=> model.infer(img, true)))
  // 색 변화 분석 (이미지들 평균)
const colors = await Promise.all(imgs.map(analyzeColor));
const color = {
  yellow: avg(colors.map(c=>c.yellow)),
  brown : avg(colors.map(c=>c.brown)),
  exg   : avg(colors.map(c=>c.exg)),
};

// 임계 기반 가중치 (MVP 값, 조정 가능)
if (color.yellow > 0.25 && color.exg < 0.0) {
  raw.chlorosis = (raw.chlorosis || 0) + 0.20; // 황화
}
if (color.brown > 0.20) {
  raw.leaf_scorch = (raw.leaf_scorch || 0) + 0.15; // 갈변/마름
}


  const raw = {}
  for (const [lab, protos] of Object.entries(prototypes)) {
    if (!protos.length) continue
    const sims = embs.map(e => avg(protos.map(p => cosine(e,p))))
    raw[lab] = avg(sims)
  }

  // 체크리스트 재가중치
  if (answers.includes('sticky_or_web')) raw.spidermite = (raw.spidermite||0) + 0.15
  if (answers.includes('white_powder'))   raw.powdery    = (raw.powdery||0)    + 0.20
  if (answers.includes('soil_wet'))       raw.overwatering = (raw.overwatering||0) + 0.15

  const probs = softmax(raw)
  const issues = Object.entries(probs)
    .sort((a,b)=>b[1]-a[1])
    .map(([k,v]) => ({ code: codeMap(k), label: labelMap(k), confidence: +v.toFixed(2) }))

  const top = issues[0] || {confidence:0}
  const decision = (top.confidence >= 0.6)
    ? { action:'start_protocol', level:'B', protocolId: protoMap(top.code) }
    : { action:'start_conservative_protocol', level:'A', protocolId:'proto_conservative_v1' }

  embs.forEach(t => t.dispose())
  return { species: [], issues, severity:'moderate', decision, features:{ color } }

}

// helpers
function fileToImage(file){
  return new Promise(res=>{
    const img = new Image()
    img.onload = ()=> res(img)
    img.src = URL.createObjectURL(file)
  })
}
function loadImage(src){
  return new Promise((res,rej)=>{
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = ()=> res(img)
    img.onerror = rej
    img.src = src
  })
}
function cosine(a,b){
  return tf.tidy(()=>{
    const dot = tf.sum(tf.mul(a,b))
    const na = tf.norm(a), nb = tf.norm(b)
    return dot.div(na.mul(nb).add(1e-8)).dataSync()[0]
  })
}
const avg = arr => arr.length ? arr.reduce((s,x)=>s+x,0)/arr.length : 0
function softmax(scores){
  const vals = Object.values(scores); if (!vals.length) return {}
  const max = Math.max(...vals)
  const exps = Object.fromEntries(Object.entries(scores).map(([k,v])=>[k, Math.exp(v-max)]))
  const sum = Object.values(exps).reduce((a,b)=>a+b,0)
  return Object.fromEntries(Object.entries(exps).map(([k,v])=>[k, v/sum]))
}
function codeMap(k){ return {
  overwatering:'abiotic_overwatering',
  spidermite:'pest_spidermite',
  powdery:'disease_powdery_mildew',
  healthy:'status_healthy',
  chlorosis:'abiotic_chlorosis',
  leaf_scorch:'abiotic_leaf_scorch',
}[k] }
function labelMap(k){ return {
  overwatering:'과습/배수불량',
  spidermite:'응애(거미응애)',
  powdery:'흰가루병',
  healthy:'건강',
  chlorosis:'황화(잎 노랗게 변함)',
  leaf_scorch:'갈변/마름(leaf scorch)',
}[k] }
function protoMap(code){ return {
  abiotic_overwatering:'proto_overwatering_v1',
  pest_spidermite:'proto_spidermite_basic_v1',
  disease_powdery_mildew:'proto_powdery_v1',
  status_healthy:'proto_checkup_v1',
  abiotic_chlorosis:'proto_chlorosis_v1',
  abiotic_leaf_scorch:'proto_leaf_scorch_v1',
}[code] }

function analyzeColor(img) {
  const off = document.createElement('canvas');
  off.width = 256; off.height = 256;
  const ctx = off.getContext('2d');
  // 이미지 비율 유지하며 꽉 차게 그리기(대충 fit)
  const r = img.width / img.height, cr = off.width / off.height;
  let w, h, x=0, y=0;
  if (r > cr) { w = off.width; h = Math.round(w / r); y = Math.round((off.height - h)/2); }
  else { h = off.height; w = Math.round(h * r); x = Math.round((off.width - w)/2); }
  ctx.drawImage(img, x, y, w, h);

  const { data } = ctx.getImageData(0,0,off.width, off.height);

  let n=0, yel=0, brn=0, grn=0, exgSum=0;
  for (let i=0; i<data.length; i+=4) {
    let R=data[i]/255, G=data[i+1]/255, B=data[i+2]/255;
    const max = Math.max(R,G,B), min = Math.min(R,G,B);
    const V = max, S = max===0 ? 0 : (max-min)/max;
    // 너무 어둡거나 채도 낮으면 제외
    if (V < 0.15 || S < 0.15) continue;
    // H 계산 (0~360)
    let H;
    if (max===min) H = 0;
    else if (max===R) H = 60*((G-B)/(max-min)) % 360;
    else if (max===G) H = 60*(2+(B-R)/(max-min));
    else              H = 60*(4+(R-G)/(max-min));
    if (H < 0) H += 360;

    // 지표
    const ExG = 2*G - R - B; exgSum += ExG;
    n++;

    if (H>=20 && H<=65) yel++;
    if (H>=10 && H<=40 && V<=0.55) brn++;
    if (H>=70 && H<=170) grn++;
  }
  return {
    yellow: n ? yel/n : 0,
    brown : n ? brn/n : 0,
    green : n ? grn/n : 0,
    exg   : n ? exgSum/n : 0
  };
}
