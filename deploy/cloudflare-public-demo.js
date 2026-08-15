const PAGE = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#173b57">
  <title>六分计划 · 公网体验版</title>
  <style>
    :root{--ink:#17223b;--muted:#697386;--paper:#f5f3ed;--navy:#173b57;--coral:#f46f55;--teal:#4ca797;--line:#e6e4dd}
    *{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Microsoft YaHei",sans-serif}button{font:inherit}a{color:inherit}
    .shell{min-height:100vh;display:grid;grid-template-columns:220px 1fr}.side{position:sticky;top:0;height:100vh;padding:26px 20px;display:flex;flex-direction:column;background:#fff;border-right:1px solid var(--line)}
    .brand{display:flex;align-items:center;gap:10px;font-weight:900}.mark{width:34px;height:34px;display:grid;place-items:center;color:#fff;background:var(--navy);border-radius:11px 11px 11px 4px;font:700 21px Georgia,serif}.side p{margin:48px 0 8px;color:var(--teal);font-size:11px;font-weight:900}.side small{color:var(--muted);line-height:1.7}.reset{margin-top:auto;padding:10px;border:1px solid var(--line);border-radius:10px;color:var(--muted);background:#fff;cursor:pointer}
    .main{padding:38px clamp(20px,5vw,70px) 70px}.banner{max-width:1050px;margin:0 auto 18px;padding:10px 14px;display:flex;gap:10px;align-items:center;color:#315c53;background:#e5f3ee;border:1px solid #c5e0d7;border-radius:11px;font-size:11px}.banner b{padding:5px 8px;color:#fff;background:var(--teal);border-radius:6px}
    .head{max-width:1050px;margin:0 auto 20px;display:flex;justify-content:space-between;align-items:end}.head p{margin:0 0 8px;color:var(--muted);font-size:12px}.head h1{margin:0;font:700 clamp(28px,4vw,42px) Georgia,"Songti SC",serif}.pill{padding:9px 13px;color:#537168;background:#fff;border:1px solid var(--line);border-radius:999px;font-size:11px}
    .stats{max-width:1050px;margin:0 auto 18px;display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.stat{padding:14px 16px;display:grid;gap:5px;background:#fff;border:1px solid var(--line);border-radius:12px}.stat span{color:#8a919c;font-size:10px}.stat strong{font-size:14px}
    .grid{max-width:1050px;margin:auto;display:grid;grid-template-columns:1fr 300px;gap:18px;align-items:start}.map,.guide{background:#fff;border:1px solid var(--line);border-radius:19px}.map{padding:22px}.maptop{display:flex;justify-content:space-between;align-items:end;margin-bottom:17px}.eyebrow{margin:0 0 8px;color:var(--coral);font-size:10px;font-weight:900;letter-spacing:.08em}.maptop h2{margin:0;font:700 24px Georgia,"Songti SC",serif}.overall{color:var(--teal);font-weight:900;font-size:12px}
    .worlds{display:grid;gap:13px}.world{overflow:hidden;border:1px solid color-mix(in srgb,var(--c) 28%,#e5e4de);border-radius:15px;background:color-mix(in srgb,var(--c) 6%,white)}.worldhead{padding:13px 15px;display:flex;align-items:center;gap:11px;background:color-mix(in srgb,var(--c) 12%,white);border-bottom:1px solid color-mix(in srgb,var(--c) 20%,#eee)}.worldhead b{padding:5px 7px;color:#fff;background:var(--c);border-radius:6px;font-size:9px}.worldhead strong{font-size:14px}.worldhead small{margin-left:auto;color:var(--muted);font-size:9px}
    .path{padding:13px;display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.node{min-height:102px;padding:10px;display:grid;align-content:center;justify-items:center;gap:6px;text-align:center;border:0;border-radius:13px;color:var(--muted);background:rgba(255,255,255,.66)}.node strong{width:38px;height:38px;display:grid;place-items:center;color:#fff;background:#c9ccc8;border-radius:50%;font-size:11px}.node span{font-size:10px;font-weight:800}.node small{font-size:9px}.node.active{cursor:pointer;outline:2px solid var(--c);background:#fff;box-shadow:0 7px 17px rgba(23,34,59,.1)}.node.active strong,.node.done strong{background:var(--c)}.node.done{cursor:pointer;color:var(--ink)}.node.locked{opacity:.43}.stars{color:#e7a43e!important;letter-spacing:1px}
    .guide{position:sticky;top:20px;padding:21px}.guide h2{margin:0 0 12px;font-size:19px}.guide ol{margin:0 0 20px;padding-left:19px;display:grid;gap:9px;color:var(--muted);font-size:12px;line-height:1.6}.primary{width:100%;padding:13px 18px;border:0;border-radius:11px;color:#fff;background:var(--navy);font-weight:900;cursor:pointer}.primary:hover{background:#285a72}.note{margin-top:14px;padding:13px;color:#cbd8de;background:var(--navy);border-radius:11px;font-size:11px;line-height:1.6}
    .play{min-height:100vh;padding:24px;background:radial-gradient(circle at 50% -20%,#d9ebe5 0 25%,transparent 48%),var(--paper)}.playtop{max-width:700px;margin:0 auto 20px;display:grid;grid-template-columns:38px 1fr 38px;gap:14px;align-items:center}.close{border:0;background:transparent;color:var(--muted);font-size:27px;cursor:pointer}.track{height:10px;overflow:hidden;background:#dcded9;border-radius:999px}.track i{display:block;height:100%;background:var(--teal);transition:width .3s}.card{max-width:650px;margin:auto;padding:38px 42px;background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:0 22px 55px rgba(31,49,64,.11)}.intro{text-align:center}.medal{width:70px;height:70px;margin:0 auto 20px;display:grid;place-items:center;color:#fff;background:var(--teal);border:7px solid #d8eee8;border-radius:50%;font:700 26px Georgia,serif}.card h1{margin:12px 0 20px;font:700 clamp(27px,5vw,40px) Georgia,"Songti SC",serif}.tips{margin:0 0 24px;padding:18px;text-align:left;color:var(--muted);background:#f7f6f1;border-radius:12px;font-size:13px;line-height:1.8}.qmeta{display:flex;justify-content:space-between;color:var(--teal);font-size:11px;font-weight:900}.answers{display:grid;gap:9px;margin:20px 0}.answer{padding:12px;display:grid;grid-template-columns:30px 1fr;gap:10px;align-items:center;text-align:left;color:var(--ink);background:#fff;border:1px solid #dcded8;border-radius:11px;cursor:pointer}.answer b{width:28px;height:28px;display:grid;place-items:center;background:#f0f1ed;border-radius:7px;font-size:10px}.answer.selected{border-color:var(--teal);background:#edf7f4;box-shadow:inset 0 0 0 1px var(--teal)}.answer.correct{border-color:#4ca17f;background:#eaf7f1}.answer.wrong{border-color:#db7464;background:#fff0ed}.feedback{margin:12px 0;padding:13px 15px;border-left:4px solid;border-radius:8px;font-size:12px;line-height:1.6}.feedback.good{color:#276d58;background:#edf8f4;border-color:#4ca17f}.feedback.bad{color:#8b4b3e;background:#fff2ef;border-color:#db7464}.result{text-align:center}.bigstars{margin:13px 0;color:#ddd;font-size:42px;letter-spacing:7px}.bigstars .on{color:#efa942}.score{display:block;color:var(--navy);font:700 58px Georgia,serif}.result p{color:var(--muted)}.actions{display:grid;gap:10px;margin-top:22px}.secondary{padding:10px;border:0;color:var(--muted);background:transparent;cursor:pointer}
    @media(max-width:850px){.shell{grid-template-columns:1fr}.side{position:static;height:auto;flex-direction:row;align-items:center}.side p,.side small,.reset{display:none}.grid{grid-template-columns:1fr}.guide{position:static}.path{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:560px){.main{padding:24px 12px 45px}.banner{align-items:flex-start;flex-direction:column}.head{align-items:flex-start;gap:12px}.pill{display:none}.stats{grid-template-columns:repeat(2,1fr)}.map{padding:14px 9px}.maptop h2{font-size:20px}.path{grid-template-columns:1fr 1fr}.card{padding:28px 19px}.play{padding:14px 10px}.answer{font-size:13px}}
  </style>
</head>
<body><div id="app"><main class="main"><div class="banner"><b>公开测试</b><span>正在加载六分计划闯关地图…</span></div><section class="map" style="max-width:760px;margin:40px auto;padding:32px"><p class="eyebrow">六分计划</p><h1 style="margin:0 0 14px;font:700 38px Georgia,'Songti SC',serif">半年闯关，目标雅思 6 分</h1><p style="color:#697386;line-height:1.8">页面内容正在启动。如果这里一直没有变化，请刷新一次页面。</p></section></main></div>
<script id="app-code" type="text/plain">
const worlds=[['启航岛','建立习惯，摸清起点','#4ca797'],['定位森林','听懂信息，快速定位','#75a85a'],['逻辑山谷','看懂结构，说清观点','#c6924b'],['表达港湾','稳定口语和写作','#e67763'],['冲刺高原','提升速度，补齐弱项','#4d83ae'],['六分之巅','适应考场，最后冲刺','#806aaa']];
const names=['认识雅思','句子地基','第一轮复习','起点挑战','信息定位','阅读寻路','薄弱点复习','定位挑战','段落逻辑','写作骨架','表达复习','结构挑战','听力跟速','口语展开','输出复习','表达挑战','长文攻坚','完整写作','高频错题复习','半程模考','速度稳定','考场表达','考前回收','六分终局'];
const lessons={
1:{title:'认识雅思',tip:'雅思由听力、阅读、写作、口语四部分组成。先看懂考试，再开始刷题。',qs:[['雅思完整考试包含哪四项？',['词汇、语法、翻译、写作','听力、阅读、写作、口语','听写、阅读、作文、面试','语法、阅读、口译、写作'],1,'总分由听力、阅读、写作和口语四个单项共同构成。'],['雅思听力的答案通常怎样出现？',['完全随机','按录音信息顺序出现','先出现最后一题','只在结尾出现'],1,'听力答案通常跟随录音中的信息顺序。'],['学术类与培训类哪两项相同？',['阅读和写作','听力和口语','听力和阅读','写作和口语'],1,'两种考试的听力与口语相同。'],['写作中哪项权重更高？',['Task 1','Task 2','完全相同','只看字数'],1,'Task 2 对写作成绩的贡献约为 Task 1 的两倍。'],['口语分为几个部分？',['2个','3个','4个','5个'],1,'口语包含 Part 1、Part 2、Part 3。']]},
2:{title:'句子地基',tip:'先保证主语、谓语和时态正确，再追求复杂表达。',qs:[['选择正确句子。',['Many students studying abroad.','Many students study abroad.','Many students abroad study because.','Study abroad many students.'],1,'Many students 是主语，study 是谓语。'],['The number of learners ___ every year.',['increase','increases','increasing','have increase'],1,'中心词 number 是单数，使用 increases。'],['哪句正确表达昨天发生的事？',['I attend yesterday.','I attended yesterday.','I attending yesterday.','I have attend yesterday.'],1,'明确过去时间使用一般过去时。'],['哪句因果关系最清楚？',['Transport is useful, people drive less.','Because transport is useful.','People drive less because transport is convenient.','Transport convenient because.'],2,'主句完整，并用 because 连接原因。'],['哪种口语回答更容易展开？',['Yes.','No.','Yes, because it saves me time.','Maybe good.'],2,'直接回答后补充原因更自然。']]},
3:{title:'第一轮复习',tip:'复习的重点不是重做，而是识别知识、定位、理解或粗心造成的错误。',qs:[['听力漏掉一题后应该？',['继续死等','立即跟上当前题','停止答题','从头播放'],1,'及时跟上可避免连续失分。'],['选择正确句子。',['The graph show a rise.','The graph shows a rise.','The graph showing a rise.','The graph are show.'],1,'The graph 是单数，谓语用 shows。'],['写作应优先保证？',['最长单词','每句复杂','回应题目且结构清楚','尽可能多写'],2,'回应任务和清楚结构是基础。'],['两类雅思不同的部分是？',['听力口语','阅读写作','听力阅读','全部不同'],1,'阅读与写作因考试类型而不同。'],['哪种口语回答更完整？',['Yes.','Hometown.','Yes. It is quiet and my family lives there.','I liking it.'],2,'直接回答并补充特点和原因。']]},
4:{title:'起点挑战',tip:'Boss关混合检查前三周内容。60分过关，80分两星，100分三星。',qs:[['雅思总分包含几个单项？',['2个','3个','4个','5个'],2,'听力、阅读、写作、口语共四项。'],['选择正确句子。',['Technology help students.','Technology helps students.','Technology helping students.','Technology are help.'],1,'Technology 是单数，使用 helps。'],['听力漏题后的优先策略？',['一直回想','跟上当前位置','放弃剩余题','随意填写'],1,'及时跟上避免连续失分。'],['哪句有完整观点和原因？',['I agree.','Because education is important.','I agree because education benefits the community.','Education important.'],2,'先表达立场，再给出理由。'],['Task 2 的成绩权重是？',['低于Task 1','约为Task 1两倍','完全相同','只算Task 2'],1,'官方格式说明 Task 2 权重约为 Task 1 的两倍。']]}}
const key='band-six-public-demo-v1';let state=load(),session=null;
function load(){try{return JSON.parse(localStorage.getItem(key))||{week:1,xp:0,progress:{}}}catch(e){return{week:1,xp:0,progress:{}}}}
function save(){localStorage.setItem(key,JSON.stringify(state))}
function status(w){if(state.progress[w]&&state.progress[w].passed)return'done';if(w===state.week)return'active';return'locked'}
function stars(w){return state.progress[w]?state.progress[w].stars:0}
function renderMap(){const done=Object.values(state.progress).filter(x=>x.passed).length;let html='<div class="shell"><aside class="side"><div class="brand"><span class="mark">6</span>六分计划</div><p>公网体验版</p><small>无需登录，进度仅保存在当前浏览器。</small><button class="reset" onclick="resetAll()">重置体验进度</button></aside><main class="main"><div class="banner"><b>公开测试</b><span>任何电脑或手机都可以打开 · 正式账号数据尚未接入</span></div><header class="head"><div><p>启航岛 · 第 '+state.week+' 周</p><h1>亲自走一遍闯关流程。</h1></div><span class="pill">体验模式</span></header><section class="stats"><div class="stat"><span>当前关卡</span><strong>第 '+state.week+' 周</strong></div><div class="stat"><span>累计经验</span><strong>'+state.xp+' XP</strong></div><div class="stat"><span>已获星星</span><strong>'+Object.values(state.progress).reduce((a,x)=>a+x.stars,0)+' 颗</strong></div><div class="stat"><span>总进度</span><strong>'+done+'/24 周</strong></div></section><div class="grid"><section class="map"><div class="maptop"><div><p class="eyebrow">24周闯关路线</p><h2>从起点走到六分之巅</h2></div><span class="overall">'+Math.round(done/24*100)+'%</span></div><div class="worlds">';
worlds.forEach((world,wi)=>{html+='<article class="world" style="--c:'+world[2]+'"><header class="worldhead"><b>世界 '+(wi+1)+'</b><strong>'+world[0]+'</strong><small>'+world[1]+'</small></header><div class="path">';for(let j=1;j<=4;j++){const w=wi*4+j,s=status(w),play=w<=4&&s!=='locked';html+='<button class="node '+s+'" '+(play?'onclick="start('+w+')"':'disabled')+'><strong>'+(j===4?'冠':w)+'</strong><span>'+names[w-1]+'</span><small class="'+(s==='done'?'stars':'')+'">'+(s==='done'?('★'.repeat(stars(w))+'☆'.repeat(3-stars(w))):(s==='active'?(w<=4?'开始':'待开放'):'锁'))+'</small></button>'}html+='</div></article>'});
html+='</div></section><aside class="guide"><p class="eyebrow">怎么玩</p><h2>点击地图中的“开始”</h2><ol><li>先看本关提示</li><li>完成5道互动题</li><li>获得星级和XP</li><li>返回地图查看解锁</li></ol><button class="primary" onclick="start('+Math.min(state.week,4)+')">进入当前关卡</button><div class="note">正式版将使用账号登录，把进度同步到手机和电脑。当前公开版只保存本机体验记录。</div></aside></div></main></div>';document.getElementById('app').innerHTML=html}
function start(w){if(!lessons[w])return;session={week:w,index:0,answers:[],selected:null,revealed:false};renderIntro()}
function top(progress){return'<div class="play"><div class="playtop"><button class="close" onclick="renderMap()">×</button><div class="track"><i style="width:'+progress+'%"></i></div><span style="color:#f46f55;text-align:center">♥</span></div>'}
function renderIntro(){const l=lessons[session.week];document.getElementById('app').innerHTML=top(5)+'<article class="card intro"><span class="medal">'+session.week+'</span><p class="eyebrow">第 '+session.week+' 周 · 约8分钟</p><h1>'+l.title+'</h1><div class="tips">'+l.tip+'</div><button class="primary" onclick="renderQuestion()">开始挑战</button></article></div>'}
function renderQuestion(){const l=lessons[session.week],q=l.qs[session.index],progress=Math.round((session.index+(session.revealed?1:0))/l.qs.length*100);let html=top(progress)+'<article class="card"><div class="qmeta"><span>第 '+session.week+' 周</span><strong>'+(session.index+1)+' / '+l.qs.length+'</strong></div><h1>'+q[0]+'</h1><div class="answers">';q[1].forEach((o,i)=>{let c=session.selected===i?'selected ':'';if(session.revealed)c+=i===q[2]?'correct':(session.selected===i?'wrong':'');html+='<button class="answer '+c+'" '+(session.revealed?'disabled':'onclick="choose('+i+')"')+'><b>'+String.fromCharCode(65+i)+'</b>'+o+'</button>'});html+='</div>';if(session.revealed)html+='<div class="feedback '+(session.selected===q[2]?'good':'bad')+'"><b>'+(session.selected===q[2]?'答对了！':'再记住这一点')+'</b><br>'+q[3]+'</div>';html+='<button class="primary" '+(session.selected===null?'disabled':'onclick="'+(session.revealed?'next()':'confirmAnswer()')+'"')+'>'+(session.revealed?(session.index===l.qs.length-1?'查看结算':'下一题'):'确认答案')+'</button></article></div>';document.getElementById('app').innerHTML=html}
function choose(i){session.selected=i;renderQuestion()}function confirmAnswer(){session.revealed=true;renderQuestion()}
function next(){session.answers.push(session.selected);const l=lessons[session.week];if(session.index<l.qs.length-1){session.index++;session.selected=null;session.revealed=false;renderQuestion()}else finish()}
function finish(){const l=lessons[session.week],correct=l.qs.reduce((n,q,i)=>n+(session.answers[i]===q[2]?1:0),0),score=Math.round(correct/l.qs.length*100),passed=score>=60,s=score===100?3:score>=80?2:passed?1:0,old=state.progress[session.week],first=passed&&!(old&&old.passed),xp=first?(20+s*10+(session.week%4===0?20:0)):0;if(passed){state.progress[session.week]={passed:true,stars:Math.max(old?old.stars:0,s)};if(session.week===state.week)state.week=Math.min(24,session.week+1);state.xp+=xp;save()}renderResult(score,correct,passed,s,xp)}
function renderResult(score,correct,passed,s,xp){let starHtml='';for(let i=1;i<=3;i++)starHtml+='<span class="'+(i<=s?'on':'')+'">★</span>';document.getElementById('app').innerHTML=top(100)+'<article class="card result"><p class="eyebrow">'+(passed?'挑战成功':'继续加油')+'</p><h1>'+(passed?'新路线已解锁！':'差一点就过关了')+'</h1><div class="bigstars">'+starHtml+'</div><strong class="score">'+score+'<small>分</small></strong><p>答对 '+correct+'/5 题'+(xp?', 获得 '+xp+' XP':'')+'</p><div class="actions"><button class="primary" onclick="'+(passed?'renderMap()':'start('+session.week+')')+'">'+(passed?'查看新地图':'重新挑战')+'</button>'+(passed&&session.week<4?'<button class="secondary" onclick="start('+(session.week+1)+')">直接进入下一关</button>':'')+'</div></article></div>'}
function resetAll(){if(confirm('确定重置体验进度吗？')){localStorage.removeItem(key);state=load();renderMap()}}renderMap();
</script><script src="/app.js"></script></body></html>`;

const SCRIPT_MARKER = '<script id="app-code" type="text/plain">';
const SCRIPT_START = PAGE.indexOf(SCRIPT_MARKER) + SCRIPT_MARKER.length;
const SCRIPT_END = PAGE.indexOf("</script>", SCRIPT_START);
const APP_SCRIPT = PAGE.slice(SCRIPT_START, SCRIPT_END);

const SERVER_WORLDS = [
  ["启航岛", "建立习惯，摸清起点", "#4ca797"],
  ["定位森林", "听懂信息，快速定位", "#75a85a"],
  ["逻辑山谷", "看懂结构，说清观点", "#c6924b"],
  ["表达港湾", "稳定口语和写作", "#e67763"],
  ["冲刺高原", "提升速度，补齐弱项", "#4d83ae"],
  ["六分之巅", "适应考场，最后冲刺", "#806aaa"],
];

const SERVER_NAMES = ["认识雅思", "句子地基", "第一轮复习", "起点挑战", "信息定位", "阅读寻路", "薄弱点复习", "定位挑战", "段落逻辑", "写作骨架", "表达复习", "结构挑战", "听力跟速", "口语展开", "输出复习", "表达挑战", "长文攻坚", "完整写作", "高频错题复习", "半程模考", "速度稳定", "考场表达", "考前回收", "六分终局"];

const SERVER_LESSONS = {
  1: { title: "认识雅思", tip: "先看懂考试，再开始刷题。", questions: [
    ["雅思完整考试包含哪四项？", ["词汇、语法、翻译、写作", "听力、阅读、写作、口语", "听写、阅读、作文、面试", "语法、阅读、口译、写作"], 1, "总分由听力、阅读、写作和口语四个单项共同构成。"],
    ["雅思听力的答案通常怎样出现？", ["完全随机", "按录音信息顺序出现", "先出现最后一题", "只在结尾出现"], 1, "听力答案通常跟随录音中的信息顺序。"],
    ["学术类与培训类哪两项相同？", ["阅读和写作", "听力和口语", "听力和阅读", "写作和口语"], 1, "两种考试的听力与口语相同。"],
    ["写作中哪项权重更高？", ["Task 1", "Task 2", "完全相同", "只看字数"], 1, "Task 2 对写作成绩的贡献约为 Task 1 的两倍。"],
    ["口语分为几个部分？", ["2个", "3个", "4个", "5个"], 1, "口语包含 Part 1、Part 2、Part 3。"],
  ]},
  2: { title: "句子地基", tip: "先保证主语、谓语和时态正确，再追求复杂表达。", questions: [
    ["选择正确句子。", ["Many students studying abroad.", "Many students study abroad.", "Many students abroad study because.", "Study abroad many students."], 1, "Many students 是主语，study 是谓语。"],
    ["The number of learners ___ every year.", ["increase", "increases", "increasing", "have increase"], 1, "中心词 number 是单数，使用 increases。"],
    ["哪句正确表达昨天发生的事？", ["I attend yesterday.", "I attended yesterday.", "I attending yesterday.", "I have attend yesterday."], 1, "明确过去时间使用一般过去时。"],
    ["哪句因果关系最清楚？", ["Transport is useful, people drive less.", "Because transport is useful.", "People drive less because transport is convenient.", "Transport convenient because."], 2, "主句完整，并用 because 连接原因。"],
    ["哪种口语回答更容易展开？", ["Yes.", "No.", "Yes, because it saves me time.", "Maybe good."], 2, "直接回答后补充原因更自然。"],
  ]},
  3: { title: "第一轮复习", tip: "识别知识、定位、理解或粗心造成的错误。", questions: [
    ["听力漏掉一题后应该？", ["继续死等", "立即跟上当前题", "停止答题", "从头播放"], 1, "及时跟上可避免连续失分。"],
    ["选择正确句子。", ["The graph show a rise.", "The graph shows a rise.", "The graph showing a rise.", "The graph are show."], 1, "The graph 是单数，谓语用 shows。"],
    ["写作应优先保证？", ["最长单词", "每句复杂", "回应题目且结构清楚", "尽可能多写"], 2, "回应任务和清楚结构是基础。"],
    ["两类雅思不同的部分是？", ["听力口语", "阅读写作", "听力阅读", "全部不同"], 1, "阅读与写作因考试类型而不同。"],
    ["哪种口语回答更完整？", ["Yes.", "Hometown.", "Yes. It is quiet and my family lives there.", "I liking it."], 2, "直接回答并补充特点和原因。"],
  ]},
  4: { title: "起点挑战", tip: "Boss 关混合检查前三周内容。60 分过关。", questions: [
    ["雅思总分包含几个单项？", ["2个", "3个", "4个", "5个"], 2, "听力、阅读、写作、口语共四项。"],
    ["选择正确句子。", ["Technology help students.", "Technology helps students.", "Technology helping students.", "Technology are help."], 1, "Technology 是单数，使用 helps。"],
    ["听力漏题后的优先策略？", ["一直回想", "跟上当前位置", "放弃剩余题", "随意填写"], 1, "及时跟上避免连续失分。"],
    ["哪句有完整观点和原因？", ["I agree.", "Because education is important.", "I agree because education benefits the community.", "Education important."], 2, "先表达立场，再给出理由。"],
    ["Task 2 的成绩权重是？", ["低于 Task 1", "约为 Task 1 两倍", "完全相同", "只算 Task 2"], 1, "Task 2 权重约为 Task 1 的两倍。"],
  ]},
};

const PAGE_STYLE = PAGE.slice(PAGE.indexOf("<style>"), PAGE.indexOf("</style>") + 8);

function documentPage(body) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#173b57"><title>六分计划 · 公网体验版</title>${PAGE_STYLE}<style>a.primary,a.node{text-decoration:none}.answer{width:100%}.server-form{display:grid;gap:9px}.server-note{max-width:1050px;margin:0 auto 18px;padding:10px 14px;color:#315c53;background:#e5f3ee;border:1px solid #c5e0d7;border-radius:11px;font-size:11px}</style></head><body>${body}</body></html>`;
}

function renderServerMap() {
  let worlds = "";
  SERVER_WORLDS.forEach((world, worldIndex) => {
    worlds += `<article class="world" style="--c:${world[2]}"><header class="worldhead"><b>世界 ${worldIndex + 1}</b><strong>${world[0]}</strong><small>${world[1]}</small></header><div class="path">`;
    for (let part = 1; part <= 4; part += 1) {
      const week = worldIndex * 4 + part;
      if (week <= 4) {
        worlds += `<a class="node ${week === 1 ? "active" : "done"}" href="/?level=${week}"><strong>${part === 4 ? "冠" : week}</strong><span>${SERVER_NAMES[week - 1]}</span><small>${week === 1 ? "开始" : "可体验"}</small></a>`;
      } else {
        worlds += `<span class="node locked"><strong>${part === 4 ? "冠" : week}</strong><span>${SERVER_NAMES[week - 1]}</span><small>锁</small></span>`;
      }
    }
    worlds += "</div></article>";
  });
  return documentPage(`<div class="shell"><aside class="side"><div class="brand"><span class="mark">6</span>六分计划</div><p>稳定体验版</p><small>服务器直接生成页面，不依赖浏览器脚本。</small></aside><main class="main"><div class="server-note"><b>公开测试</b> · 手机和电脑均可打开</div><header class="head"><div><p>启航岛 · 第 1 周</p><h1>亲自走一遍闯关流程。</h1></div><span class="pill">免登录体验</span></header><section class="stats"><div class="stat"><span>当前关卡</span><strong>第 1 周</strong></div><div class="stat"><span>累计经验</span><strong>0 XP</strong></div><div class="stat"><span>可体验</span><strong>4 关</strong></div><div class="stat"><span>总路线</span><strong>24 周</strong></div></section><div class="grid"><section class="map"><div class="maptop"><div><p class="eyebrow">24周闯关路线</p><h2>从起点走到六分之巅</h2></div><span class="overall">0%</span></div><div class="worlds">${worlds}</div></section><aside class="guide"><p class="eyebrow">怎么玩</p><h2>完成 5 道互动题</h2><ol><li>选择一个关卡</li><li>逐题作答并查看解析</li><li>结算分数和星级</li><li>返回地图继续体验</li></ol><a class="primary" style="display:block;text-align:center" href="/?level=1">进入第一关</a><div class="note">正式版将接入账号，实现手机和电脑进度同步。</div></aside></div></main></div>`);
}

function renderServerLevel(url) {
  const level = Math.min(4, Math.max(1, Number(url.searchParams.get("level")) || 1));
  const lesson = SERVER_LESSONS[level];
  const questionNumber = Number(url.searchParams.get("q")) || 0;
  const score = Math.max(0, Number(url.searchParams.get("score")) || 0);
  if (url.searchParams.get("result") === "1") {
    const percent = score * 20;
    const stars = percent === 100 ? 3 : percent >= 80 ? 2 : percent >= 60 ? 1 : 0;
    return documentPage(`<div class="play"><div class="playtop"><a class="close" href="/">×</a><div class="track"><i style="width:100%"></i></div><span></span></div><article class="card result"><p class="eyebrow">${percent >= 60 ? "挑战成功" : "继续加油"}</p><h1>${percent >= 60 ? "本关已完成！" : "再试一次就能过关"}</h1><div class="bigstars">${[1, 2, 3].map((item) => `<span class="${item <= stars ? "on" : ""}">★</span>`).join("")}</div><strong class="score">${percent}<small>分</small></strong><p>答对 ${score}/5 题</p><div class="actions"><a class="primary" href="/" style="display:block;text-align:center">返回闯关地图</a><a class="secondary" href="/?level=${level}" style="display:block">重新挑战</a></div></article></div>`);
  }
  if (questionNumber < 1) {
    return documentPage(`<div class="play"><div class="playtop"><a class="close" href="/">×</a><div class="track"><i style="width:5%"></i></div><span></span></div><article class="card intro"><span class="medal">${level}</span><p class="eyebrow">第 ${level} 周 · 约 8 分钟</p><h1>${lesson.title}</h1><div class="tips">${lesson.tip}</div><a class="primary" href="/?level=${level}&q=1&score=0" style="display:block;text-align:center">开始挑战</a></article></div>`);
  }
  const index = Math.min(4, questionNumber - 1);
  const question = lesson.questions[index];
  const answerValue = url.searchParams.get("answer");
  const answered = answerValue !== null;
  const selected = answered ? Number(answerValue) : -1;
  const isCorrect = selected === question[2];
  const nextScore = score + (answered && isCorrect ? 1 : 0);
  const answers = question[1].map((answer, answerIndex) => {
    let className = "answer";
    if (answered && answerIndex === question[2]) className += " correct";
    else if (answered && answerIndex === selected) className += " wrong";
    if (answered) return `<div class="${className}"><b>${String.fromCharCode(65 + answerIndex)}</b>${answer}</div>`;
    return `<button class="${className}" name="answer" value="${answerIndex}" type="submit"><b>${String.fromCharCode(65 + answerIndex)}</b>${answer}</button>`;
  }).join("");
  const footer = answered
    ? `<div class="feedback ${isCorrect ? "good" : "bad"}"><b>${isCorrect ? "答对了！" : "再记住这一点"}</b><br>${question[3]}</div><a class="primary" style="display:block;text-align:center" href="/?level=${level}&${questionNumber < 5 ? `q=${questionNumber + 1}&score=${nextScore}` : `result=1&score=${nextScore}`}">${questionNumber < 5 ? "下一题" : "查看结算"}</a>`
    : "";
  return documentPage(`<div class="play"><div class="playtop"><a class="close" href="/">×</a><div class="track"><i style="width:${Math.round((index / 5) * 100)}%"></i></div><span></span></div><article class="card"><div class="qmeta"><span>第 ${level} 周</span><strong>${questionNumber} / 5</strong></div><h1>${question[0]}</h1><form class="server-form" method="get" action="/"><input type="hidden" name="level" value="${level}"><input type="hidden" name="q" value="${questionNumber}"><input type="hidden" name="score" value="${score}">${answers}</form>${footer}</article></div>`);
}

function renderServerPage(url) {
  return url.searchParams.has("level") ? renderServerLevel(url) : renderServerMap();
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ ok: true, app: "band-six-demo" }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  if (url.pathname === "/app.js") {
    return new Response(APP_SCRIPT, {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "no-store, max-age=0",
        "x-content-type-options": "nosniff",
      },
    });
  }
  return new Response(renderServerPage(url), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    },
  });
}
