var pt=Object.defineProperty;var ut=(t,e,i)=>e in t?pt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i;var Ce=(t,e,i)=>ut(t,typeof e!="symbol"?e+"":e,i);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(s){if(s.ep)return;s.ep=!0;const o=i(s);fetch(s.href,o)}})();const gt="modulepreload",ft=function(t){return"/"+t},Fe={},bt=function(e,i,a){let s=Promise.resolve();if(i&&i.length>0){let r=function(g){return Promise.all(g.map(f=>Promise.resolve(f).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};document.getElementsByTagName("link");const d=document.querySelector("meta[property=csp-nonce]"),p=(d==null?void 0:d.nonce)||(d==null?void 0:d.getAttribute("nonce"));s=r(i.map(g=>{if(g=ft(g),g in Fe)return;Fe[g]=!0;const f=g.endsWith(".css"),u=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${g}"]${u}`))return;const b=document.createElement("link");if(b.rel=f?"stylesheet":gt,f||(b.as="script"),b.crossOrigin="",b.href=g,p&&b.setAttribute("nonce",p),document.head.appendChild(b),f)return new Promise((x,_)=>{b.addEventListener("load",x),b.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${g}`)))})}))}function o(r){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=r,window.dispatchEvent(d),!d.defaultPrevented)throw r}return s.then(r=>{for(const d of r||[])d.status==="rejected"&&o(d.reason);return e().catch(o)})},vt="ApiError";class mt extends Error{constructor(i,a,s){super(i,s!=null&&s.cause?{cause:s.cause}:void 0);Ce(this,"status");Ce(this,"retriable");this.name=(s==null?void 0:s.name)??vt,this.status=a,this.retriable=(s==null?void 0:s.retriable)??!1}}const ht="2.0";let yt=1;function xt(t,e,i){return JSON.stringify({jsonrpc:ht,method:`${t}.${e}`,params:i,id:yt++})}function $t(t){const e=t;if(e.error){const{code:i,message:a,data:s}=e.error,o=i>0?i:500;throw new mt(a,o,{...s!=null&&s.name?{name:s.name}:{},...(s==null?void 0:s.retriable)===!0?{retriable:!0}:{}})}return e.result}var I={};const kt=typeof window>"u";function wt(){if(!kt||typeof globalThis>"u")return;const t=globalThis.__BLOCKS_REQUEST_COOKIES_STORE__;if(!(!t||typeof t.getStore!="function"))return t.getStore()}let ie=null,Z=null;async function St(){return ie||Z||(Z=At().catch(t=>{throw Z=null,t}),Z)}async function At(){var i;if(ie)return ie;function t(a){if(!a||typeof a!="string"||!a.trim()||a==="undefined"||a.startsWith("undefined"))return!0;if(a.startsWith("/"))return!1;try{const s=new URL(a);return s.hostname==="undefined"||s.pathname==="/undefined"||s.pathname.startsWith("/undefined/")}catch{return!0}}function e(a,s){if(!a||typeof a!="string"||t(a))throw new Error(`Blocks API URL is not configured (source: ${s}). Ensure BLOCKS_API_URL environment variable is set or config.json is deployed. Run with --conditions=cdk during CDK synthesis.`);return ie=a,a}if(typeof process<"u"&&(I!=null&&I.BLOCKS_API_URL)){const a=I.BLOCKS_API_URL;if(/\$\{Token\[/.test(a))throw new Error("Blocks API URL contains unresolved CDK tokens. This usually means a Server Component is being statically prerendered during `next build` inside `cdk deploy`.\nFix: add `export const dynamic = 'force-dynamic';` to any page that calls the Blocks API so Next.js skips prerendering it.");const s=e(a,"env BLOCKS_API_URL");return console.log("[Blocks] Using API (env BLOCKS_API_URL):",s),s}if(typeof process<"u"&&(I!=null&&I.BLOCKS_CONFIG))try{const a=JSON.parse(I.BLOCKS_CONFIG),s=e(a.apiUrl,"env BLOCKS_CONFIG");return console.log("[Blocks] Using API (env BLOCKS_CONFIG):",s),s}catch{}if(typeof process<"u"&&((i=process.versions)!=null&&i.node))try{const a=await bt(()=>import("./__vite-browser-external-BIHI7g3E.js"),[]),s=JSON.parse(a.readFileSync(".blocks-sandbox/config.json","utf-8")),o=e(s.apiUrl,"config.json file");return console.log("[Blocks] Using API (config.json file):",o),o}catch{}try{const a=await fetch("/.blocks-sandbox/config.json");if(a.ok){const s=await a.json(),o=e(s.apiUrl,"config.json fetch");return console.log("[Blocks] Using API (config.json fetch):",o),o}}catch{}throw new Error(`Blocks API URL not configured. Ensure:
1. You ran \`npm run deploy\` (deploys config.json)
2. SSR Lambda has BLOCKS_API_URL env var, OR
3. config.json exists at /.blocks-sandbox/config.json`)}const Re=[];function Xe(t){Re.push(t)}async function Ct(t){for(const e of Re)if(e.onRequest){const i=await e.onRequest(t);i&&(t=i)}return t}function _t(t){for(const e of Re)e.onResponse&&(t=e.onResponse(t));return t}function n(t,e){return new Proxy({},{get(i,a){if(typeof a!="symbol")return async(...s)=>{const o=await St();let r={apiNamespace:t,method:a,args:s,headers:{"Content-Type":"application/json"}};r=await Ct(r);const d=wt();if(d){const u="Cookie"in r.headers?"Cookie":"cookie"in r.headers?"cookie":null,b=u?r.headers[u]:void 0;if(u&&u!=="Cookie"&&delete r.headers[u],b){const x=new Set(b.split(";").filter(Boolean).map(Ae=>Ae.trim().split("=")[0])),_=d.split(";").filter(Boolean).filter(Ae=>!x.has(Ae.trim().split("=")[0])).join("; ");r.headers.Cookie=_?`${b}; ${_}`:b}else r.headers.Cookie=d}const g=await(await fetch(o,{method:"POST",headers:r.headers,credentials:"include",body:xt(r.apiNamespace,r.method,r.args)})).json(),f=$t(g);return _t(f)}}})}function zt(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/download"&&typeof e.url=="string"}function Tt(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/upload"&&typeof e.url=="string"}function Pe(t){if(zt(t)){const{url:e}=t;return{async download(){const i=await fetch(e);if(!i.ok)throw new Error(`Download failed: ${i.status}`);return i.blob()},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/download",url:e}}}}if(Tt(t)){const{url:e,contentType:i}=t;return{async upload(a){const s={};i&&(s["Content-Type"]=i);const o=await fetch(e,{method:"PUT",body:a,headers:s});if(!o.ok)throw new Error(`Upload failed: ${o.status}`)},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/upload",url:e,contentType:i}}}}if(Array.isArray(t))return t.map(Pe);if(typeof t=="object"&&t!==null){const e={};for(const[i,a]of Object.entries(t))e[i]=Pe(a);return e}return t}Xe({onResponse:Pe});const Dt=540*1e3,se=new Map;function Et(t,e){let i=se.get(t);if(i)return i;i={ws:void 0,connected:!1,subscriptions:new Map,pendingEstablished:new Map,pendingSubs:[],keepAliveTimer:null,disconnectHandlers:new Set},se.set(t,i);const a=`${t}?token=${encodeURIComponent(e)}`,s=new WebSocket(a);return i.ws=s,s.onopen=()=>{i.connected=!0;for(const o of i.pendingSubs)s.send(JSON.stringify({action:"subscribe",channel:o.channel,token:o.token}));i.pendingSubs.length=0,i.keepAliveTimer=setInterval(()=>{s.readyState===WebSocket.OPEN&&s.send(JSON.stringify({action:"ping"}))},Dt)},s.onmessage=o=>{try{const r=JSON.parse(o.data);if(r.type==="subscribe_success"&&r.channel){const d=i.pendingEstablished.get(r.channel);d&&(d.forEach(p=>p.resolve()),i.pendingEstablished.delete(r.channel))}else if(r.type==="error"&&r.channel){const d=i.pendingEstablished.get(r.channel);if(d){const p=new Error(r.message||"Subscription rejected");p.name="ConnectionFailedException",d.forEach(g=>g.reject(p)),i.pendingEstablished.delete(r.channel)}i.subscriptions.delete(r.channel)}else if(r.type==="message"&&r.channel){const d=i.subscriptions.get(r.channel);d&&d.forEach(p=>{try{p(r.data)}catch{}})}}catch{}},s.onerror=()=>{const o=new Error("WebSocket connection failed");o.name="ConnectionFailedException";for(const r of i.pendingEstablished.values())r.forEach(d=>d.reject(o));i.pendingEstablished.clear(),i.disconnectHandlers.forEach(r=>{try{r("error")}catch{}})},s.onclose=o=>{const r=new Error("WebSocket closed");r.name="ConnectionFailedException";for(const p of i.pendingEstablished.values())p.forEach(g=>g.reject(r));i.pendingEstablished.clear(),i.connected=!1,i.keepAliveTimer&&(clearInterval(i.keepAliveTimer),i.keepAliveTimer=null);const d=o.code===1001?"timeout":o.code===1006?"error":"unknown";i.disconnectHandlers.forEach(p=>{try{p(d)}catch{}}),i.disconnectHandlers.clear(),se.delete(t)},i}function Pt(t,e,i,a,s,o){var f;const r=Et(t,e);r.subscriptions.has(i)||r.subscriptions.set(i,new Set),r.subscriptions.get(i).add(s),o&&r.disconnectHandlers.add(o);let d,p;const g=new Promise((u,b)=>{d=u,p=b});return r.pendingEstablished.has(i)||r.pendingEstablished.set(i,[]),r.pendingEstablished.get(i).push({resolve:d,reject:p}),r.connected&&((f=r.ws)==null?void 0:f.readyState)===WebSocket.OPEN?r.ws.send(JSON.stringify({action:"subscribe",channel:i,token:a})):r.pendingSubs.push({channel:i,token:a}),{unsubscribe(){var b;if(o){try{o("client")}catch{}r.disconnectHandlers.delete(o)}const u=r.subscriptions.get(i);if(u&&(u.delete(s),u.size===0&&(r.subscriptions.delete(i),r.connected&&((b=r.ws)==null?void 0:b.readyState)===WebSocket.OPEN&&r.ws.send(JSON.stringify({action:"unsubscribe",channel:i})))),r.subscriptions.size===0&&r.ws){r.keepAliveTimer&&(clearInterval(r.keepAliveTimer),r.keepAliveTimer=null),r.ws.onmessage=null,r.ws.onerror=null,r.ws.onclose=null,r.ws.close(),r.connected=!1;for(const[x,_]of se)if(_===r){se.delete(x);break}}},established:g,connection:r.ws}}function It(t){return typeof t=="object"&&t!==null&&t.__blocks==="realtime/channel"&&typeof t.wsUrl=="string"&&typeof t.connectToken=="string"&&typeof t.token=="string"}function Ie(t){if(It(t)){const{channel:e,wsUrl:i,connectToken:a,token:s}=t;return{subscribe(o){const r=typeof o=="function"?o:o.onMessage,d=typeof o=="function"?void 0:o.onDisconnect;return Pt(i,a,e,s,r,d)}}}if(Array.isArray(t))return t.map(Ie);if(typeof t=="object"&&t!==null){const e={};for(const[i,a]of Object.entries(t))e[i]=Ie(a);return e}return t}Xe({onResponse:Ie});n("CONDITION_TYPES");n("DOMAIN_TYPES");n("PROVIDER_CATEGORIES");n("SUBJECT_CATALOG");n("activeInventorySchema");n("activeStudySessionSchema");const h=n("api");n("autogenerateCurriculumForSubject");n("buildBuyerMatchMessage");n("buildGroupedCatalogText");n("buildGroupedDemandBoardText");n("buildIntentClassificationPrompt");n("buildInteractiveCatalogPayload");n("buildInteractiveOtherGradesPayload");n("buildInteractiveRequestConfirmationPayload");n("buildInteractiveYearSubjectsPayload");n("buildLLMMessagePrompt");n("buildParentActivitySummary");n("buildSellerMatchMessage");n("chunkTextForVectorStore");n("cleanSubjectName");n("clearStudySession");n("curriculumLessonRecordSchema");n("demandBoardSchema");n("detectMessageLanguage");n("emitLifecycleEvent");n("ensureCurriculumSeededInDynamoDB");n("ensureUnredactedMessage");n("evaluateStudyAnswer");n("extractDemandSubject");n("extractDemandYearGroup");n("extractSchoolYear");n("extractSubject");n("fetchWhatsAppMedia");n("formatConditionBadges");n("formatDemandDisplay");n("formatPhoneNumber");n("generateLLMMessage");n("getActiveStudySession");n("getAutogenJob");n("getCurriculumFromDynamoDB");n("getHelpMessage");n("getLatestAutogenJob");n("getLearningDashboardStats");n("getOrCreateStudentProfile");n("getSandboxStatus");n("getScopedActiveInventory");n("getScopedDemandBoard");n("getSubjectDisplayName");n("getTypeSafeClient");n("getWhatsAppCredentials");n("hasExplicitSchoolYear");n("inferDomainFromConcept");n("isMatchingItem");n("isMockPhoneNumber");n("isSandboxSessionActive");n("listAutogenJobs");n("maskPromptPII");n("normalizeConceptKey");n("normalizeSubjectName");n("normalizeTextForMatching");n("parseParentMessageIntentsWithLLM");n("processWhatsAppInbound");n("resetSandboxData");n("resetStudentProfileForTesting");n("resolveMatchedContact");n("sandboxSessionSchema");n("sanitizeExtractedTitle");n("searchCurriculumS3Vectors");n("seedSandboxData");n("sendWhatsAppImageMessage");n("sendWhatsAppInteractiveMessage");n("sendWhatsAppTextMessage");n("setCustomTypeSafeClient");n("setSandboxSession");n("startStudyTrack");n("studentProfileSchema");n("studyTaskSchema");n("sweepExpiredHolds");n("triageParentRequestWithJev");n("truncateWhatsAppText");n("verifyMetaHmacSignature");n("withDurableExecution");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ae=globalThis,Ve=t=>t,ye=ae.trustedTypes,Ge=ye?ye.createPolicy("lit-html",{createHTML:t=>t}):void 0,et="$lit$",B=`lit$${Math.random().toFixed(9).slice(2)}$`,tt="?"+B,Lt=`<${tt}>`,V=document,le=()=>V.createComment(""),de=t=>t===null||typeof t!="object"&&typeof t!="function",He=Array.isArray,Mt=t=>He(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",_e=`[ 	
\f\r]`,X=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ye=/-->/g,qe=/>/g,j=RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ke=/'/g,Je=/"/g,it=/^(?:script|style|textarea|title)$/i,Bt=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),l=Bt(1),ce=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),Qe=new WeakMap,F=V.createTreeWalker(V,129);function st(t,e){if(!He(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ge!==void 0?Ge.createHTML(e):e}const Rt=(t,e)=>{const i=t.length-1,a=[];let s,o=e===2?"<svg>":e===3?"<math>":"",r=X;for(let d=0;d<i;d++){const p=t[d];let g,f,u=-1,b=0;for(;b<p.length&&(r.lastIndex=b,f=r.exec(p),f!==null);)b=r.lastIndex,r===X?f[1]==="!--"?r=Ye:f[1]!==void 0?r=qe:f[2]!==void 0?(it.test(f[2])&&(s=RegExp("</"+f[2],"g")),r=j):f[3]!==void 0&&(r=j):r===j?f[0]===">"?(r=s??X,u=-1):f[1]===void 0?u=-2:(u=r.lastIndex-f[2].length,g=f[1],r=f[3]===void 0?j:f[3]==='"'?Je:Ke):r===Je||r===Ke?r=j:r===Ye||r===qe?r=X:(r=j,s=void 0);const x=r===j&&t[d+1].startsWith("/>")?" ":"";o+=r===X?p+Lt:u>=0?(a.push(g),p.slice(0,u)+et+p.slice(u)+B+x):p+B+(u===-2?d:x)}return[st(t,o+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),a]};class pe{constructor({strings:e,_$litType$:i},a){let s;this.parts=[];let o=0,r=0;const d=e.length-1,p=this.parts,[g,f]=Rt(e,i);if(this.el=pe.createElement(g,a),F.currentNode=this.el.content,i===2||i===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(s=F.nextNode())!==null&&p.length<d;){if(s.nodeType===1){if(s.hasAttributes())for(const u of s.getAttributeNames())if(u.endsWith(et)){const b=f[r++],x=s.getAttribute(u).split(B),_=/([.?@])?(.*)/.exec(b);p.push({type:1,index:o,name:_[2],strings:x,ctor:_[1]==="."?Nt:_[1]==="?"?jt:_[1]==="@"?Ot:we}),s.removeAttribute(u)}else u.startsWith(B)&&(p.push({type:6,index:o}),s.removeAttribute(u));if(it.test(s.tagName)){const u=s.textContent.split(B),b=u.length-1;if(b>0){s.textContent=ye?ye.emptyScript:"";for(let x=0;x<b;x++)s.append(u[x],le()),F.nextNode(),p.push({type:2,index:++o});s.append(u[b],le())}}}else if(s.nodeType===8)if(s.data===tt)p.push({type:2,index:o});else{let u=-1;for(;(u=s.data.indexOf(B,u+1))!==-1;)p.push({type:7,index:o}),u+=B.length-1}o++}}static createElement(e,i){const a=V.createElement("template");return a.innerHTML=e,a}}function J(t,e,i=t,a){var r,d;if(e===ce)return e;let s=a!==void 0?(r=i._$Co)==null?void 0:r[a]:i._$Cl;const o=de(e)?void 0:e._$litDirective$;return(s==null?void 0:s.constructor)!==o&&((d=s==null?void 0:s._$AO)==null||d.call(s,!1),o===void 0?s=void 0:(s=new o(t),s._$AT(t,i,a)),a!==void 0?(i._$Co??(i._$Co=[]))[a]=s:i._$Cl=s),s!==void 0&&(e=J(t,s._$AS(t,e.values),s,a)),e}class Ht{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:i},parts:a}=this._$AD,s=((e==null?void 0:e.creationScope)??V).importNode(i,!0);F.currentNode=s;let o=F.nextNode(),r=0,d=0,p=a[0];for(;p!==void 0;){if(r===p.index){let g;p.type===2?g=new be(o,o.nextSibling,this,e):p.type===1?g=new p.ctor(o,p.name,p.strings,this,e):p.type===6&&(g=new Wt(o,this,e)),this._$AV.push(g),p=a[++d]}r!==(p==null?void 0:p.index)&&(o=F.nextNode(),r++)}return F.currentNode=V,s}p(e){let i=0;for(const a of this._$AV)a!==void 0&&(a.strings!==void 0?(a._$AI(e,a,i),i+=a.strings.length-2):a._$AI(e[i])),i++}}class be{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,i,a,s){this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=a,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=J(this,e,i),de(e)?e===y||e==null||e===""?(this._$AH!==y&&this._$AR(),this._$AH=y):e!==this._$AH&&e!==ce&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Mt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==y&&de(this._$AH)?this._$AA.nextSibling.data=e:this.T(V.createTextNode(e)),this._$AH=e}$(e){var o;const{values:i,_$litType$:a}=e,s=typeof a=="number"?this._$AC(e):(a.el===void 0&&(a.el=pe.createElement(st(a.h,a.h[0]),this.options)),a);if(((o=this._$AH)==null?void 0:o._$AD)===s)this._$AH.p(i);else{const r=new Ht(s,this),d=r.u(this.options);r.p(i),this.T(d),this._$AH=r}}_$AC(e){let i=Qe.get(e.strings);return i===void 0&&Qe.set(e.strings,i=new pe(e)),i}k(e){He(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let a,s=0;for(const o of e)s===i.length?i.push(a=new be(this.O(le()),this.O(le()),this,this.options)):a=i[s],a._$AI(o),s++;s<i.length&&(this._$AR(a&&a._$AB.nextSibling,s),i.length=s)}_$AR(e=this._$AA.nextSibling,i){var a;for((a=this._$AP)==null?void 0:a.call(this,!1,!0,i);e!==this._$AB;){const s=Ve(e).nextSibling;Ve(e).remove(),e=s}}setConnected(e){var i;this._$AM===void 0&&(this._$Cv=e,(i=this._$AP)==null||i.call(this,e))}}class we{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,a,s,o){this.type=1,this._$AH=y,this._$AN=void 0,this.element=e,this.name=i,this._$AM=s,this.options=o,a.length>2||a[0]!==""||a[1]!==""?(this._$AH=Array(a.length-1).fill(new String),this.strings=a):this._$AH=y}_$AI(e,i=this,a,s){const o=this.strings;let r=!1;if(o===void 0)e=J(this,e,i,0),r=!de(e)||e!==this._$AH&&e!==ce,r&&(this._$AH=e);else{const d=e;let p,g;for(e=o[0],p=0;p<o.length-1;p++)g=J(this,d[a+p],i,p),g===ce&&(g=this._$AH[p]),r||(r=!de(g)||g!==this._$AH[p]),g===y?e=y:e!==y&&(e+=(g??"")+o[p+1]),this._$AH[p]=g}r&&!s&&this.j(e)}j(e){e===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Nt extends we{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===y?void 0:e}}class jt extends we{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==y)}}class Ot extends we{constructor(e,i,a,s,o){super(e,i,a,s,o),this.type=5}_$AI(e,i=this){if((e=J(this,e,i,0)??y)===ce)return;const a=this._$AH,s=e===y&&a!==y||e.capture!==a.capture||e.once!==a.once||e.passive!==a.passive,o=e!==y&&(a===y||s);s&&this.element.removeEventListener(this.name,this,a),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var i;typeof this._$AH=="function"?this._$AH.call(((i=this.options)==null?void 0:i.host)??this.element,e):this._$AH.handleEvent(e)}}class Wt{constructor(e,i,a){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=a}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const ze=ae.litHtmlPolyfillSupport;ze==null||ze(pe,be),(ae.litHtmlVersions??(ae.litHtmlVersions=[])).push("3.3.3");const Ut=(t,e,i)=>{const a=e;let s=a._$litPart$;return s===void 0&&(a._$litPart$=s=new be(e.insertBefore(le(),null),null,void 0,{})),s._$AI(t),s},Ft=document.getElementById("app");let m="available",L="all",$=[],k=[],xe=[],Vt=null,W=null,at=null,Ne="+15550009988",S="math_shapes",w=null,A=null,P=!1,Gt=[],$e="",he=[],ke=!1;async function je(){try{at=await h.getLearningDashboardStats(),c()}catch(t){console.warn("Failed to load learning stats:",t)}}async function Yt(){try{Gt=await h.getCurriculumFromDynamoDB()||[],c()}catch(t){console.warn("Failed to load dynamo curriculum:",t)}}async function Ze(){if($e.trim()){ke=!0,c();try{he=await h.searchCurriculumS3Vectors($e)||[]}catch(t){console.error("Vector search error:",t)}finally{ke=!1,c()}}}async function M(){P=!0,A=null,c();try{w=await h.startStudySession(Ne,S,"en")}catch(t){console.error("Failed to start sim session:",t)}finally{P=!1,c()}}async function ve(t){P=!0,c();try{const e=await h.submitStudyAnswer(Ne,t,"en");A=e,e.isCorrect&&je()}catch(e){console.error("Failed to submit sim choice:",e)}finally{P=!1,c()}}async function qt(){var t;A=null,P=!0,c();try{const e=await h.processWhatsAppWebhook({from_phone:Ne,interactive:{id:"learn_next",title:"Next Task 🚀"}}),i=((t=e==null?void 0:e.result)==null?void 0:t.replyMessage)||"";w={text:i,imageUrl:i.includes("biscuit")||i.includes("snack")?"https://d3cdc2mtpqk5ut.cloudfront.net/lessons/biscuit_circle.jpg":i.includes("notebook")||i.includes("Rectangles")?"https://d3cdc2mtpqk5ut.cloudfront.net/lessons/notebook_rectangle.jpg":void 0}}catch(e){console.error("handleSimNext error:",e),M()}finally{P=!1,c()}}let re=!1,Y="";async function O(t="all"){re=!0,Y=`⚡ Autogenerating questions & visual diagrams for ${t}...`,c();try{const e=await h.autogenerateCurriculum(t,!1);Y=`✅ Created ${e.lessonsGenerated} lessons, ${e.tasksGenerated} questions, and ${e.imagesGenerated} diagrams!`,await je()}catch(e){Y=`❌ Autogen failed: ${e.message}`}finally{re=!1,c(),setTimeout(()=>{Y="",c()},8e3)}}let ue=!1,oe="",Te=null,N="",T="all",R="all",Q="all",G="all",z="all",U="holds",E="all",ge="",fe="",ne=!0,q=!1,D=null,Le=!1,te=!1,ee="",me="",De="Mathematics",Ee="+15550199002";function v(t){oe=t,Te&&clearTimeout(Te),Te=setTimeout(()=>{oe="",c()},1e4)}function Oe(t){if(!t)return"Unknown date";const e=Date.now(),i=Math.floor((e-t)/1e3);if(i<60)return"Just now";const a=Math.floor(i/60);if(a<60)return`${a}m ago`;const s=Math.floor(a/60);if(s<24)return`${s}h ago`;const o=Math.floor(s/24);return o===1?"Yesterday":o<30?`${o}d ago`:new Date(t).toLocaleDateString()}function H(t){return t?new Date(t).toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function Se(t){switch(t){case"Mathematics":return"badge-math";case"Science":return"badge-science";case"Languages":return"badge-languages";case"Humanities":return"badge-humanities";case"Arts":return"badge-arts";default:return"badge-active"}}function rt(t){switch(t){case"PrimarySchool":return"badge-primary";case"MiddleSchool":return"badge-middle";case"HighSchool":return"badge-high";case"UniversityPrep":return"badge-uniprep";default:return"badge-active"}}function Kt(t){switch(t){case"PrimarySchool":return"Primary (Years 1-6)";case"MiddleSchool":return"Middle School (Years 7-9)";case"HighSchool":return"High School (Years 10-13)";case"UniversityPrep":return"Uni Prep";default:return t||"General"}}function ot(t){switch(t){case"New":return l`
        <span
          class="badge"
          style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);"
        >
          Verified New
        </span>
      `;case"LikeNew":return l`
        <span
          class="badge"
          style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.35);"
        >
          Like New
        </span>
      `;case"Good":return l`
        <span
          class="badge"
          style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);"
        >
          Good Condition
        </span>
      `;case"Acceptable":return l`
        <span
          class="badge"
          style="background:rgba(156,163,175,0.15);color:#d1d5db;border:1px solid rgba(156,163,175,0.35);"
        >
          Acceptable
        </span>
      `;default:return l`<span class="badge badge-active">${t||"Good"}</span>`}}function nt(t){if(!t)return!0;const e=Date.now();if(E==="today"){const i=new Date;return i.setHours(0,0,0,0),t>=i.getTime()}if(E==="7days"){const i=e-6048e5;return t>=i}if(E==="30days"){const i=e-2592e6;return t>=i}if(E==="custom"){let i=!0;if(ge){const a=new Date(ge).setHours(0,0,0,0);t<a&&(i=!1)}if(fe){const a=new Date(fe).setHours(23,59,59,999);t>a&&(i=!1)}return i}return!0}function Jt(t){return t.filter(e=>{if(N.trim()){const i=N.toLowerCase().trim();if(!(e.title&&e.title.toLowerCase().includes(i)||e.concept&&e.concept.toLowerCase().includes(i)||e.description&&e.description.toLowerCase().includes(i)||e.domain&&e.domain.toLowerCase().includes(i)||e.providerCategory&&e.providerCategory.toLowerCase().includes(i)))return!1}return!(T!=="all"&&e.domain!==T||R!=="all"&&e.providerCategory!==R||Q!=="all"&&e.conditionType!==Q||G!=="all"&&e.sellerPhone!==G||z!=="all"&&e.status!==z||!nt(e.createdAt))}).sort((e,i)=>{const a=e.createdAt||0,s=i.createdAt||0;return ne?s-a:a-s})}function Me(t,e){return t.filter(i=>{if(i.status!==e)return!1;if(N.trim()){const a=N.toLowerCase().trim();if(!(i.requestedQuery&&i.requestedQuery.toLowerCase().includes(a)||i.concept&&i.concept.toLowerCase().includes(a)||i.domain&&i.domain.toLowerCase().includes(a)||i.handoverCode&&i.handoverCode.toLowerCase().includes(a)))return!1}return!(T!=="all"&&i.domain!==T||!nt(i.createdAt))}).sort((i,a)=>{const s=i.matchedAt||i.createdAt||0,o=a.matchedAt||a.createdAt||0;return ne?o-s:s-o})}function Qt(){let t=0;return N.trim()&&t++,T!=="all"&&t++,R!=="all"&&t++,Q!=="all"&&t++,G!=="all"&&t++,z!=="all"&&t++,E!=="all"&&t++,t}function lt(){N="",T="all",R="all",Q="all",G="all",z="all",E="all",ge="",fe="",c()}async function C(){ue=!0,c();try{try{await h.releaseExpiredHolds()}catch{}const[t,e,i,a,s]=await Promise.all([h.listInventory(),h.listDemands(),h.getLifecycleEvents(),h.getSecurityObservabilityStatus(),h.getSupplyGaps()]);$=t||[],k=e||[],xe=i||[],Vt=a||null,W=s||null}catch(t){console.error("Failed to load dashboard data:",t),v(`❌ Failed to load data: ${t.message}`)}finally{ue=!1,c()}}async function Zt(t){Le=!0,q=!0,D=null,c();try{D=await h.getSellerStorefront(t)}catch(e){v(`❌ Failed to load seller storefront: ${e.message}`),q=!1}finally{Le=!1,c()}}async function Xt(){try{const t=await h.verifyWebhook("subscribe","my_verify_token_123",`challenge_${Date.now()}`);t.status===200?v(`✅ Handshake Verified! Echoed challenge: "${t.challenge}"`):v(`❌ Verification failed: ${t.error}`)}catch(t){v(`❌ Error verifying webhook: ${t.message}`)}C()}async function K(t,e="+15550199001"){var i,a,s,o;v(`🚀 Processing simulated WhatsApp message: "${t}"...`),c();try{const r={media_id:`media_${Date.now()}`,from_phone:e,message_text:t},d=await h.handleWebhook(r);((i=d.result)==null?void 0:i.status)==="matched"?(v(`🎉 Match Connected! Matched wishlist ID: ${d.result.matchedDemandId}`),m="matches"):((a=d.result)==null?void 0:a.status)==="needs_year_clarification"?v("ℹ️ Clarification Prompt Triggered: Bot asked parent for school year/grade!"):((s=d.result)==null?void 0:s.status)==="greeting"?v("👋 Greeting Handled: Welcome & Guide sent."):(v(`📦 Book Listed into Inventory! Item ID: ${((o=d.result)==null?void 0:o.itemId)||"saved"}`),m="available")}catch(r){v(`❌ Webhook simulation error: ${r.message}`)}C()}async function Be(t,e,i="Mathematics",a="+15550199002"){v(`⏳ Registering demand for "${e}" (${t})...`),c();try{const s=await h.createDemand(a,e,t,i);v(`✨ Wishlist demand registered: "${s.requestedQuery}"!`),te=!1,m="pendings"}catch(s){v(`❌ Error adding demand: ${s.message}`)}C()}async function dt(t){try{await h.deleteDemand(t),v("🗑️ Removed demand entry."),k=k.filter(e=>e.demandId!==t),c()}catch(e){v(`❌ Error removing demand: ${e.message}`)}}async function ei(t){try{await h.deleteInventory(t),v("🗑️ Removed inventory item."),$=$.filter(e=>e.itemId!==t),c()}catch(e){v(`❌ Error removing inventory: ${e.message}`)}}async function ct(){v("🔒 Validating HMAC-SHA256 Payload Signature..."),c();try{const t="secret_key_whatsapp_demo_1234",e=JSON.stringify({test:"hmac-verification",timestamp:Date.now()}),i=new TextEncoder,a=await crypto.subtle.importKey("raw",i.encode(t),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),s=await crypto.subtle.sign("HMAC",a,i.encode(e)),o=Array.from(new Uint8Array(s)).map(d=>d.toString(16).padStart(2,"0")).join("");(await h.validateSignature(e,`sha256=${o}`,t)).valid?v("🛡️ HMAC Verification SUCCESS: Timing-safe cryptographic signature verified."):v("❌ HMAC Verification Failed!")}catch(t){v(`❌ HMAC test error: ${t.message}`)}C()}function ti(){const t=k.filter(o=>o.status==="pending").length,e=k.filter(o=>o.status==="matched").length,i=k.filter(o=>o.status==="fulfilled").length||$.filter(o=>o.status==="sold").length,a=$.filter(o=>o.status==="active").length,s=xe.length;return l`
    <div class="stats-row">
      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${()=>{m="available",z="active",c()}}
      >
        <div class="stat-icon" style="background:rgba(59,130,246,0.15);color:#60a5fa;">📚</div>
        <div class="stat-info">
          <div class="stat-value">${a}</div>
          <div class="stat-label">Available Books</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${()=>{m="pendings",c()}}
      >
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24;">⏳</div>
        <div class="stat-info">
          <div class="stat-value">${t}</div>
          <div class="stat-label">Pending Demands</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${()=>{m="matches",U="holds",c()}}
      >
        <div class="stat-icon" style="background:rgba(99,102,241,0.15);color:#818cf8;">🤝</div>
        <div class="stat-info">
          <div class="stat-value">${e}</div>
          <div class="stat-label">48H Active Holds</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${()=>{m="matches",U="completed",c()}}
      >
        <div class="stat-icon" style="background:rgba(16,185,129,0.15);color:#34d399;">🎓</div>
        <div class="stat-info">
          <div class="stat-value">${i}</div>
          <div class="stat-label">Sold & Completed</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${()=>{m="observability",c()}}
      >
        <div class="stat-icon" style="background:rgba(139,92,246,0.15);color:#a78bfa;">📊</div>
        <div class="stat-info">
          <div class="stat-value">${s}</div>
          <div class="stat-label">Live Events</div>
        </div>
      </div>
    </div>
  `}function ii(){const t=k.filter(s=>s.status==="pending").length,e=k.filter(s=>s.status==="matched").length,i=k.filter(s=>s.status==="fulfilled").length||$.filter(s=>s.status==="sold").length,a=$.filter(s=>s.status==="active").length;return l`
    <div class="tabs-nav">
      <button
        class="tab-btn ${m==="available"?"active":""}"
        @click=${()=>{m="available",c()}}
      >
        <span>📚 Available Books</span>
        <span class="tab-count">${a}</span>
      </button>

      <button
        class="tab-btn ${m==="pendings"?"active":""}"
        @click=${()=>{m="pendings",c()}}
      >
        <span>⏳ Pending Demands</span>
        <span class="tab-count">${t}</span>
      </button>

      <button
        class="tab-btn ${m==="matches"?"active":""}"
        @click=${()=>{m="matches",c()}}
      >
        <span>🤝 Matches & Sales</span>
        <span class="tab-count">${e+i}</span>
      </button>

      <button
        class="tab-btn ${m==="webhook"?"active":""}"
        @click=${()=>{m="webhook",c()}}
      >
        <span>⚡ Webhook & Simulations</span>
      </button>

      <button
        class="tab-btn ${m==="observability"?"active":""}"
        @click=${()=>{m="observability",c()}}
      >
        <span>📊 Observability & Stream</span>
      </button>

      <button
        class="tab-btn ${m==="learn"?"active":""}"
        style="${m==="learn"?"border-color: #6366f1; background: rgba(99, 102, 241, 0.2); box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);":"border-color: rgba(99, 102, 241, 0.4);"}"
        @click=${()=>{m="learn",je(),Yt(),w||M(),c()}}
      >
        <span>🧠 Relay Learn (AI Tutor)</span>
        <span
          style="background: #6366f1; color: white; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 800; margin-left: 6px; letter-spacing: 0.05em;"
          >NEW</span
        >
      </button>
    </div>
  `}function si(){return W?l`
    <div
      class="card"
      style="background:linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%);border:1px solid rgba(236,72,153,0.3);margin-bottom:20px;"
    >
      <div
        style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;"
      >
        <div style="max-width:700px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:1.1rem;">📢</span>
            <h4 style="font-size:1.1rem;color:#f472b6;">
              Community Supply Deficit Alert (Feature 3B)
            </h4>
          </div>
          <p style="margin:0;font-size:0.88rem;color:var(--text-muted);line-height:1.4;">
            High demand / low stock in:
            <strong
              >${W.deficitSubjects.map(t=>`${t.domain} (${t.count})`).join(", ")}</strong
            >
            and grades <strong>${W.deficitGrades.map(t=>t.grade).join(", ")}</strong>.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            class="sm"
            style="background:linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);"
            title="Preview and simulate WhatsApp Broadcast to parent group"
            @click=${()=>{v(`📢 Broadcast Dispatched to WhatsApp Group: "${W==null?void 0:W.broadcastMessageEn}"`)}}
          >
            🚀 Broadcast Supply Call
          </button>
        </div>
      </div>
    </div>
  `:""}function We(t=!0){const e=Qt(),i=Array.from(new Set($.map(a=>a.sellerPhone).filter(Boolean)));return l`
    <div class="filter-toolbar">
      <div class="toolbar-main">
        <!-- Search Input -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search titles, concepts, subjects, or grades..."
            .value=${N}
            @input=${a=>{N=a.target.value,c()}}
          />
        </div>

        <!-- Subject / Domain Selector -->
        <select
          class="filter-select"
          .value=${T}
          @change=${a=>{T=a.target.value,c()}}
        >
          <option value="all">🌐 All Subjects</option>
          <option value="Mathematics">📐 Mathematics</option>
          <option value="Science">🔬 Science</option>
          <option value="Languages">🗣️ Languages</option>
          <option value="Humanities">🌍 Humanities</option>
          <option value="Arts">🎨 Arts</option>
        </select>

        <!-- Class / Level Selector -->
        ${t?l`
                <select
                  class="filter-select"
                  .value=${R}
                  @change=${a=>{R=a.target.value,c()}}
                >
                  <option value="all">🏫 All Classes / Levels</option>
                  <option value="PrimarySchool">🎒 Primary School (Y1-Y6)</option>
                  <option value="MiddleSchool">📘 Middle School (Y7-Y9)</option>
                  <option value="HighSchool">🎓 High School (Y10-Y13)</option>
                  <option value="UniversityPrep">🏛️ University Prep</option>
                </select>
              `:""}

        <!-- Condition Selector (Feature 3D) -->
        ${t?l`
                <select
                  class="filter-select"
                  .value=${Q}
                  @change=${a=>{Q=a.target.value,c()}}
                >
                  <option value="all">All Conditions</option>
                  <option value="New">New</option>
                  <option value="LikeNew">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Acceptable">Acceptable</option>
                </select>

                <!-- Status Selector (Active / Reserved / Sold) -->
                <select
                  class="filter-select"
                  .value=${z}
                  @change=${a=>{z=a.target.value,c()}}
                >
                  <option value="all">📦 All Statuses (${$.length})</option>
                  <option value="active">
                    🟢 Available (${$.filter(a=>a.status==="active").length})
                  </option>
                  <option value="reserved">
                    ⏳ On Hold (${$.filter(a=>a.status==="reserved").length})
                  </option>
                  <option value="sold">
                    🎓 Sold & Completed (${$.filter(a=>a.status==="sold").length})
                  </option>
                </select>
              `:""}

        <!-- Seller Filter (Feature 3A) -->
        ${i.length>1?l`
                <select
                  class="filter-select"
                  .value=${G}
                  @change=${a=>{G=a.target.value,c()}}
                >
                  <option value="all">👨‍👩‍👧 All Parent Sellers</option>
                  ${i.map((a,s)=>l`<option value="${a}">Family Collection #${s+1}</option>`)}
                </select>
              `:""}

        <!-- Date Range Presets -->
        <select
          class="filter-select"
          .value=${E}
          @change=${a=>{E=a.target.value,c()}}
        >
          <option value="all">📅 All Dates</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="custom">Custom Date Range...</option>
        </select>

        <!-- Sort Order Indicator (Descending by default) -->
        <button
          class="secondary sm"
          title="Click to toggle sorting order"
          @click=${()=>{ne=!ne,c()}}
        >
          ${ne?"⬇️ Newest First":"⬆️ Oldest First"}
        </button>

        <!-- Reset Button -->
        ${e>0?l`
                <button class="danger sm" @click=${lt}>
                  ✕ Reset (${e})
                </button>
              `:""}
      </div>

      <!-- Custom Date Inputs (if selected) -->
      ${E==="custom"?l`
              <div
                style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:10px;"
              >
                <span style="font-size:0.82rem;color:var(--text-muted);font-weight:600;"
                  >Custom Created Date:</span
                >
                <div class="date-filter-group">
                  <label style="font-size:0.78rem;color:var(--text-dim);">From:</label>
                  <input
                    type="date"
                    class="date-input"
                    .value=${ge}
                    @change=${a=>{ge=a.target.value,c()}}
                  />
                </div>
                <div class="date-filter-group">
                  <label style="font-size:0.78rem;color:var(--text-dim);">To:</label>
                  <input
                    type="date"
                    class="date-input"
                    .value=${fe}
                    @change=${a=>{fe=a.target.value,c()}}
                  />
                </div>
              </div>
            `:""}

      <!-- Interactive Subject & Class Pills -->
      <div class="toolbar-secondary">
        <div class="pill-group">
          <span class="pill-label">Subjects:</span>
          ${["all","Mathematics","Science","Languages","Humanities","Arts"].map(a=>l`
              <button
                class="pill ${T===a?"active":""}"
                @click=${()=>{T=a,c()}}
              >
                ${a==="all"?"All Subjects":a}
              </button>
            `)}
        </div>

        ${t?l`
                <div class="pill-group">
                  <span class="pill-label">Classes:</span>
                  ${[{id:"all",label:"All Levels"},{id:"PrimarySchool",label:"Primary"},{id:"MiddleSchool",label:"Middle"},{id:"HighSchool",label:"High"},{id:"UniversityPrep",label:"Uni Prep"}].map(a=>l`
                      <button
                        class="pill ${R===a.id?"active":""}"
                        @click=${()=>{R=a.id,c()}}
                      >
                        ${a.label}
                      </button>
                    `)}
                </div>
              `:""}
      </div>
    </div>
  `}function ai(){const t=Jt($);return l`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>
            📚
            ${z==="sold"?"Sold & Completed Books Archive":z==="reserved"?"On-Hold Inventory":"Available Books Catalog"}
          </h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            ${z==="sold"?"Archived record of sold books, verified handovers, and buyer details.":z==="reserved"?"Books currently on 48-hour hold awaiting physical exchange.":"Active inventory extracted from WhatsApp parent messages, categorized by class and subject (Sorted newest first)."}
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <!-- View Grouping Selector -->
          <div
            style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;"
          >
            <button
              class="sm ${L==="all"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{L="all",c()}}
            >
              Grid
            </button>
            <button
              class="sm ${L==="by-subject"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{L="by-subject",c()}}
            >
              By Subject
            </button>
            <button
              class="sm ${L==="by-class"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{L="by-class",c()}}
            >
              By Class
            </button>
          </div>
          <button class="secondary sm" @click=${C}>
            ${ue?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      <!-- Feature 3B: Supply Gaps Alert -->
      ${si()} ${We(!0)}
      ${t.length===0?l`
              <div class="empty-state">
                <div class="empty-state-icon">📖</div>
                <div class="empty-state-title">No books match your current filters</div>
                <div class="empty-state-text">
                  Try clearing your search keyword, selecting "All Subjects" / "All Dates", or
                  simulate a book upload in the Webhook tab.
                </div>
                <button class="secondary sm" style="margin-top:10px;" @click=${lt}>
                  Clear All Filters
                </button>
              </div>
            `:L==="all"?l` <div class="items-grid">${t.map(e=>Ue(e))}</div> `:L==="by-subject"?ri(t):oi(t)}
    </div>

    <!-- Feature 3A: Seller Storefront Modal -->
    ${ni()}
  `}function Ue(t){const e=t.status==="sold",i=t.status==="reserved";return l`
    <div
      class="item-card"
      style="${e?"border-left: 3px solid var(--success);":i?"border-left: 3px solid #6366f1;":""}"
    >
      <div class="item-card-header">
        <div class="item-title-wrap">
          <div class="book-title">${t.title}</div>
          <div class="book-concept">${t.concept}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${e?l`<span
                  class="badge"
                  style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);"
                  >SOLD 🎓</span
                >`:i?l`<span
                    class="badge"
                    style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.35);"
                    >HOLD ⏳</span
                  >`:""}
          <span class="badge ${Se(t.domain)}"> ${t.domain} </span>
        </div>
      </div>

      <div class="tags-row">
        <span class="badge ${rt(t.providerCategory)}">
          ${Kt(t.providerCategory)}
        </span>
        <!-- Feature 3D: Verified Condition Badge -->
        ${ot(t.conditionType)}
        ${t.handoverCode?l`<span class="badge" style="background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.25);">Code: #${t.handoverCode}</span>`:""}
      </div>

      ${t.description?l`<div style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">
              ${t.description}
            </div>`:""}
      ${e?l`
              <div
                style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);padding:8px 10px;border-radius:8px;font-size:0.8rem;color:#6ee7b7;display:flex;flex-direction:column;gap:3px;"
              >
                <div>
                  🎓
                  <strong>Handover Completed</strong>
                  to <strong style="color:var(--text);">Community Parent</strong>
                </div>
                ${t.soldAt?l`<div style="font-size:0.75rem;color:var(--text-dim);">Sold on ${H(t.soldAt)}</div>`:""}
              </div>
            `:i?l`
                <div
                  style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);padding:8px 10px;border-radius:8px;font-size:0.8rem;color:#a5b4fc;"
                >
                  ⏳
                  <strong>Reserved on 48h Hold</strong>
                  for <strong style="color:var(--text);">Community Parent</strong>
                </div>
              `:""}

      <div class="card-footer">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <!-- Feature 3A: Clickable Seller Storefront Link -->
          <div style="font-size:0.75rem;color:var(--text-dim);">
            Seller:
            <button
              class="secondary sm"
              style="padding:2px 6px;font-size:0.72rem;margin-left:4px;display:inline-flex;"
              title="Click to view full family collection & grade bundles"
              @click=${()=>Zt(t.sellerPhone)}
            >
              👨‍👩‍👧 Family Storefront
            </button>
          </div>
          <div class="date-badge" title="${H(t.createdAt)}">
            📅 ${Oe(t.createdAt)} (${H(t.createdAt)})
          </div>
        </div>
        <button
          class="danger sm"
          style="padding:4px 8px;font-size:0.72rem;"
          title="Remove from active inventory"
          @click=${()=>ei(t.itemId)}
        >
          🗑️
        </button>
      </div>
    </div>
  `}function ri(t){return l`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${["Mathematics","Science","Languages","Humanities","Arts"].map(i=>{const a=t.filter(s=>s.domain===i);return a.length===0?"":l`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${i}</h4>
              <span class="badge ${Se(i)}">${a.length} Available</span>
            </div>
            <div class="items-grid">${a.map(s=>Ue(s))}</div>
          </div>
        `})}
    </div>
  `}function oi(t){return l`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${[{key:"PrimarySchool",label:"Primary School (Years 1 - 6)"},{key:"MiddleSchool",label:"Middle School (Years 7 - 9)"},{key:"HighSchool",label:"High School (Years 10 - 13)"},{key:"UniversityPrep",label:"University Prep"}].map(i=>{const a=t.filter(s=>s.providerCategory===i.key);return a.length===0?"":l`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${i.label}</h4>
              <span class="badge ${rt(i.key)}"
                >${a.length} Available</span
              >
            </div>
            <div class="items-grid">${a.map(s=>Ue(s))}</div>
          </div>
        `})}
    </div>
  `}function ni(){return q?l`
    <div
      style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);"
      @click=${t=>{t.target===t.currentTarget&&(q=!1,c())}}
    >
      <div
        class="card"
        style="width:100%;max-width:680px;max-height:85vh;overflow-y:auto;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);display:flex;flex-direction:column;gap:18px;"
      >
        ${Le?l`<div style="text-align:center;padding:40px 0;color:var(--text-muted);">
                Loading Family Storefront...
              </div>`:D?l`
                  <div
                    style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;"
                  >
                    <div>
                      <div
                        style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:rgba(59,130,246,0.15);color:#60a5fa;font-size:0.75rem;font-weight:600;margin-bottom:6px;"
                      >
                        👨‍👩‍👧 FAMILY COLLECTION (FEATURE 3A)
                      </div>
                      <h3 style="font-size:1.4rem;">
                        Community Family Storefront
                      </h3>
                      <p style="margin:4px 0 0 0;font-size:0.85rem;color:var(--text-muted);">
                        Total <strong>${D.totalBooks} textbooks</strong> available
                        across multiple grades.
                      </p>
                    </div>
                    <button
                      class="secondary sm"
                      @click=${()=>{q=!1,c()}}
                    >
                      ✕ Close
                    </button>
                  </div>

                  <!-- Grade Bundles Section -->
                  <div>
                    <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">
                      📦 Available Grade Bundles
                    </h4>
                    <div
                      style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;"
                    >
                      ${D.bundles.map(t=>l`
                          <div
                            style="background:rgba(255,255,255,0.04);border:1px solid var(--surface-border);border-radius:10px;padding:12px;"
                          >
                            <div style="font-weight:700;font-size:0.95rem;color:#fff;">
                              ${t.grade} Bundle
                            </div>
                            <div style="font-size:0.8rem;color:#60a5fa;margin-top:2px;">
                              ${t.count} Books Available
                            </div>
                            <button
                              class="secondary sm"
                              style="margin-top:8px;width:100%;font-size:0.72rem;"
                              @click=${()=>{v(`💬 WhatsApp Bundle Request sent to family for all ${t.count} books in ${t.grade}!`)}}
                            >
                              Request Entire Bundle
                            </button>
                          </div>
                        `)}
                    </div>
                  </div>

                  <!-- Individual Books List -->
                  <div>
                    <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">
                      📖 All Books from this Parent
                    </h4>
                    <div
                      style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;"
                    >
                      ${D.items.map(t=>l`
                          <div
                            style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--surface-border);border-radius:8px;"
                          >
                            <div>
                              <div style="font-weight:600;font-size:0.88rem;color:#fff;">
                                ${t.title}
                              </div>
                              <div style="font-size:0.75rem;color:var(--text-dim);">
                                ${t.domain} &bull; ${t.concept}
                              </div>
                            </div>
                            <div>${ot(t.conditionType)}</div>
                          </div>
                        `)}
                    </div>
                  </div>

                  <div
                    style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;"
                  >
                    <button
                      class="secondary"
                      @click=${()=>{G=(D==null?void 0:D.sellerPhone)||"all",q=!1,c()}}
                    >
                      Filter Main Catalog by this Seller
                    </button>
                  </div>
                `:""}
      </div>
    </div>
  `:""}function li(){const t=Me(k,"pending");return l`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>⏳ Pending Wishlists & Demands</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Parents actively seeking books. When an inbound offer matches, Relay automatically pairs
            them (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;">
          <button
            class="sm"
            @click=${()=>{te=!0,c()}}
          >
            + Create Demand
          </button>
          <button class="secondary sm" @click=${C}>
            ${ue?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${We(!1)}
      ${t.length===0?l`
              <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <div class="empty-state-title">No pending wishlists found</div>
                <div class="empty-state-text">
                  All requests have either been matched or no parents are waiting for books right
                  now.
                </div>
                <button
                  class="sm"
                  style="margin-top:10px;"
                  @click=${()=>Be("Year5Chemistry","Year 5 Chemistry","Science")}
                >
                  + Add Demo "Year 5 Chemistry" Demand
                </button>
              </div>
            `:l`
              <div class="items-grid">
                ${t.map(e=>l`
                    <div class="item-card" style="border-left: 3px solid var(--warning);">
                      <div class="item-card-header">
                        <div class="item-title-wrap">
                          <div class="book-title">${e.requestedQuery}</div>
                          <div class="book-concept">Concept: ${e.concept}</div>
                        </div>
                        <span class="badge badge-pending">PENDING</span>
                      </div>

                      <div class="tags-row">
                        <span class="badge ${Se(e.domain)}">
                          ${e.domain||"Marketplace"}
                        </span>
                      </div>

                      <div class="card-footer">
                        <div style="display:flex;flex-direction:column;gap:2px;">
                          <div style="font-size:0.75rem;color:var(--text-dim);">
                            Waiting Parent:
                            <strong style="color:var(--text);">Community Parent</strong>
                          </div>
                          <div class="date-badge" title="${H(e.createdAt)}">
                            📅 ${Oe(e.createdAt)} (${H(e.createdAt)})
                          </div>
                        </div>
                        <div style="display:flex;gap:6px;">
                          <button
                            class="secondary sm"
                            style="font-size:0.72rem;padding:4px 8px;"
                            title="Simulate seller offering this book to trigger automatic match"
                            @click=${()=>K(`I have ${e.requestedQuery} available for Year parent`,"+15559998888")}
                          >
                            ⚡ Match
                          </button>
                          <button
                            class="danger sm"
                            style="font-size:0.72rem;padding:4px 8px;"
                            title="Delete demand"
                            @click=${()=>dt(e.demandId)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  `)}
              </div>
            `}
    </div>

    <!-- Quick Add Demand Modal -->
    ${te?l`
            <div
              style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);"
              @click=${e=>{e.target===e.currentTarget&&(te=!1,c())}}
            >
              <div
                class="card"
                style="width:100%;max-width:480px;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);"
              >
                <h3>Create Parent Wishlist Request</h3>
                <p style="margin:4px 0 18px 0;font-size:0.85rem;color:var(--text-muted);">
                  Add a demand for a textbook that isn't currently in stock.
                </p>

                <div style="display:flex;flex-direction:column;gap:14px;">
                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Book Title / Request Query</label
                    >
                    <input
                      type="text"
                      class="search-input"
                      placeholder="e.g. Year 10 Physics Textbook"
                      style="padding-left:14px;"
                      .value=${ee}
                      @input=${e=>{ee=e.target.value,me=e.target.value.replace(/[^a-zA-Z0-9]/g,"")}}
                    />
                  </div>

                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Normalized Concept Key</label
                    >
                    <input
                      type="text"
                      class="search-input"
                      placeholder="e.g. Year10Physics"
                      style="padding-left:14px;"
                      .value=${me}
                      @input=${e=>{me=e.target.value}}
                    />
                  </div>

                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Subject Domain</label
                    >
                    <select
                      class="filter-select"
                      style="width:100%;"
                      .value=${De}
                      @change=${e=>{De=e.target.value}}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="Languages">Languages</option>
                      <option value="Humanities">Humanities</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Parent WhatsApp Phone Number</label
                    >
                    <input
                      type="text"
                      class="search-input"
                      placeholder="+15550199002"
                      style="padding-left:14px;"
                      .value=${Ee}
                      @input=${e=>{Ee=e.target.value}}
                    />
                  </div>

                  <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                    <button
                      class="secondary"
                      @click=${()=>{te=!1,c()}}
                    >
                      Cancel
                    </button>
                    <button
                      @click=${()=>{ee.trim()&&Be(me||ee.replace(/[^a-zA-Z0-9]/g,""),ee,De,Ee)}}
                    >
                      Save Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `:""}
  `}function di(){const t=Me(k,"matched"),e=Me(k,"fulfilled"),i=U==="completed",a=i?e:t;return l`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>
            ${i?"🎓 Completed Book Exchanges & Sold Archive":"🤝 Matched Pairs & 48-Hour Reservations"}
          </h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            ${i?"Verified physical handovers. Each record preserves the buyer, seller, handover verification code, and completion date.":"Demands matched with available books. Holds automatically release after 48 hours if handover is not confirmed."}
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <!-- View Toggle: Active Holds vs Completed / Sold -->
          <div
            style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;"
          >
            <button
              class="sm ${U==="holds"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{U="holds",c()}}
            >
              ⏳ Active Holds (${k.filter(s=>s.status==="matched").length})
            </button>
            <button
              class="sm ${U==="completed"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{U="completed",c()}}
            >
              🎓 Completed & Sold (${k.filter(s=>s.status==="fulfilled").length})
            </button>
          </div>

          ${i?"":l`
                  <button
                    class="secondary sm"
                    title="Proactively sweep and release all expired 48H holds"
                    @click=${async()=>{const s=await h.releaseExpiredHolds();v(`🧹 Swept holds: ${s.releasedCount} expired hold(s) released back to active inventory.`),await C()}}
                  >
                    🧹 Sweep Holds
                  </button>
                `}
          <button class="secondary sm" @click=${C}>
            ${ue?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${We(!1)}
      ${a.length===0?l`
              <div class="empty-state">
                <div class="empty-state-icon">${i?"🎓":"🤝"}</div>
                <div class="empty-state-title">
                  ${i?"No completed book exchanges found":"No active matched pairs found"}
                </div>
                <div class="empty-state-text">
                  ${i?"When parents complete a physical book exchange and confirm via WhatsApp or the Mark Sold action, it will appear here.":"When a seller lists a book that matches a waiting parent's wishlist, it will be placed on a 48-hour hold and displayed here."}
                </div>
                ${i?"":l`
                        <div style="margin-top:12px;display:flex;gap:10px;">
                          <button
                            class="secondary sm"
                            @click=${async()=>{await Be("Year8Science","Year 8 Science","Science","+15559990001"),await K("I have Year 8 Science textbook in great shape","+15559990002")}}
                          >
                            ⚡ Run Auto-Match Simulation
                          </button>
                        </div>
                      `}
              </div>
            `:l`
              <div class="items-grid">
                ${a.map(s=>{const o=s.matchedAt||s.createdAt||Date.now(),r=2880*60*1e3,d=o+r-Date.now(),p=s.status!=="fulfilled"&&d<=0,g=Math.max(1,Math.ceil(d/(1e3*60*60))),f=$.find(u=>u.itemId===s.matchedItemId);return l`
                    <div
                      class="item-card"
                      style="border-left: 3px solid ${s.status==="fulfilled"?"var(--success)":p?"#ef4444":"#6366f1"};"
                    >
                      <div class="item-card-header">
                        <div class="item-title-wrap">
                          <div class="book-title">${s.requestedQuery}</div>
                          <div class="book-concept">Concept: ${s.concept}</div>
                        </div>
                        ${s.status==="fulfilled"?l`<span
                                class="badge"
                                style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);"
                                >COMPLETED / SOLD 🎓</span
                              >`:p?l`<span
                                  class="badge"
                                  style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);"
                                  >HOLD EXPIRED</span
                                >`:l`<span class="badge badge-matched"
                                  >48H HOLD (${g}h left)</span
                                >`}
                      </div>

                      <div class="tags-row">
                        <span class="badge ${Se(s.domain)}">
                          ${s.domain||"Marketplace"}
                        </span>
                        ${s.handoverCode?l`<span
                                class="badge"
                                style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);"
                                >Code: #${s.handoverCode}</span
                              >`:""}
                      </div>

                      <div
                        style="background:${s.status==="fulfilled"?"rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#6ee7b7;":p?"rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#fca5a5;":"rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;"};padding:10px 12px;border-radius:8px;font-size:0.83rem;"
                      >
                        ${s.status==="fulfilled"?l`
                                <div>
                                  ✅ <strong>Handover verified & completed!</strong> Book marked as
                                  sold and removed from active catalog.
                                </div>
                                <div
                                  style="margin-top:6px;display:flex;flex-direction:column;gap:3px;font-size:0.8rem;color:var(--text-muted);"
                                >
                                  ${f!=null&&f.title?l`<div>Book: <strong style="color:var(--text);">${f.title}</strong></div>`:""}
                                  <div>
                                    Exchange:
                                    <strong style="color:var(--text);">Verified Community Parents</strong>
                                  </div>
                                  ${f!=null&&f.soldAt||s.matchedAt?l`<div>Completed: <strong>${H((f==null?void 0:f.soldAt)||s.matchedAt)}</strong></div>`:""}
                                </div>
                              `:p?"⚠️ 48-Hour hold has elapsed without physical exchange. Book can be returned to community circulation.":`⏳ 48-Hour Reservation Active (${g}h remaining). Matched parents introduced via WhatsApp.`}
                      </div>

                      <div class="card-footer">
                        <div style="display:flex;flex-direction:column;gap:2px;">
                          <div style="font-size:0.75rem;color:var(--text-dim);">
                            ${s.status==="fulfilled"?"Status:":"Hold Recipient:"}
                            <strong style="color:var(--text);">${s.status==="fulfilled"?"Handover Verified":"Community Parent"}</strong>
                          </div>
                          <div class="date-badge" title="${H(s.createdAt)}">
                            ${Oe(s.createdAt)} (${H(s.createdAt)})
                          </div>
                        </div>
                        <div style="display:flex;gap:6px;">
                          ${s.status!=="fulfilled"?l`
                                  <button
                                    class="sm"
                                    style="font-size:0.72rem;padding:4px 8px;background:#059669;"
                                    title="Confirm physical handover and mark book sold"
                                    @click=${async()=>{await h.confirmHandover({itemId:s.matchedItemId||"",demandId:s.demandId}),v("Handover confirmed! Book marked as sold."),await C()}}
                                  >
                                    Mark Sold
                                  </button>
                                `:""}
                          ${p?l`
                                  <button
                                    class="secondary sm"
                                    style="font-size:0.72rem;padding:4px 8px;"
                                    title="Release expired hold back to active community inventory"
                                    @click=${async()=>{await h.releaseHold({itemId:s.matchedItemId,demandId:s.demandId}),v("Hold released! Book returned to active catalog."),await C()}}
                                  >
                                    🔄 Release Hold
                                  </button>
                                `:""}
                          <button
                            class="danger sm"
                            style="font-size:0.72rem;padding:4px 8px;"
                            title="Delete demand"
                            @click=${()=>dt(s.demandId)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  `})}
              </div>
            `}
    </div>
  `}function ci(){return l`
    <div style="display:flex;flex-direction:column;gap:24px;">
      <div class="card">
        <h3>⚡ WhatsApp Webhook Controls & Live Simulator</h3>
        <p style="margin:4px 0 20px 0;font-size:0.92rem;color:var(--text-muted);">
          Simulate inbound parent WhatsApp group messages, media uploads, and test API Gateway
          webhook verification handshakes.
        </p>

        <div
          style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;"
        >
          <!-- Simulation 1: Inbound Book Offer -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                📦 Inbound Book Listing (Offer)
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate parent sending "Year 5 Chemistry Textbook" with photo cover.
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>K("Year 5 Chemistry Textbook - Pristine Condition")}
            >
              Simulate "Year 5 Chemistry"
            </button>
          </div>

          <!-- Simulation 2: Inbound High School CS -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                💻 Computer Science Book
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate parent offering "Year 12 Computer Science" textbook.
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>K("I have Year 12 Computer Science Book")}
            >
              Simulate "Year 12 CS"
            </button>
          </div>

          <!-- Simulation 3: Bilingual French Message -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                🇫🇷 French Message (Collège)
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate French parent offering "Manuel de Physique 3ème".
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>K("J'ai un livre de physique pour la classe de 3ème")}
            >
              Simulate "Physique 3ème"
            </button>
          </div>

          <!-- Simulation 4: Clarification Flow -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                ❓ Year Clarification Prompt
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate offer with missing school year (triggers conversational clarification).
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>K("I have Chemistry books available for anyone who wants them")}
            >
              Simulate Missing Year
            </button>
          </div>
        </div>

        <div
          style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:12px;flex-wrap:wrap;"
        >
          <button @click=${Xt}>
            🔗 Test GET Webhook Handshake (hub.challenge)
          </button>
          <button class="secondary" @click=${ct}>
            🔐 Test HMAC-SHA256 Payload Signature
          </button>
        </div>
      </div>
    </div>
  `}function pi(){return l`
    <div style="display:flex;flex-direction:column;gap:24px;">
      <!-- Enterprise Security & Governance Overview -->
      <div class="card" style="border-left: 4px solid var(--accent, #6366f1)">
        <div
          style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;"
        >
          <div>
            <h3 style="margin:0 0 4px 0;">Enterprise Security, Governance & Observability</h3>
            <p style="margin:0;font-size:0.9rem;color:var(--text-muted);">
              Real-time telemetry, perimeter defense, encryption at rest, and Bedrock Guardrails.
            </p>
          </div>
          <button class="secondary sm" @click=${ct}>🔐 Validate HMAC</button>
        </div>

        <div
          style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;margin-top:18px;"
        >
          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Perimeter Defense
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#10b981;">
              🛡️ AWS WAF & Rate Limit
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              2,000 req/5min per IP
            </div>
          </div>

          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Data Governance
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#3b82f6;">
              🔒 Bedrock Guardrails
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              PII Redaction (Phone, Address)
            </div>
          </div>

          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Encryption & Storage
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#a855f7;">
              🔑 AWS KMS CMK
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              30-Day S3 Image Expiration
            </div>
          </div>

          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Telemetry & Observability
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#f59e0b;">
              📊 X-Ray Tracing + EMF
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              Zero-latency CloudWatch EMF
            </div>
          </div>
        </div>
      </div>

      <!-- EventBridge Lifecycle Stream -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3>EventBridge Lifecycle Stream</h3>
            <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
              Real-time events: ProcessingStarted, ExtractionComplete, MatchFound, S3VectorIngested.
            </p>
          </div>
          <button class="secondary sm" @click=${C}>🔄 Refresh Stream</button>
        </div>

        <div class="terminal-log">
          ${xe.length===0?l`<div style="color:var(--text-muted);padding:12px 0;">
                  Waiting for lifecycle events...
                </div>`:xe.slice().reverse().map(t=>l`
                      <div class="log-entry">
                        <span class="log-time"
                          >[${new Date(t.timestamp).toLocaleTimeString([],{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}]</span
                        >
                        <span class="log-type">${t.eventType}</span>
                        <span class="log-details">${JSON.stringify(t.details)}</span>
                      </div>
                    `)}
        </div>
      </div>
    </div>
  `}function ui(){var e,i,a,s,o;const t=at||{totalStudents:0,totalQuestions:0,totalCorrect:0,totalPoints:0,accuracyRate:0};return l`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Hero Banner -->
      <div class="card" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color: white; border: 1px solid rgba(99, 102, 241, 0.4); padding: 28px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(99, 102, 241, 0.3); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
              <span>🏆 AWS "Zero to Shipped" Hackathon Entry</span>
            </div>
            <h2 style="font-size: 28px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff;">
              Relay Learn: Socratic AI WhatsApp Tutor
            </h2>
            <p style="font-size: 15px; color: #c7d2fe; max-width: 680px; margin: 0; line-height: 1.6;">
              Self-paced micro-learning via WhatsApp. Powered exclusively by verified open-source educational repositories ingested into <strong>Amazon Bedrock S3 Vectors</strong> & <strong>DynamoDB</strong> with zero synthetic/mocked statistics.
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a
              href="https://wa.me/1251548201371379?text=learn"
              target="_blank"
              rel="noopener noreferrer"
              class="btn"
              style="background: #22c55e; color: white; font-weight: 700; padding: 12px 20px; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);"
            >
              <span>💬 Test Live on WhatsApp</span>
              <span>📱</span>
            </a>
            <span style="font-size: 12px; color: #a5b4fc; text-align: center;">Send "learn" or "#learn"</span>
          </div>
        </div>
      </div>

      <!-- Real-Time Database Metrics Overview (100% Real DynamoDB Data) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Active Students</div>
            <span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">DYNAMODB</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #38bdf8; margin-top: 6px;">${t.totalStudents}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Verified registered profiles</div>
        </div>
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Questions Answered</div>
            <span style="font-size: 10px; color: #a855f7; background: rgba(168, 85, 247, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">INBOUND</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #a855f7; margin-top: 6px;">${t.totalQuestions}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Real student interactions</div>
        </div>
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Mastery Accuracy</div>
            <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">VERIFIED</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #22c55e; margin-top: 6px;">${t.accuracyRate}%</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${t.totalCorrect} correct answers</div>
        </div>
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Total XP Earned</div>
            <span style="font-size: 10px; color: #eab308; background: rgba(234, 179, 8, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">POINTS</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #eab308; margin-top: 6px;">${t.totalPoints.toLocaleString()} pts</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Earned across active sessions</div>
        </div>
      </div>

      <!-- S3 Vector Semantic Search & Knowledge Base Query -->
      <div class="card" style="padding: 24px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 17px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
            <span>🔍 Bedrock S3 Vector Knowledge Base Explorer</span>
          </div>
          <span style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 600;">
            Source: ./knowledge (*.md) via Titan Text Embeddings
          </span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.5;">
          Query the raw Markdown educational repositories ingested directly into Amazon S3 vector storage:
        </p>
        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <input
            type="text"
            placeholder="e.g. binary dot cards, barter trade and double coincidence, fractions of a set, velocity rate of change..."
            style="flex: 1; padding: 10px 14px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #ffffff; font-size: 13px;"
            .value=${$e}
            @input=${r=>{$e=r.target.value}}
            @keydown=${r=>{r.key==="Enter"&&Ze()}}
          />
          <button
            class="btn"
            style="background: #6366f1; color: white; font-weight: 700; padding: 10px 18px; border-radius: 8px; white-space: nowrap;"
            ?disabled=${ke}
            @click=${()=>Ze()}
          >
            ${ke?"Searching...":"Search Vectors 🔍"}
          </button>
        </div>

        ${he.length>0?l`
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">
                  Retrieved S3 Vector Chunks (${he.length} Results):
                </div>
                ${he.map(r=>l`
                    <div style="background: #0f172a; border-radius: 8px; padding: 14px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-family: monospace; color: #38bdf8; font-size: 11px;">${r.location||"S3 Vector Chunk"}</span>
                        ${r.score!==void 0?l`<span style="color: #22c55e; font-size: 11px; font-weight: 700;">Score: ${(r.score*100).toFixed(1)}%</span>`:""}
                      </div>
                      <div style="color: #cbd5e1; line-height: 1.5; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${r.content}</div>
                    </div>
                  `)}
              </div>
            `:""}
      </div>

      <!-- Interactive Web Simulator & Live Curriculum Columns -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        <!-- Left: Interactive WhatsApp Tutor Simulator -->
        <div class="card" style="padding: 24px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-size: 18px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
              <span>📱 In-Browser WhatsApp Simulator</span>
            </div>
            <span style="font-size: 12px; color: #22c55e; background: rgba(34, 197, 94, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 600;">LIVE API</span>
          </div>

          <!-- Track Selector -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${S==="math_shapes"?"background: #6366f1; color: white;":"background: #1e293b; color: #94a3b8;"}"
              @click=${()=>{S="math_shapes",M()}}
            >
              📐 2-D Shapes (Visual)
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${S==="cs_unplugged"?"background: #6366f1; color: white;":"background: #1e293b; color: #94a3b8;"}"
              @click=${()=>{S="cs_unplugged",M()}}
            >
              💻 CS Unplugged
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${S==="math_foundations"?"background: #6366f1; color: white;":"background: #1e293b; color: #94a3b8;"}"
              @click=${()=>{S="math_foundations",M()}}
            >
              🔢 Math Mastery
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${S==="digital_literacy"?"background: #6366f1; color: white;":"background: #1e293b; color: #94a3b8;"}"
              @click=${()=>{S="digital_literacy",M()}}
            >
              💡 Digital Safety
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${S==="stem_openstax"?"background: #6366f1; color: white;":"background: #1e293b; color: #94a3b8;"}"
              @click=${()=>{S="stem_openstax",M()}}
            >
              📈 STEM OpenStax
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px;"
              ?disabled=${re}
              @click=${()=>O(S)}
            >
              <span>${re?"⏳":"⚡"}</span>
              <span>${re?"Generating...":"Autogen This Subject"}</span>
            </button>
          </div>

          <!-- Autogen Live Progress Banner -->
          ${Y?l`
                <div style="padding: 8px 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 12px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <span>⚙️</span>
                  <span>${Y}</span>
                </div>
              `:""}

          <!-- WhatsApp Chat Bubble Window -->
          <div style="background: #0b141a; border-radius: 12px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.08); min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              ${P?l`<div style="color: #94a3b8; font-style: italic; text-align: center; padding: 40px 0;">🤖 Relay Tutor is retrieving curriculum from DynamoDB...</div>`:w?l`
                      ${w.imageUrl?l`
                            <div style="margin-bottom: 12px; text-align: center; background: #000; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15);">
                              <img
                                src="${w.imageUrl}"
                                alt="Visual Task Diagram"
                                style="max-height: 240px; width: 100%; object-fit: contain; display: block;"
                              />
                            </div>
                          `:""}

                      <div style="background: #202c33; color: #e9edef; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin-bottom: 12px; border-left: 4px solid #6366f1;">
${w.text}
                      </div>

                      <!-- Warmup Step Button -->
                      ${((o=(s=(a=(i=(e=w.interactive)==null?void 0:e.action)==null?void 0:i.buttons)==null?void 0:a[0])==null?void 0:s.reply)==null?void 0:o.id)==="learn_warmup_start"||w.text&&w.text.includes("warm up")?l`
                            <button
                              class="btn"
                              style="width: 100%; background: #22c55e; color: white; font-weight: 700; padding: 12px; border-radius: 8px; margin-top: 8px; font-size: 14px;"
                              @click=${async()=>{P=!0,c();try{w={imageUrl:"https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg",text:`━━━━━━━━━━━━━━━━━━━━━━
📐 *Everyday Shapes • 2-D Shapes in Everyday Life*
[ 🟩 ⬜ ⬜ ] 33% • Streak: 🔥 1 day
━━━━━━━━━━━━━━━━━━━━━━

2-D shapes are flat shapes that have only length and width. Look at the labeled shapes diagram! 📐

❓ *Task:*
Look at the diagram. Which shape has exactly 3 straight sides?

A) Triangle
B) Circle
C) Square
D) Rectangle

