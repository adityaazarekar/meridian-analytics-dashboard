import { useState, useEffect, useMemo } from "react";
import "./App.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Treemap, ComposedChart, Legend, ReferenceLine, Brush
} from "recharts";

// ─── PALETTE ────────────────────────────────────────────────────────────────
const P = {
  bg:"#080c14",surface:"rgba(255,255,255,0.03)",card:"rgba(255,255,255,0.055)",
  border:"rgba(255,255,255,0.09)",
  gold:"#e8b84b",goldDim:"rgba(232,184,75,0.15)",
  emerald:"#34d399",sky:"#38bdf8",rose:"#fb7185",violet:"#a78bfa",
  amber:"#fbbf24",slate:"#94a3b8",slateD:"#475569",white:"#f1f5f9",
};
const ACCENT=["#e8b84b","#34d399","#38bdf8","#fb7185","#a78bfa","#fbbf24","#f472b6","#4ade80"];
const SECTORS=["Technology","Finance","Healthcare","Energy","Consumer","Industrial","Telecom","Materials"];
const COUNTRIES=["United States","China","Japan","Germany","United Kingdom","India","France","Canada","South Korea","Brazil","Australia","Switzerland"];
const COUNTRY_ISO={"United States":"🇺🇸","China":"🇨🇳","Japan":"🇯🇵","Germany":"🇩🇪","United Kingdom":"🇬🇧","India":"🇮🇳","France":"🇫🇷","Canada":"🇨🇦","South Korea":"🇰🇷","Brazil":"🇧🇷","Australia":"🇦🇺","Switzerland":"🇨🇭"};
const SECTOR_COLORS=Object.fromEntries(SECTORS.map((s,i)=>[s,ACCENT[i]]));
const COUNTRY_COLORS=Object.fromEntries(COUNTRIES.map((c,i)=>[c,ACCENT[i%ACCENT.length]]));

// ─── DATA GENERATOR ─────────────────────────────────────────────────────────
function rnd(a,b){return Math.random()*(b-a)+a;}
function seed(s,a,b){const x=Math.sin(s*9301+49297)*233280;return a+(x-Math.floor(x))*(b-a);}
const NAMES=["Atlas","Nova","Vega","Orion","Apex","Zenith","Helix","Stratos","Axiom","Crest","Lumio","Ferro","Arcis","Quasar","Plex"];
const SUFFIXES=["Corp","Group","Holdings","Capital","Ventures","Systems","Partners","Labs","Global","Networks"];

const COMPANIES=Array.from({length:180},(_,i)=>{
  const sector=SECTORS[i%SECTORS.length];
  const country=COUNTRIES[i%COUNTRIES.length];
  const rev=seed(i,2,480);
  const mc=rev*seed(i+100,1.5,18);
  const earn=rev*seed(i+200,0.04,0.35);
  return{
    id:i,name:`${NAMES[i%15]} ${SUFFIXES[Math.floor(i/15)%10]}`,
    sector,country,
    capitalGravity:mc,revenueFlow:rev,netYield:earn,
    valuationIndex:seed(i+300,9,90),sharePrice:seed(i+400,12,2800),
    dividendRate:seed(i+500,0,0.07),liquidityScore:seed(i+600,20,98),
    growthMomentum:seed(i+700,-8,42),riskCoefficient:seed(i+800,10,85),
    marketPenetration:seed(i+900,5,95),efficiencyRatio:earn/rev,
  };
});

function buildSectorRollup(companies){
  return SECTORS.map(s=>{
    const g=companies.filter(c=>c.sector===s);
    return{
      sector:s,short:s.slice(0,4).toUpperCase(),
      capitalGravity:g.reduce((a,c)=>a+c.capitalGravity,0),
      revenueFlow:g.reduce((a,c)=>a+c.revenueFlow,0),
      netYield:g.reduce((a,c)=>a+c.netYield,0),
      count:g.length,
      avgValuation:g.reduce((a,c)=>a+c.valuationIndex,0)/(g.length||1),
      avgGrowth:g.reduce((a,c)=>a+c.growthMomentum,0)/(g.length||1),
      avgLiquidity:g.reduce((a,c)=>a+c.liquidityScore,0)/(g.length||1),
      color:SECTOR_COLORS[s],
    };
  });
}
function buildCountryRollup(companies){
  return COUNTRIES.map(cn=>{
    const g=companies.filter(c=>c.country===cn);
    return{
      country:cn,iso:COUNTRY_ISO[cn],flag:COUNTRY_ISO[cn],
      capitalGravity:g.reduce((a,c)=>a+c.capitalGravity,0),
      revenueFlow:g.reduce((a,c)=>a+c.revenueFlow,0),
      netYield:g.reduce((a,c)=>a+c.netYield,0),
      count:g.length,
      avgValuation:g.reduce((a,c)=>a+c.valuationIndex,0)/(g.length||1),
      avgGrowth:g.reduce((a,c)=>a+c.growthMomentum,0)/(g.length||1),
      avgLiquidity:g.reduce((a,c)=>a+c.liquidityScore,0)/(g.length||1),
      avgRisk:g.reduce((a,c)=>a+c.riskCoefficient,0)/(g.length||1),
      efficiencyRatio:g.reduce((a,c)=>a+c.efficiencyRatio,0)/(g.length||1),
      color:COUNTRY_COLORS[cn],
    };
  }).sort((a,b)=>b.capitalGravity-a.capitalGravity);
}
function buildTimeSeries(days=60){
  return Array.from({length:days},(_,i)=>{
    const base={day:i+1,label:`D${i+1}`};
    SECTORS.slice(0,5).forEach((s,j)=>{base[s]=300+j*60+Math.sin(i/days*8+j)*80+rnd(-20,20);});
    base.GlobalIndex=SECTORS.slice(0,5).reduce((a,s)=>a+(base[s]||0),0)/5;
    return base;
  });
}
function buildWaterfall(country){
  const cr=buildCountryRollup(COMPANIES).find(c=>c.country===country)||buildCountryRollup(COMPANIES)[0];
  const rev=cr.revenueFlow;
  const cogs=-rev*0.40;const opex=-rev*0.20;const tax=-(rev+cogs+opex)*0.22;const net=rev+cogs+opex+tax;
  const steps=[
    {name:"Gross Revenue",value:rev,cumulative:rev},
    {name:"Cost of Revenue",value:cogs,cumulative:rev+cogs},
    {name:"Operating Costs",value:opex,cumulative:rev+cogs+opex},
    {name:"Tax Provision",value:tax,cumulative:rev+cogs+opex+tax},
    {name:"Net Yield",value:net,cumulative:net},
  ];
  return steps.map((it,i)=>({
    ...it,i,base:i===0||i===steps.length-1?0:Math.min(steps[i-1].cumulative,it.cumulative),
    barVal:Math.abs(it.value),isPositive:it.value>=0,isTotal:i===0||i===steps.length-1,
  }));
}
const TIME_DATA=buildTimeSeries(60);
const SECTOR_DATA=buildSectorRollup(COMPANIES);
const COUNTRY_DATA=buildCountryRollup(COMPANIES);
const HEAT_DATA=Array.from({length:7},(_,r)=>Array.from({length:12},(_,c)=>({row:r,col:c,value:rnd(5,100)})));