👇 _Reply A, B, C, or D (or tap a button below)_
_Tip: Type "hint" if you are stuck!_`}}finally{P=!1,c()}}}
                            >
                              🚀 Start lesson!
                            </button>
                          `:""}

                      <!-- Interactive Quick-Reply Feedback -->
                      ${A?l`
                            <div style="background: ${A.isCorrect?"rgba(34, 197, 94, 0.2)":"rgba(239, 68, 68, 0.2)"}; border: 1px solid ${A.isCorrect?"#22c55e":"#ef4444"}; color: #e9edef; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; white-space: pre-wrap;">
${A.text}
                            </div>
                            ${A.interactiveButton?l`
                                  <button
                                    class="btn"
                                    style="width: 100%; background: #6366f1; color: white; font-weight: 700; padding: 10px; border-radius: 8px; margin-top: 8px;"
                                    @click=${()=>qt()}
                                  >
                                    ${A.interactiveButton.title}
                                  </button>
                                `:""}
                          `:""}

                      ${!(A!=null&&A.isCorrect)&&!(w.text&&w.text.includes("warm up"))?l`
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${()=>ve(0)}
                              >
                                🔘 Choice A
                              </button>
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${()=>ve(1)}
                              >
                                🔘 Choice B
                              </button>
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${()=>ve(2)}
                              >
                                🔘 Choice C
                              </button>
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${()=>ve(3)}
                              >
                                🔘 Choice D
                              </button>
                            </div>
                          `:""}
                    `:l`
                      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                        <p style="font-size: 14px; margin-bottom: 16px;">Test the Socratic learning experience directly inside this browser window:</p>
                        <button
                          class="btn"
                          style="background: #6366f1; color: white; font-weight: 700; padding: 10px 20px; border-radius: 8px;"
                          @click=${()=>M()}
                        >
                          Start Interactive Lesson 🚀
                        </button>
                      </div>
                    `}
            </div>
          </div>

          <!-- Quick WhatsApp Autogen Commands Palette -->
          <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">⚡ Background Commands:</span>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${()=>O("shapes")}
            >
              📐 #generate shapes
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${()=>O("math")}
            >
              🔢 #generate math
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${()=>O("cs")}
            >
              💻 #generate cs
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${()=>O("digital")}
            >
              💡 #generate digital
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${()=>O("stem")}
            >
              📈 #generate stem
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3)); color: #e2e8f0; border: 1px solid rgba(168,85,247,0.4); cursor: pointer; font-weight: 700;"
              @click=${()=>O("all")}
            >
              🌟 #generate all
            </button>
          </div>
        </div>

        <!-- Right: Accredited Open-Source Repositories (Grounding Sources) -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Open Source Curriculum Box -->
          <div class="card" style="padding: 24px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
            <div style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>📚 Open-Source Curricula Sources (Vector DB)</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.5;">
              Grounding LLM reasoning in verified K–12 open-source Markdown repositories to guarantee pedagogical rigor without hallucination:
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #38bdf8;">CS Unplugged (CC BY-SA 4.0)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/uccser/cs-unplugged • Binary, searching, error detection</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #a855f7;">OSSU Pre-College Math (MIT)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/ossu/precollege-math • Arithmetic, fractions, pre-algebra</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #eab308;">Literacy for Kids (CC BY-NC-SA 4.0)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/literacy-for-kids • Computer & financial barter literacy</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #ec4899;">OpenStax STEM Calculus (CC BY 4.0)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/philschatz/calculus-book • Rates of change & velocity</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
            </div>
          </div>

          <!-- Hackathon Zero to Shipped Architecture Card -->
          <div class="card" style="padding: 24px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
            <div style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>⚙️ AWS Zero to Shipped Architecture</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Vector Retrieval</div>
                <div style="color: #ffffff; font-weight: 700;">S3 Vectors + Bedrock KB</div>
              </div>
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Database Layer</div>
                <div style="color: #ffffff; font-weight: 700;">DynamoDB (3 Tables)</div>
              </div>
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Pedagogy Engine</div>
                <div style="color: #ffffff; font-weight: 700;">Socratic & TaRL Method</div>
              </div>
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Agent Toolkit</div>
                <div style="color: #ffffff; font-weight: 700;">AWS IAM Caller Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function c(){Ut(l`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Status Notification Banner -->
        ${oe?l`
                <div class="status-banner">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;">🔔</span>
                    <span>${oe}</span>
                  </div>
                  <button
                    class="secondary sm"
                    style="padding:2px 8px;font-size:0.75rem;"
                    @click=${()=>{oe="",c()}}
                  >
                    ✕
                  </button>
                </div>
              `:""}

        <!-- Top Level Stats Summary -->
        ${ti()}

        <!-- Tab Bar Navigation -->
        ${ii()}

        <!-- Active Tab Content -->
        ${m==="available"?ai():m==="pendings"?li():m==="matches"?di():m==="webhook"?ci():m==="learn"?ui():pi()}
      </div>
    `,Ft)}C();