// ─── TOOLTIP ────────────────────────────────────────────────────────────────
const TT=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:"#111827",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"10px 14px",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
      {label!==undefined&&<div style={{color:P.gold,fontWeight:700,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>{label}</div>}
      {payload.map((p,i)=>(
        <div key={i} style={{color:P.white,marginTop:3,display:"flex",justifyContent:"space-between",gap:20}}>
          <span style={{color:P.slateD,fontWeight:500}}>{p.name}</span>
          <span style={{fontFamily:"'DM Mono',monospace",color:p.color||P.white,fontWeight:600}}>{typeof p.value==="number"?p.value.toFixed(1):p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── SPARKLINE ──────────────────────────────────────────────────────────────
function Spark({data,color=P.gold,w=110,h=36}){
  if(!data?.length)return null;
  const mn=Math.min(...data),mx=Math.max(...data),range=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/range)*(h-4)-2}`);
  const area=[...pts,`${w},${h}`,`0,${h}`].join(" ");
  const id=`sg${color.replace(/[^a-z0-9]/gi,"")}`;
  return(
    <svg width={w} height={h} style={{overflow:"visible",opacity:.85}}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={.4}/><stop offset="100%" stopColor={color} stopOpacity={.02}/></linearGradient></defs>
      <polygon points={area} fill={`url(#${id})`}/>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.8} style={{filter:`drop-shadow(0 0 3px ${color})`}}/>
    </svg>
  );
}

// ─── ARC GAUGE ──────────────────────────────────────────────────────────────
function Gauge({value,max=100,color=P.gold,size=88,label=""}){
  const r=size/2-9,circ=2*Math.PI*r,arc=circ*0.75,fill=arc*(Math.min(value,max)/max);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <svg width={size} height={size} style={{transform:"rotate(135deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={7} strokeDasharray={`${arc} ${circ-arc}`}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7} strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 5px ${color}88)`,transition:"stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)"}}/>
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle" style={{fontFamily:"'DM Mono',monospace",fontSize:14,fill:P.white,transform:`rotate(-135deg)`,transformOrigin:`${size/2}px ${size/2}px`}}>{Math.round(value)}</text>
      </svg>
      <span style={{fontSize:9,color:P.slateD,letterSpacing:".15em",textTransform:"uppercase",fontWeight:600}}>{label}</span>
    </div>
  );
}

// ─── HEAT MAP ───────────────────────────────────────────────────────────────
function HeatMap({data}){
  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return(
    <div>
      <div style={{display:"flex",gap:2,marginBottom:4}}>
        <div style={{width:30}}/>
        {months.map(m=><div key={m} style={{flex:1,fontSize:8,color:P.slateD,textAlign:"center",letterSpacing:".04em"}}>{m}</div>)}
      </div>
      {data.map((row,ri)=>(
        <div key={ri} style={{display:"flex",gap:2,marginBottom:3,alignItems:"center"}}>
          <div style={{width:30,fontSize:9,color:P.slateD,textAlign:"right",paddingRight:6}}>{days[ri]}</div>
          {row.map((cell,ci)=>(
            <div key={ci} style={{flex:1,height:15,borderRadius:3,background:`rgba(232,184,75,${cell.value/100*0.85+0.05})`,opacity:.35+cell.value/100*.65,cursor:"pointer",transition:"transform .15s"}}
              onMouseEnter={e=>e.target.style.transform="scale(1.3)"}
              onMouseLeave={e=>e.target.style.transform="scale(1)"}
              title={`${days[ri]} ${months[ci]}: ${cell.value.toFixed(0)}`}/>
          ))}
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:8,justifyContent:"flex-end"}}>
        <span style={{fontSize:9,color:P.slateD}}>Low</span>
        {[.1,.3,.5,.7,.9].map(v=><div key={v} style={{width:12,height:12,borderRadius:2,background:`rgba(232,184,75,${v})`}}/>)}
        <span style={{fontSize:9,color:P.slateD}}>High</span>
      </div>
    </div>
  );
}

// ─── WATERFALL ──────────────────────────────────────────────────────────────
function Waterfall({items}){
  return(
    <ResponsiveContainer width="100%" height={210}>
      <ComposedChart data={items} margin={{left:0,right:0,top:10,bottom:0}}>
        <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
        <XAxis dataKey="name" tick={{fill:P.slateD,fontSize:9,fontFamily:"Plus Jakarta Sans"}} tickLine={false} axisLine={false}/>
        <YAxis tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
        <Tooltip content={<TT/>}/>
        <Bar dataKey="base" stackId="wf" fill="transparent" legendType="none"/>
        <Bar dataKey="barVal" name="Value" stackId="wf" radius={[4,4,0,0]}>
          {items.map((it,i)=>(<Cell key={i} fill={it.isTotal?P.gold:it.isPositive?P.emerald:P.rose} fillOpacity={.82}/>))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─── CORR MATRIX ────────────────────────────────────────────────────────────
function CorrMatrix(){
  const metrics=["Capital Gravity","Revenue Flow","Net Yield","Valuation","Share Price","Liquidity","Momentum","Risk"];
  const vals=[[1,.83,.76,.29,.64,.47,.35,-.21],[.83,1,.91,.18,.52,.39,.41,-.18],[.76,.91,1,.14,.48,.33,.38,-.15],[.29,.18,.14,1,.55,.22,.61,.43],[.64,.52,.48,.55,1,.31,.44,.19],[.47,.39,.33,.22,.31,1,.28,-.38],[.35,.41,.38,.61,.44,.28,1,-.52],[-.21,-.18,-.15,.43,.19,-.38,-.52,1]];
  const clr=v=>v>=.7?P.emerald:v>=.4?P.sky:v>=0?P.slateD:v>=-.3?P.amber:P.rose;
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th style={{padding:"6px 8px",width:90}}/>
            {metrics.map(m=><th key={m} style={{padding:"4px 6px",fontSize:9,color:P.slateD,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap",textAlign:"center"}}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {metrics.map((row,r)=>(
            <tr key={row}>
              <td style={{padding:"4px 8px",fontSize:9,color:P.slateD,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{row}</td>
              {vals[r].map((v,c)=>(
                <td key={c} style={{padding:"3px"}}>
                  <div style={{background:clr(v)+"1a",border:`1px solid ${clr(v)}30`,borderRadius:6,padding:"8px 5px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:clr(v),fontWeight:600,minWidth:50,transition:"background .2s",cursor:"default"}}
                    onMouseEnter={e=>e.currentTarget.style.background=clr(v)+"35"}
                    onMouseLeave={e=>e.currentTarget.style.background=clr(v)+"1a"}>
                    {v.toFixed(2)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("global");
  const [sector,setSector]=useState("All");
  const [country,setCountry]=useState("United States");
  const [live,setLive]=useState({gi:4821,vol:68,momentum:73,heat:41});

  useEffect(()=>{
    const id=setInterval(()=>{
      setLive(p=>({
        gi:Math.round(p.gi+rnd(-15,20)),
        vol:Math.min(100,Math.max(0,p.vol+rnd(-3,3))),
        momentum:Math.min(100,Math.max(0,p.momentum+rnd(-2,2))),
        heat:Math.min(100,Math.max(0,p.heat+rnd(-4,4))),
      }));
    },2500);
    return()=>clearInterval(id);
  },[]);

  const filtered=useMemo(()=>COMPANIES.filter(c=>sector==="All"||c.sector===sector),[sector]);
  const sectorData=useMemo(()=>buildSectorRollup(filtered),[filtered]);
  const countryData=useMemo(()=>buildCountryRollup(filtered),[filtered]);
  const countryDetail=useMemo(()=>COUNTRY_DATA.find(c=>c.country===country)||COUNTRY_DATA[0],[country]);
  const countryCompanies=useMemo(()=>COMPANIES.filter(c=>c.country===country),[country]);
  const wfItems=useMemo(()=>buildWaterfall(country),[country]);

  const totalCap=filtered.reduce((a,c)=>a+c.capitalGravity,0);
  const totalRev=filtered.reduce((a,c)=>a+c.revenueFlow,0);
  const avgVal=filtered.reduce((a,c)=>a+c.valuationIndex,0)/(filtered.length||1);
  const posGrowth=filtered.filter(c=>c.growthMomentum>0).length;

  const sp1=Array.from({length:20},(_,i)=>2800+Math.sin(i*.7)*200+rnd(-80,80));
  const sp2=Array.from({length:20},(_,i)=>totalRev/18+Math.sin(i*.5)*200+rnd(-80,80));
  const sp3=Array.from({length:20},(_,i)=>avgVal+Math.sin(i*.9)*8+rnd(-4,4));

  const TABS=[
    {id:"global",label:"Global Overview"},
    {id:"sectors",label:"Sector Intelligence"},
    {id:"timeseries",label:"Market Pulse"},
    {id:"landscape",label:"Alpha Landscape"},
    {id:"country",label:"Country Analysis"},
  ];

  const sectorCountryCross=useMemo(()=>{
    return COUNTRIES.slice(0,6).map(cn=>({
      country:cn.split(" ")[0],
      ...Object.fromEntries(SECTORS.slice(0,5).map(s=>[s,COMPANIES.filter(c=>c.country===cn&&c.sector===s).reduce((a,c)=>a+c.capitalGravity,0).toFixed(0)]))
    }));
  },[]);

  return(
    <>
     
      <div className="root">

        {/* ═══ HEADER ════════════════════════════════════════════════════════ */}
        <div style={{padding:"22px 28px 0",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#e8b84b,#f59e0b44)",border:"1px solid rgba(232,184,75,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 0 28px rgba(232,184,75,.3)"}}>◈</div>
                <div>
                  <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,3vw,28px)",fontWeight:700,color:P.white,letterSpacing:"-.01em",lineHeight:1}}>
                    Meridian <span style={{color:P.gold}}>Analytics</span>
                  </h1>
                  <div style={{fontSize:10,color:P.slateD,letterSpacing:".15em",textTransform:"uppercase",marginTop:3,fontWeight:600}}>Global Capital Intelligence Platform</div>
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
              <Gauge value={live.vol}      max={100} color={P.sky}     label="Volume"    size={86}/>
              <Gauge value={live.momentum} max={100} color={P.emerald} label="Momentum"  size={86}/>
              <Gauge value={live.heat}     max={100} color={P.rose}    label="Volatility" size={86}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:24,color:P.gold,fontWeight:500}}>{live.gi.toLocaleString()}</div>
                <div style={{fontSize:9,color:P.slateD,letterSpacing:".12em",textTransform:"uppercase",fontWeight:600,marginTop:2}}>Global Index</div>
                <div style={{marginTop:5,display:"flex",justifyContent:"center"}}><div className="dot"/></div>
              </div>
            </div>
          </div>

          {/* NAV */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",borderBottom:`1px solid ${P.border}`,paddingBottom:14}}>
            {TABS.map(t=>(
              <button key={t.id} className={`nav-tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
            ))}
            <div style={{flex:1}}/>
            <select className="sel" value={sector} onChange={e=>setSector(e.target.value)}>
              <option value="All">All Sectors</option>
              {SECTORS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ═══ CONTENT ═══════════════════════════════════════════════════════ */}
        <div style={{padding:"20px 28px 40px",display:"flex",flexDirection:"column",gap:20}}>

          {/* ░░ GLOBAL OVERVIEW ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {tab==="global"&&(
            <>
              {/* KPIs */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:14}}>
                {[
                  {label:"Capital Gravity",value:`$${(totalCap/1000).toFixed(1)}T`,delta:"+4.2%",up:true,spark:sp1,color:P.gold},
                  {label:"Revenue Flow",value:`$${totalRev.toFixed(0)}B`,delta:"+1.9%",up:true,spark:sp2,color:P.sky},
                  {label:"Valuation Index",value:`${avgVal.toFixed(1)}x`,delta:"-0.3%",up:false,spark:sp3,color:P.violet},
                  {label:"Growth Engines",value:posGrowth,delta:`of ${filtered.length}`,up:true,spark:null,color:P.emerald},
                  {label:"Economies Covered",value:COUNTRIES.length,delta:"Nations",up:null,spark:null,color:P.amber},
                  {label:"Sector Segments",value:SECTORS.length,delta:"Segments",up:null,spark:null,color:P.rose},
                ].map((k,i)=>(
                  <div key={i} className="card fu" style={{padding:"18px 20px",animationDelay:`${i*.05}s`}}>
                    <div className="kl">{k.label}</div>
                    <div className="kv" style={{color:k.color,fontSize:20}}>{k.value}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                      <span className={`kd ${k.up===true?"up":k.up===false?"dn":"nt"}`}>{k.up===true?"▲ ":k.up===false?"▼ ":""}{k.delta}</span>
                      {k.spark&&<Spark data={k.spark} color={k.color}/>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Treemap + Donut */}
              <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:18}}>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Capital Distribution — Sector Treemap</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <Treemap data={sectorData.map(s=>({name:s.sector,size:s.capitalGravity,color:s.color}))} dataKey="size" aspectRatio={16/9}
                      content={({x,y,width,height,name,size,color:c})=>(
                        <g>
                          <rect x={x+1} y={y+1} width={width-2} height={height-2} fill={c} fillOpacity={.65} stroke={P.bg} strokeWidth={2} rx={6}/>
                          {width>70&&<text x={x+width/2} y={y+height/2-(height>50?8:0)} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={Math.min(13,width/7)} fontFamily="Plus Jakarta Sans" fontWeight={600}>{name}</text>}
                          {width>70&&height>50&&<text x={x+width/2} y={y+height/2+12} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,.6)" fontSize={9} fontFamily="DM Mono">{(size/1000).toFixed(1)}T</text>}
                        </g>
                      )}/>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Revenue Flow by Sector</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={sectorData} dataKey="revenueFlow" nameKey="sector" cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4}>
                        {sectorData.map((_,i)=>(<Cell key={i} fill={ACCENT[i]} fillOpacity={.82} stroke="rgba(0,0,0,.3)" strokeWidth={1}/>))}
                      </Pie>
                      <Tooltip content={<TT/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"5px 12px",marginTop:8}}>
                    {sectorData.map(s=>(<div key={s.sector} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:s.color}}/><span style={{fontSize:10,color:P.slateD}}>{s.sector}</span></div>))}
                  </div>
                </div>
              </div>

              {/* Country Bars + Scatter */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Sovereign Capital Gravity — Top Economies</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={countryData.slice(0,8)} layout="vertical" margin={{left:100,right:12}}>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false}/>
                      <XAxis type="number" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <YAxis type="category" dataKey="country" tick={{fill:P.slate,fontSize:11,fontFamily:"Plus Jakarta Sans",fontWeight:500}} tickLine={false} width={105}/>
                      <Tooltip content={<TT/>}/>
                      <Bar dataKey="capitalGravity" name="Capital Gravity" radius={[0,5,5,0]}>
                        {countryData.slice(0,8).map((_,i)=>(<Cell key={i} fill={ACCENT[i%ACCENT.length]} fillOpacity={.78}/>))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Growth Momentum × Liquidity — Economy Scatter</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <ScatterChart margin={{left:0,right:10,top:5}}>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                      <XAxis dataKey="avgGrowth" name="Growth Momentum" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <YAxis dataKey="avgLiquidity" name="Liquidity Score" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <ZAxis dataKey="capitalGravity" range={[40,300]}/>
                      <Tooltip content={({active,payload})=>{
                        if(!active||!payload?.length)return null;
                        const d=payload[0]?.payload;
                        return<div style={{background:"#111827",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px",fontSize:12}}>
                          <div style={{color:P.gold,fontWeight:700}}>{d?.flag} {d?.country}</div>
                          <div style={{color:P.slateD,marginTop:4}}>Growth: <span style={{color:P.emerald,fontFamily:"DM Mono"}}>{d?.avgGrowth?.toFixed(1)}%</span></div>
                          <div style={{color:P.slateD}}>Liquidity: <span style={{color:P.sky,fontFamily:"DM Mono"}}>{d?.avgLiquidity?.toFixed(0)}</span></div>
                        </div>;
                      }}/>
                      <ReferenceLine x={0} stroke="rgba(255,255,255,.1)" strokeDasharray="3 3"/>
                      <Scatter data={countryData}>
                        {countryData.map((_,i)=>(<Cell key={i} fill={ACCENT[i%ACCENT.length]} fillOpacity={.8}/>))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sector × Country Cross-tab */}
              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">Capital Gravity — Sector × Economy Heatmap</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",width:"100%",fontSize:12}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${P.border}`}}>
                        <th style={{padding:"8px 14px",textAlign:"left",fontSize:9,color:P.slateD,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>Economy</th>
                        {SECTORS.slice(0,5).map(s=><th key={s} style={{padding:"8px 10px",textAlign:"center",fontSize:9,color:P.slateD,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>{s}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {sectorCountryCross.map((row,ri)=>{
                        const vals=SECTORS.slice(0,5).map(s=>parseFloat(row[s])||0);
                        const maxV=Math.max(...vals);
                        return(
                          <tr key={ri} className="trow">
                            <td style={{padding:"10px 14px",color:P.white,fontWeight:600}}>{COUNTRY_ISO[COUNTRIES[ri]]} {COUNTRIES[ri].split(" ")[0]}</td>
                            {SECTORS.slice(0,5).map((s,si)=>{
                              const v=parseFloat(row[s])||0;
                              const pct=maxV>0?v/maxV:0;
                              return(
                                <td key={si} style={{padding:"6px 8px",textAlign:"center"}}>
                                  <div style={{background:`rgba(232,184,75,${pct*.6+.05})`,borderRadius:6,padding:"7px 4px",fontFamily:"DM Mono",fontSize:11,color:P.white,fontWeight:500,opacity:.5+pct*.5}}>
                                    {(v/1000).toFixed(1)}T
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Calendar */}
              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">Market Activity Intensity — Annual Calendar View</div>
                <HeatMap data={HEAT_DATA}/>
              </div>

              {/* Leaderboard */}
              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">Capital Gravity Leaderboard — Top Entities</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${P.border}`}}>
                        {["Rank","Entity","Sector","Economy","Capital Gravity","Revenue Flow","Valuation","Growth Momentum","Liquidity"].map(h=>(
                          <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:9,color:P.slateD,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.sort((a,b)=>b.capitalGravity-a.capitalGravity).slice(0,14).map((c,i)=>(
                        <tr key={c.id} className="trow">
                          <td style={{padding:"10px 12px",color:P.slateD,fontFamily:"DM Mono",fontSize:11}}>{String(i+1).padStart(2,"0")}</td>
                          <td style={{padding:"10px 12px",color:P.white,fontWeight:600}}>{c.name}</td>
                          <td style={{padding:"10px 12px"}}><span className="badge" style={{background:SECTOR_COLORS[c.sector]+"18",color:SECTOR_COLORS[c.sector]}}>{c.sector}</span></td>
                          <td style={{padding:"10px 12px",color:P.slate,fontSize:12}}>{COUNTRY_ISO[c.country]} {c.country.split(" ")[0]}</td>
                          <td style={{padding:"10px 12px",fontFamily:"DM Mono",color:P.gold,fontSize:12}}>{c.capitalGravity.toFixed(1)}B</td>
                          <td style={{padding:"10px 12px",fontFamily:"DM Mono",color:P.sky,fontSize:12}}>{c.revenueFlow.toFixed(1)}B</td>
                          <td style={{padding:"10px 12px",fontFamily:"DM Mono",color:c.valuationIndex>60?P.rose:P.amber,fontSize:12}}>{c.valuationIndex.toFixed(1)}x</td>
                          <td style={{padding:"10px 12px",fontFamily:"DM Mono",color:c.growthMomentum>0?P.emerald:P.rose,fontSize:12}}>{c.growthMomentum>0?"+":""}{c.growthMomentum.toFixed(1)}%</td>
                          <td style={{padding:"10px 12px",minWidth:100}}><div className="prog"><div className="pfill" style={{width:`${c.liquidityScore}%`,background:`linear-gradient(90deg,${P.sky}66,${P.sky})`}}/></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ░░ SECTOR INTELLIGENCE ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {tab==="sectors"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Multi-Metric Sector Radar</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={sectorData.map(s=>({sector:s.short,"Capital":Math.min(100,s.capitalGravity/200),"Revenue":Math.min(100,s.revenueFlow/60),"Yield":Math.min(100,s.netYield*5),"Valuation":Math.min(100,s.avgValuation*1.1),"Growth":Math.min(100,s.avgGrowth*3+50)}))} margin={{top:10,right:30,bottom:10,left:30}}>
                      <PolarGrid stroke="rgba(255,255,255,.08)"/>
                      <PolarAngleAxis dataKey="sector" tick={{fill:P.slate,fontFamily:"Plus Jakarta Sans",fontSize:11,fontWeight:600}}/>
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0,100]}/>
                      <Radar name="Capital Gravity" dataKey="Capital"   stroke={P.gold}    fill={P.gold}    fillOpacity={.15} strokeWidth={2}/>
                      <Radar name="Revenue Flow"    dataKey="Revenue"   stroke={P.sky}     fill={P.sky}     fillOpacity={.1}  strokeWidth={2}/>
                      <Radar name="Net Yield"       dataKey="Yield"     stroke={P.emerald} fill={P.emerald} fillOpacity={.1}  strokeWidth={2}/>
                      <Radar name="Growth Momentum" dataKey="Growth"    stroke={P.rose}    fill={P.rose}    fillOpacity={.08} strokeWidth={2}/>
                      <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                      <Tooltip content={<TT/>}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Net Yield vs Revenue — Composite View</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={sectorData} margin={{left:0,right:0}}>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                      <XAxis dataKey="short" tick={{fill:P.slateD,fontSize:11}} tickLine={false} axisLine={false}/>
                      <YAxis yAxisId="l" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <YAxis yAxisId="r" orientation="right" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <Tooltip content={<TT/>}/>
                      <Bar yAxisId="l" dataKey="revenueFlow" name="Revenue Flow" radius={[4,4,0,0]}>
                        {sectorData.map((_,i)=>(<Cell key={i} fill={ACCENT[i]} fillOpacity={.65}/>))}
                      </Bar>
                      <Line yAxisId="r" type="monotone" dataKey="netYield" name="Net Yield" stroke={P.gold} strokeWidth={2.5} dot={{fill:P.gold,r:4,strokeWidth:0}}/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sector Cards Grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14}}>
                {sectorData.map((s,i)=>(
                  <div key={s.sector} className="card-flat fu" style={{padding:"18px",animationDelay:`${i*.04}s`,borderLeft:`3px solid ${s.color}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:P.white}}>{s.sector}</div>
                        <div style={{fontSize:10,color:P.slateD,marginTop:2}}>{s.count} entities</div>
                      </div>
                      <span className="badge" style={{background:s.color+"18",color:s.color}}>{s.avgGrowth>0?"▲":"▼"} {Math.abs(s.avgGrowth).toFixed(1)}%</span>
                    </div>
                    {[
                      {label:"Capital Gravity",val:`${(s.capitalGravity/1000).toFixed(2)}T`,pct:s.capitalGravity/25000,color:P.gold},
                      {label:"Revenue Flow",val:`${s.revenueFlow.toFixed(0)}B`,pct:s.revenueFlow/5000,color:P.sky},
                      {label:"Net Yield",val:`${s.netYield.toFixed(0)}B`,pct:s.netYield/1500,color:P.emerald},
                      {label:"Avg Valuation",val:`${s.avgValuation.toFixed(1)}x`,pct:s.avgValuation/100,color:P.violet},
                    ].map(row=>(
                      <div key={row.label} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:10,color:P.slateD,fontWeight:500}}>{row.label}</span>
                          <span style={{fontSize:11,color:row.color,fontFamily:"DM Mono",fontWeight:500}}>{row.val}</span>
                        </div>
                        <div className="prog"><div className="pfill" style={{width:`${Math.min(row.pct*100,100)}%`,background:`linear-gradient(90deg,${row.color}55,${row.color})`}}/></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">Valuation Index vs Liquidity Score — Sector Benchmark</div>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={sectorData} margin={{left:0,right:0}}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                    <XAxis dataKey="short" tick={{fill:P.slateD,fontSize:11}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<TT/>}/>
                    <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                    <Bar dataKey="avgValuation" name="Valuation Index" fill={P.violet} fillOpacity={.75} radius={[3,3,0,0]}/>
                    <Bar dataKey="avgLiquidity" name="Liquidity Score" fill={P.sky}    fillOpacity={.75} radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ░░ MARKET PULSE ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {tab==="timeseries"&&(
            <>
              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">60-Day Capital Flow Streams — All Sectors</div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={TIME_DATA} margin={{left:0,right:10}}>
                    <defs>
                      {SECTORS.slice(0,5).map((s,i)=>(
                        <linearGradient key={s} id={`ag${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ACCENT[i]} stopOpacity={.5}/>
                          <stop offset="95%" stopColor={ACCENT[i]} stopOpacity={.02}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                    <XAxis dataKey="label" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<TT/>}/>
                    <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                    <Brush dataKey="label" height={22} stroke={P.border} fill="rgba(0,0,0,.3)" travellerWidth={6}/>
                    {SECTORS.slice(0,5).map((s,i)=>(
                      <Area key={s} type="monotone" dataKey={s} stroke={ACCENT[i]} fill={`url(#ag${i})`} strokeWidth={2} dot={false}/>
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Global Index Trajectory</div>
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={TIME_DATA} margin={{left:0,right:10}}>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                      <XAxis dataKey="label" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <Tooltip content={<TT/>}/>
                      <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                      <Line type="monotone" dataKey="GlobalIndex" name="Global Index" stroke={P.gold} strokeWidth={2.5} dot={false} style={{filter:`drop-shadow(0 0 4px ${P.gold}88)`}}/>
                      <Line type="monotone" dataKey="Technology"  name="Technology"   stroke={P.sky}  strokeWidth={1.5} dot={false} strokeDasharray="5 3"/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Stacked Volume — Top 3 Sectors</div>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={TIME_DATA.filter((_,i)=>i%3===0)} margin={{left:0,right:0}}>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                      <XAxis dataKey="label" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <Tooltip content={<TT/>}/>
                      <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                      <Bar dataKey="Technology" name="Technology" stackId="s" fill={ACCENT[0]} fillOpacity={.8}/>
                      <Bar dataKey="Finance"    name="Finance"    stackId="s" fill={ACCENT[1]} fillOpacity={.8}/>
                      <Bar dataKey="Healthcare" name="Healthcare" stackId="s" fill={ACCENT[2]} fillOpacity={.8} radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">Momentum Bands — Energy & Consumer</div>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={TIME_DATA} margin={{left:0,right:10}}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                    <XAxis dataKey="label" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                    <Tooltip content={<TT/>}/>
                    <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                    <Area type="monotone" dataKey="Energy"   name="Energy Band"   fill={P.amber}  stroke={P.amber}  strokeWidth={0} fillOpacity={.12}/>
                    <Line type="monotone" dataKey="Energy"   name="Energy"        stroke={P.amber}  strokeWidth={2} dot={false}/>
                    <Line type="monotone" dataKey="Consumer" name="Consumer"      stroke={P.violet} strokeWidth={2} dot={false}/>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ░░ ALPHA LANDSCAPE ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {tab==="landscape"&&(
            <>
              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">Alpha Landscape — Growth Momentum × Liquidity × Capital Gravity</div>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{left:0,right:0,top:10}}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                    <XAxis dataKey="growthMomentum" name="Growth Momentum" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false} label={{value:"Growth Momentum →",fill:P.slateD,fontSize:9,position:"insideBottom",offset:-2}}/>
                    <YAxis dataKey="liquidityScore" name="Liquidity Score" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                    <ZAxis dataKey="capitalGravity" range={[25,280]}/>
                    <Tooltip content={({active,payload})=>{
                      if(!active||!payload?.length)return null;
                      const d=payload[0]?.payload;
                      return<div style={{background:"#111827",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px",fontSize:12}}>
                        <div style={{color:P.gold,fontWeight:700,marginBottom:4}}>{d?.name}</div>
                        <div style={{color:P.slateD}}>Sector: <span style={{color:SECTOR_COLORS[d?.sector]}}>{d?.sector}</span></div>
                        <div style={{color:P.slateD}}>Growth: <span style={{color:d?.growthMomentum>0?P.emerald:P.rose,fontFamily:"DM Mono"}}>{d?.growthMomentum?.toFixed(1)}%</span></div>
                        <div style={{color:P.slateD}}>Liquidity: <span style={{color:P.sky,fontFamily:"DM Mono"}}>{d?.liquidityScore?.toFixed(0)}</span></div>
                        <div style={{color:P.slateD}}>Capital: <span style={{color:P.white,fontFamily:"DM Mono"}}>{d?.capitalGravity?.toFixed(0)}B</span></div>
                      </div>;
                    }}/>
                    <ReferenceLine x={0} stroke="rgba(255,255,255,.12)" strokeDasharray="4 4"/>
                    <Scatter data={filtered.slice(0,70)}>
                      {filtered.slice(0,70).map((c,i)=>(<Cell key={i} fill={SECTOR_COLORS[c.sector]} fillOpacity={.72}/>))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Efficiency Ratio Distribution</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={Array.from({length:20},(_,i)=>{
                      const count=filtered.filter(c=>c.efficiencyRatio>=i*.05&&c.efficiencyRatio<(i+1)*.05).length;
                      return{bin:`${(i*5)}%`,count};
                    })} margin={{left:0,right:0}}>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                      <XAxis dataKey="bin" tick={{fill:P.slateD,fontSize:9}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <Tooltip content={<TT/>}/>
                      <Bar dataKey="count" name="Entity Count" radius={[3,3,0,0]}>
                        {Array.from({length:20},(_,i)=>(<Cell key={i} fill={ACCENT[i%ACCENT.length]} fillOpacity={.72}/>))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Valuation Index vs Share Price</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <ScatterChart margin={{left:0,right:10,top:5}}>
                      <CartesianGrid stroke="rgba(255,255,255,.05)" strokeDasharray="4 4"/>
                      <XAxis dataKey="valuationIndex" name="Valuation Index" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <YAxis dataKey="sharePrice" name="Share Price" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                      <ZAxis dataKey="capitalGravity" range={[20,180]}/>
                      <Tooltip content={({active,payload})=>{
                        if(!active||!payload?.length)return null;
                        const d=payload[0]?.payload;
                        return<div style={{background:"#111827",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"10px 14px",fontSize:12}}>
                          <div style={{color:P.gold,fontWeight:700,marginBottom:4}}>{d?.name}</div>
                          <div style={{color:P.slateD}}>Valuation: <span style={{color:P.violet,fontFamily:"DM Mono"}}>{d?.valuationIndex?.toFixed(1)}x</span></div>
                          <div style={{color:P.slateD}}>Price: <span style={{color:P.amber,fontFamily:"DM Mono"}}>£{d?.sharePrice?.toFixed(0)}</span></div>
                        </div>;
                      }}/>
                      <Scatter data={filtered.slice(0,80)}>
                        {filtered.slice(0,80).map((c,i)=>(<Cell key={i} fill={SECTOR_COLORS[c.sector]} fillOpacity={.65}/>))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">Cross-Metric Correlation Matrix</div>
                <CorrMatrix/>
              </div>
            </>
          )}

          {/* ░░ COUNTRY ANALYSIS ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
          {tab==="country"&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <span style={{fontWeight:700,color:P.white,fontSize:14}}>Analyzing Economy:</span>
                <select className="sel" style={{minWidth:230,fontSize:15,fontWeight:600}} value={country} onChange={e=>setCountry(e.target.value)}>
                  {COUNTRIES.map(c=><option key={c} value={c}>{COUNTRY_ISO[c]} {c}</option>)}
                </select>
                <div className="dot"/>
                <span style={{fontSize:11,color:P.slateD}}>Live intelligence active</span>
              </div>

              {/* Country KPIs */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:14}}>
                {[
                  {label:"Capital Gravity",val:`$${(countryDetail.capitalGravity/1000).toFixed(2)}T`,color:P.gold},
                  {label:"Revenue Flow",val:`$${countryDetail.revenueFlow.toFixed(0)}B`,color:P.sky},
                  {label:"Net Yield",val:`$${countryDetail.netYield.toFixed(0)}B`,color:P.emerald},
                  {label:"Valuation Index",val:`${countryDetail.avgValuation.toFixed(1)}x`,color:P.violet},
                  {label:"Growth Momentum",val:`${countryDetail.avgGrowth>0?"+":""}${countryDetail.avgGrowth.toFixed(1)}%`,color:countryDetail.avgGrowth>0?P.emerald:P.rose},
                  {label:"Liquidity Score",val:countryDetail.avgLiquidity.toFixed(0),color:P.amber},
                  {label:"Risk Coefficient",val:countryDetail.avgRisk.toFixed(0),color:P.rose},
                  {label:"Entities Tracked",val:countryDetail.count,color:P.slate},
                ].map((k,i)=>(
                  <div key={i} className="card fu" style={{padding:"16px 18px",animationDelay:`${i*.04}s`}}>
                    <div className="kl">{k.label}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:500,color:k.color,marginTop:6}}>{k.val}</div>
                  </div>
                ))}
              </div>

              {/* Sector Pie + Waterfall */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Sector Contribution — {country.split(" ")[0]}</div>
                  <ResponsiveContainer width="100%" height={270}>
                    <PieChart>
                      <Pie data={SECTORS.map(s=>({name:s,value:countryCompanies.filter(c=>c.sector===s).reduce((a,c)=>a+c.capitalGravity,0)})).filter(d=>d.value>0)}
                        dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                        {SECTORS.map((s,i)=>(<Cell key={i} fill={SECTOR_COLORS[s]} fillOpacity={.82} stroke="rgba(0,0,0,.3)" strokeWidth={1}/>))}
                      </Pie>
                      <Tooltip content={<TT/>}/>
                      <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Revenue Waterfall — {country.split(" ")[0]}</div>
                  <Waterfall items={wfItems}/>
                  <div style={{display:"flex",gap:14,marginTop:10}}>
                    {[{c:P.gold,l:"Total"},{c:P.emerald,l:"Inflow"},{c:P.rose,l:"Outflow"}].map(d=>(
                      <div key={d.l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:2,background:d.c}}/><span style={{fontSize:10,color:P.slateD}}>{d.l}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Country Radar + Company Table */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:18}}>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">{country.split(" ")[0]} — Economic Profile Radar</div>
                  <ResponsiveContainer width="100%" height={290}>
                    <RadarChart data={[
                      {metric:"Capital",  val:Math.min(100,countryDetail.capitalGravity/300)},
                      {metric:"Revenue",  val:Math.min(100,countryDetail.revenueFlow/60)},
                      {metric:"Yield",    val:Math.min(100,countryDetail.netYield*4)},
                      {metric:"Momentum",val:Math.min(100,countryDetail.avgGrowth*3+50)},
                      {metric:"Liquidity",val:countryDetail.avgLiquidity},
                      {metric:"Efficiency",val:Math.min(100,countryDetail.efficiencyRatio*250)},
                    ]} margin={{top:10,right:30,bottom:10,left:30}}>
                      <PolarGrid stroke="rgba(255,255,255,.08)"/>
                      <PolarAngleAxis dataKey="metric" tick={{fill:P.slate,fontFamily:"Plus Jakarta Sans",fontSize:11,fontWeight:600}}/>
                      <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false}/>
                      <Radar dataKey="val" name={country} stroke={P.gold} fill={P.gold} fillOpacity={.22} strokeWidth={2.5}/>
                      <Tooltip content={<TT/>}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card" style={{padding:"22px"}}>
                  <div className="clabel">Top Entities — {country.split(" ")[0]}</div>
                  <div style={{maxHeight:270,overflowY:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead style={{position:"sticky",top:0,background:"#0d1220",zIndex:1}}>
                        <tr style={{borderBottom:`1px solid ${P.border}`}}>
                          {["Entity","Sector","Capital","Growth","Liquidity"].map(h=>(
                            <th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:9,color:P.slateD,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {countryCompanies.sort((a,b)=>b.capitalGravity-a.capitalGravity).slice(0,14).map((c,i)=>(
                          <tr key={c.id} className="trow">
                            <td style={{padding:"9px 10px",color:P.white,fontWeight:600,fontSize:12}}>{c.name}</td>
                            <td style={{padding:"9px 10px"}}><span className="badge" style={{background:SECTOR_COLORS[c.sector]+"15",color:SECTOR_COLORS[c.sector]}}>{c.sector}</span></td>
                            <td style={{padding:"9px 10px",fontFamily:"DM Mono",color:P.gold,fontSize:11}}>{c.capitalGravity.toFixed(1)}B</td>
                            <td style={{padding:"9px 10px",fontFamily:"DM Mono",color:c.growthMomentum>0?P.emerald:P.rose,fontSize:11}}>{c.growthMomentum>0?"+":""}{c.growthMomentum.toFixed(1)}%</td>
                            <td style={{padding:"9px 10px",minWidth:80}}><div className="prog"><div className="pfill" style={{width:`${c.liquidityScore}%`,background:`linear-gradient(90deg,${P.sky}66,${P.sky})`}}/></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* vs Global Benchmark */}
              <div className="card" style={{padding:"22px"}}>
                <div className="clabel">{country} vs Global Benchmark — Comparative Analysis</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart layout="vertical" margin={{left:130,right:20}} data={[
                    {metric:"Capital Gravity (T)",  country:countryDetail.capitalGravity/1000,global:totalCap/COUNTRIES.length/1000},
                    {metric:"Revenue Flow (B)",     country:countryDetail.revenueFlow,        global:totalRev/COUNTRIES.length},
                    {metric:"Valuation Index (x)",  country:countryDetail.avgValuation,       global:avgVal},
                    {metric:"Growth Momentum (%)",  country:Math.max(0,countryDetail.avgGrowth+10),global:10},
                    {metric:"Liquidity Score",      country:countryDetail.avgLiquidity,       global:filtered.reduce((a,c)=>a+c.liquidityScore,0)/(filtered.length||1)},
                  ]}>
                    <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false}/>
                    <XAxis type="number" tick={{fill:P.slateD,fontSize:10}} tickLine={false} axisLine={false}/>
                    <YAxis type="category" dataKey="metric" tick={{fill:P.slate,fontSize:10,fontFamily:"Plus Jakarta Sans",fontWeight:500}} tickLine={false} width={135}/>
                    <Tooltip content={<TT/>}/>
                    <Legend wrapperStyle={{fontFamily:"Plus Jakarta Sans",fontSize:11,color:P.slateD}}/>
                    <Bar dataKey="country" name={country}     fill={P.gold}   fillOpacity={.82} radius={[0,5,5,0]}/>
                    <Bar dataKey="global"  name="Global Avg"  fill={P.slateD} fillOpacity={.35} radius={[0,5,5,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

        </div>

        {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
        <div style={{padding:"12px 28px",borderTop:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:10,color:P.slateD,fontWeight:500,letterSpacing:".1em"}}>
            MERIDIAN ANALYTICS © 2025 — {filtered.length} entities · {COUNTRIES.length} economies · {SECTORS.length} sectors
          </span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div className="dot"/>
            <span style={{fontSize:10,color:P.slateD}}>Live feed · 2.5s refresh</span>
          </div>
        </div>
      </div>
    </>
  );
}
