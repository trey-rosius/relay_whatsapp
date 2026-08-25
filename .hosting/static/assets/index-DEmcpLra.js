var qe=Object.defineProperty;var Ke=(t,e,i)=>e in t?qe(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i;var pe=(t,e,i)=>Ke(t,typeof e!="symbol"?e+"":e,i);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function i(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(n){if(n.ep)return;n.ep=!0;const r=i(n);fetch(n.href,r)}})();const Ve="modulepreload",Je=function(t){return"/"+t},_e={},Qe=function(e,i,s){let n=Promise.resolve();if(i&&i.length>0){let a=function(p){return Promise.all(p.map(v=>Promise.resolve(v).then(c=>({status:"fulfilled",value:c}),c=>({status:"rejected",reason:c}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));n=a(i.map(p=>{if(p=Je(p),p in _e)return;_e[p]=!0;const v=p.endsWith(".css"),c=v?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${c}`))return;const g=document.createElement("link");if(g.rel=v?"stylesheet":Ve,v||(g.as="script"),g.crossOrigin="",g.href=p,l&&g.setAttribute("nonce",l),document.head.appendChild(g),v)return new Promise((y,A)=>{g.addEventListener("load",y),g.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${p}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return n.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return e().catch(r)})},Ze="ApiError";class Xe extends Error{constructor(i,s,n){super(i,n!=null&&n.cause?{cause:n.cause}:void 0);pe(this,"status");pe(this,"retriable");this.name=(n==null?void 0:n.name)??Ze,this.status=s,this.retriable=(n==null?void 0:n.retriable)??!1}}const et="2.0";let tt=1;function it(t,e,i){return JSON.stringify({jsonrpc:et,method:`${t}.${e}`,params:i,id:tt++})}function st(t){const e=t;if(e.error){const{code:i,message:s,data:n}=e.error,r=i>0?i:500;throw new Xe(s,r,{...n!=null&&n.name?{name:n.name}:{},...(n==null?void 0:n.retriable)===!0?{retriable:!0}:{}})}return e.result}var _={};const nt=typeof window>"u";function at(){if(!nt||typeof globalThis>"u")return;const t=globalThis.__BLOCKS_REQUEST_COOKIES_STORE__;if(!(!t||typeof t.getStore!="function"))return t.getStore()}let q=null,W=null;async function rt(){return q||W||(W=ot().catch(t=>{throw W=null,t}),W)}async function ot(){var i;if(q)return q;function t(s){if(!s||typeof s!="string"||!s.trim()||s==="undefined"||s.startsWith("undefined"))return!0;if(s.startsWith("/"))return!1;try{const n=new URL(s);return n.hostname==="undefined"||n.pathname==="/undefined"||n.pathname.startsWith("/undefined/")}catch{return!0}}function e(s,n){if(!s||typeof s!="string"||t(s))throw new Error(`Blocks API URL is not configured (source: ${n}). Ensure BLOCKS_API_URL environment variable is set or config.json is deployed. Run with --conditions=cdk during CDK synthesis.`);return q=s,s}if(typeof process<"u"&&(_!=null&&_.BLOCKS_API_URL)){const s=_.BLOCKS_API_URL;if(/\$\{Token\[/.test(s))throw new Error("Blocks API URL contains unresolved CDK tokens. This usually means a Server Component is being statically prerendered during `next build` inside `cdk deploy`.\nFix: add `export const dynamic = 'force-dynamic';` to any page that calls the Blocks API so Next.js skips prerendering it.");const n=e(s,"env BLOCKS_API_URL");return console.log("[Blocks] Using API (env BLOCKS_API_URL):",n),n}if(typeof process<"u"&&(_!=null&&_.BLOCKS_CONFIG))try{const s=JSON.parse(_.BLOCKS_CONFIG),n=e(s.apiUrl,"env BLOCKS_CONFIG");return console.log("[Blocks] Using API (env BLOCKS_CONFIG):",n),n}catch{}if(typeof process<"u"&&((i=process.versions)!=null&&i.node))try{const s=await Qe(()=>import("./__vite-browser-external-BIHI7g3E.js"),[]),n=JSON.parse(s.readFileSync(".blocks-sandbox/config.json","utf-8")),r=e(n.apiUrl,"config.json file");return console.log("[Blocks] Using API (config.json file):",r),r}catch{}try{const s=await fetch("/.blocks-sandbox/config.json");if(s.ok){const n=await s.json(),r=e(n.apiUrl,"config.json fetch");return console.log("[Blocks] Using API (config.json fetch):",r),r}}catch{}throw new Error(`Blocks API URL not configured. Ensure:
1. You ran \`npm run deploy\` (deploys config.json)
2. SSR Lambda has BLOCKS_API_URL env var, OR
3. config.json exists at /.blocks-sandbox/config.json`)}const Ae=[];function He(t){Ae.push(t)}async function lt(t){for(const e of Ae)if(e.onRequest){const i=await e.onRequest(t);i&&(t=i)}return t}function dt(t){for(const e of Ae)e.onResponse&&(t=e.onResponse(t));return t}function f(t,e){return new Proxy({},{get(i,s){if(typeof s!="symbol")return async(...n)=>{const r=await rt();let a={apiNamespace:t,method:s,args:n,headers:{"Content-Type":"application/json"}};a=await lt(a);const o=at();if(o){const c="Cookie"in a.headers?"Cookie":"cookie"in a.headers?"cookie":null,g=c?a.headers[c]:void 0;if(c&&c!=="Cookie"&&delete a.headers[c],g){const y=new Set(g.split(";").filter(Boolean).map(ue=>ue.trim().split("=")[0])),A=o.split(";").filter(Boolean).filter(ue=>!y.has(ue.trim().split("=")[0])).join("; ");a.headers.Cookie=A?`${g}; ${A}`:g}else a.headers.Cookie=o}const p=await(await fetch(r,{method:"POST",headers:a.headers,credentials:"include",body:it(a.apiNamespace,a.method,a.args)})).json(),v=st(p);return dt(v)}}})}function ct(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/download"&&typeof e.url=="string"}function ut(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/upload"&&typeof e.url=="string"}function be(t){if(ct(t)){const{url:e}=t;return{async download(){const i=await fetch(e);if(!i.ok)throw new Error(`Download failed: ${i.status}`);return i.blob()},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/download",url:e}}}}if(ut(t)){const{url:e,contentType:i}=t;return{async upload(s){const n={};i&&(n["Content-Type"]=i);const r=await fetch(e,{method:"PUT",body:s,headers:n});if(!r.ok)throw new Error(`Upload failed: ${r.status}`)},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/upload",url:e,contentType:i}}}}if(Array.isArray(t))return t.map(be);if(typeof t=="object"&&t!==null){const e={};for(const[i,s]of Object.entries(t))e[i]=be(s);return e}return t}He({onResponse:be});const pt=540*1e3,K=new Map;function ft(t,e){let i=K.get(t);if(i)return i;i={ws:void 0,connected:!1,subscriptions:new Map,pendingEstablished:new Map,pendingSubs:[],keepAliveTimer:null,disconnectHandlers:new Set},K.set(t,i);const s=`${t}?token=${encodeURIComponent(e)}`,n=new WebSocket(s);return i.ws=n,n.onopen=()=>{i.connected=!0;for(const r of i.pendingSubs)n.send(JSON.stringify({action:"subscribe",channel:r.channel,token:r.token}));i.pendingSubs.length=0,i.keepAliveTimer=setInterval(()=>{n.readyState===WebSocket.OPEN&&n.send(JSON.stringify({action:"ping"}))},pt)},n.onmessage=r=>{try{const a=JSON.parse(r.data);if(a.type==="subscribe_success"&&a.channel){const o=i.pendingEstablished.get(a.channel);o&&(o.forEach(l=>l.resolve()),i.pendingEstablished.delete(a.channel))}else if(a.type==="error"&&a.channel){const o=i.pendingEstablished.get(a.channel);if(o){const l=new Error(a.message||"Subscription rejected");l.name="ConnectionFailedException",o.forEach(p=>p.reject(l)),i.pendingEstablished.delete(a.channel)}i.subscriptions.delete(a.channel)}else if(a.type==="message"&&a.channel){const o=i.subscriptions.get(a.channel);o&&o.forEach(l=>{try{l(a.data)}catch{}})}}catch{}},n.onerror=()=>{const r=new Error("WebSocket connection failed");r.name="ConnectionFailedException";for(const a of i.pendingEstablished.values())a.forEach(o=>o.reject(r));i.pendingEstablished.clear(),i.disconnectHandlers.forEach(a=>{try{a("error")}catch{}})},n.onclose=r=>{const a=new Error("WebSocket closed");a.name="ConnectionFailedException";for(const l of i.pendingEstablished.values())l.forEach(p=>p.reject(a));i.pendingEstablished.clear(),i.connected=!1,i.keepAliveTimer&&(clearInterval(i.keepAliveTimer),i.keepAliveTimer=null);const o=r.code===1001?"timeout":r.code===1006?"error":"unknown";i.disconnectHandlers.forEach(l=>{try{l(o)}catch{}}),i.disconnectHandlers.clear(),K.delete(t)},i}function vt(t,e,i,s,n,r){var v;const a=ft(t,e);a.subscriptions.has(i)||a.subscriptions.set(i,new Set),a.subscriptions.get(i).add(n),r&&a.disconnectHandlers.add(r);let o,l;const p=new Promise((c,g)=>{o=c,l=g});return a.pendingEstablished.has(i)||a.pendingEstablished.set(i,[]),a.pendingEstablished.get(i).push({resolve:o,reject:l}),a.connected&&((v=a.ws)==null?void 0:v.readyState)===WebSocket.OPEN?a.ws.send(JSON.stringify({action:"subscribe",channel:i,token:s})):a.pendingSubs.push({channel:i,token:s}),{unsubscribe(){var g;if(r){try{r("client")}catch{}a.disconnectHandlers.delete(r)}const c=a.subscriptions.get(i);if(c&&(c.delete(n),c.size===0&&(a.subscriptions.delete(i),a.connected&&((g=a.ws)==null?void 0:g.readyState)===WebSocket.OPEN&&a.ws.send(JSON.stringify({action:"unsubscribe",channel:i})))),a.subscriptions.size===0&&a.ws){a.keepAliveTimer&&(clearInterval(a.keepAliveTimer),a.keepAliveTimer=null),a.ws.onmessage=null,a.ws.onerror=null,a.ws.onclose=null,a.ws.close(),a.connected=!1;for(const[y,A]of K)if(A===a){K.delete(y);break}}},established:p,connection:a.ws}}function gt(t){return typeof t=="object"&&t!==null&&t.__blocks==="realtime/channel"&&typeof t.wsUrl=="string"&&typeof t.connectToken=="string"&&typeof t.token=="string"}function ye(t){if(gt(t)){const{channel:e,wsUrl:i,connectToken:s,token:n}=t;return{subscribe(r){const a=typeof r=="function"?r:r.onMessage,o=typeof r=="function"?void 0:r.onDisconnect;return vt(i,s,e,n,a,o)}}}if(Array.isArray(t))return t.map(ye);if(typeof t=="object"&&t!==null){const e={};for(const[i,s]of Object.entries(t))e[i]=ye(s);return e}return t}He({onResponse:ye});f("CONDITION_TYPES");f("DOMAIN_TYPES");f("PROVIDER_CATEGORIES");f("SUBJECT_CATALOG");f("activeInventorySchema");const $=f("api");f("buildGroupedCatalogText");f("buildIntentClassificationPrompt");f("buildInteractiveCatalogPayload");f("buildInteractiveRequestConfirmationPayload");f("buildInteractiveYearSubjectsPayload");f("buildLLMMessagePrompt");f("chunkTextForVectorStore");f("cleanSubjectName");f("demandBoardSchema");f("emitLifecycleEvent");f("formatConditionBadges");f("formatDemandDisplay");f("generateLLMMessage");f("getHelpMessage");f("getWhatsAppCredentials");f("hasExplicitSchoolYear");f("inferDomainFromConcept");f("maskPromptPII");f("normalizeConceptKey");f("parseParentMessageIntentsWithLLM");f("processWhatsAppInbound");f("sanitizeExtractedTitle");f("sendWhatsAppInteractiveMessage");f("sendWhatsAppTextMessage");f("truncateWhatsAppText");f("verifyMetaHmacSignature");f("withDurableExecution");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const V=globalThis,Pe=t=>t,oe=V.trustedTypes,Ee=oe?oe.createPolicy("lit-html",{createHTML:t=>t}):void 0,Be="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,Re="?"+E,ht=`<${Re}>`,H=document,Z=()=>H.createComment(""),X=t=>t===null||typeof t!="object"&&typeof t!="function",ke=Array.isArray,mt=t=>ke(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",fe=`[ 	
\f\r]`,F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ie=/-->/g,Te=/>/g,L=RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Le=/'/g,Me=/"/g,Ne=/^(?:script|style|textarea|title)$/i,bt=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),d=bt(1),ee=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),De=new WeakMap,D=H.createTreeWalker(H,129);function ze(t,e){if(!ke(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ee!==void 0?Ee.createHTML(e):e}const yt=(t,e)=>{const i=t.length-1,s=[];let n,r=e===2?"<svg>":e===3?"<math>":"",a=F;for(let o=0;o<i;o++){const l=t[o];let p,v,c=-1,g=0;for(;g<l.length&&(a.lastIndex=g,v=a.exec(l),v!==null);)g=a.lastIndex,a===F?v[1]==="!--"?a=Ie:v[1]!==void 0?a=Te:v[2]!==void 0?(Ne.test(v[2])&&(n=RegExp("</"+v[2],"g")),a=L):v[3]!==void 0&&(a=L):a===L?v[0]===">"?(a=n??F,c=-1):v[1]===void 0?c=-2:(c=a.lastIndex-v[2].length,p=v[1],a=v[3]===void 0?L:v[3]==='"'?Me:Le):a===Me||a===Le?a=L:a===Ie||a===Te?a=F:(a=L,n=void 0);const y=a===L&&t[o+1].startsWith("/>")?" ":"";r+=a===F?l+ht:c>=0?(s.push(p),l.slice(0,c)+Be+l.slice(c)+E+y):l+E+(c===-2?o:y)}return[ze(t,r+(t[i]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class te{constructor({strings:e,_$litType$:i},s){let n;this.parts=[];let r=0,a=0;const o=e.length-1,l=this.parts,[p,v]=yt(e,i);if(this.el=te.createElement(p,s),D.currentNode=this.el.content,i===2||i===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(n=D.nextNode())!==null&&l.length<o;){if(n.nodeType===1){if(n.hasAttributes())for(const c of n.getAttributeNames())if(c.endsWith(Be)){const g=v[a++],y=n.getAttribute(c).split(E),A=/([.?@])?(.*)/.exec(g);l.push({type:1,index:r,name:A[2],strings:y,ctor:A[1]==="."?$t:A[1]==="?"?At:A[1]==="@"?kt:de}),n.removeAttribute(c)}else c.startsWith(E)&&(l.push({type:6,index:r}),n.removeAttribute(c));if(Ne.test(n.tagName)){const c=n.textContent.split(E),g=c.length-1;if(g>0){n.textContent=oe?oe.emptyScript:"";for(let y=0;y<g;y++)n.append(c[y],Z()),D.nextNode(),l.push({type:2,index:++r});n.append(c[g],Z())}}}else if(n.nodeType===8)if(n.data===Re)l.push({type:2,index:r});else{let c=-1;for(;(c=n.data.indexOf(E,c+1))!==-1;)l.push({type:7,index:r}),c+=E.length-1}r++}}static createElement(e,i){const s=H.createElement("template");return s.innerHTML=e,s}}function O(t,e,i=t,s){var a,o;if(e===ee)return e;let n=s!==void 0?(a=i._$Co)==null?void 0:a[s]:i._$Cl;const r=X(e)?void 0:e._$litDirective$;return(n==null?void 0:n.constructor)!==r&&((o=n==null?void 0:n._$AO)==null||o.call(n,!1),r===void 0?n=void 0:(n=new r(t),n._$AT(t,i,s)),s!==void 0?(i._$Co??(i._$Co=[]))[s]=n:i._$Cl=n),n!==void 0&&(e=O(t,n._$AS(t,e.values),n,s)),e}class xt{constructor(e,i){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=i}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:i},parts:s}=this._$AD,n=((e==null?void 0:e.creationScope)??H).importNode(i,!0);D.currentNode=n;let r=D.nextNode(),a=0,o=0,l=s[0];for(;l!==void 0;){if(a===l.index){let p;l.type===2?p=new ae(r,r.nextSibling,this,e):l.type===1?p=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(p=new wt(r,this,e)),this._$AV.push(p),l=s[++o]}a!==(l==null?void 0:l.index)&&(r=D.nextNode(),a++)}return D.currentNode=H,n}p(e){let i=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,i),i+=s.strings.length-2):s._$AI(e[i])),i++}}class ae{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,i,s,n){this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=e,this._$AB=i,this._$AM=s,this.options=n,this._$Cv=(n==null?void 0:n.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const i=this._$AM;return i!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=i.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,i=this){e=O(this,e,i),X(e)?e===b||e==null||e===""?(this._$AH!==b&&this._$AR(),this._$AH=b):e!==this._$AH&&e!==ee&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):mt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==b&&X(this._$AH)?this._$AA.nextSibling.data=e:this.T(H.createTextNode(e)),this._$AH=e}$(e){var r;const{values:i,_$litType$:s}=e,n=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=te.createElement(ze(s.h,s.h[0]),this.options)),s);if(((r=this._$AH)==null?void 0:r._$AD)===n)this._$AH.p(i);else{const a=new xt(n,this),o=a.u(this.options);a.p(i),this.T(o),this._$AH=a}}_$AC(e){let i=De.get(e.strings);return i===void 0&&De.set(e.strings,i=new te(e)),i}k(e){ke(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,n=0;for(const r of e)n===i.length?i.push(s=new ae(this.O(Z()),this.O(Z()),this,this.options)):s=i[n],s._$AI(r),n++;n<i.length&&(this._$AR(s&&s._$AB.nextSibling,n),i.length=n)}_$AR(e=this._$AA.nextSibling,i){var s;for((s=this._$AP)==null?void 0:s.call(this,!1,!0,i);e!==this._$AB;){const n=Pe(e).nextSibling;Pe(e).remove(),e=n}}setConnected(e){var i;this._$AM===void 0&&(this._$Cv=e,(i=this._$AP)==null||i.call(this,e))}}class de{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,i,s,n,r){this.type=1,this._$AH=b,this._$AN=void 0,this.element=e,this.name=i,this._$AM=n,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b}_$AI(e,i=this,s,n){const r=this.strings;let a=!1;if(r===void 0)e=O(this,e,i,0),a=!X(e)||e!==this._$AH&&e!==ee,a&&(this._$AH=e);else{const o=e;let l,p;for(e=r[0],l=0;l<r.length-1;l++)p=O(this,o[s+l],i,l),p===ee&&(p=this._$AH[l]),a||(a=!X(p)||p!==this._$AH[l]),p===b?e=b:e!==b&&(e+=(p??"")+r[l+1]),this._$AH[l]=p}a&&!n&&this.j(e)}j(e){e===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class $t extends de{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===b?void 0:e}}class At extends de{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==b)}}class kt extends de{constructor(e,i,s,n,r){super(e,i,s,n,r),this.type=5}_$AI(e,i=this){if((e=O(this,e,i,0)??b)===ee)return;const s=this._$AH,n=e===b&&s!==b||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==b&&(s===b||n);n&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var i;typeof this._$AH=="function"?this._$AH.call(((i=this.options)==null?void 0:i.host)??this.element,e):this._$AH.handleEvent(e)}}class wt{constructor(e,i,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}}const ve=V.litHtmlPolyfillSupport;ve==null||ve(te,ae),(V.litHtmlVersions??(V.litHtmlVersions=[])).push("3.3.3");const St=(t,e,i)=>{const s=e;let n=s._$litPart$;return n===void 0&&(s._$litPart$=n=new ae(e.insertBefore(Z(),null),null,void 0,{})),n._$AI(t),n},Ct=document.getElementById("app");let m="available",P="all",B=[],C=[],le=[],_t=null,M=null,ie=!1,J="",ge=null,T="",k="all",I="all",j="all",R="all",S="all",se="",ne="",Q=!0,N=!1,x=null,xe=!1,G=!1,Y="",re="",he="Mathematics",me="+15550199002";function h(t){J=t,ge&&clearTimeout(ge),ge=setTimeout(()=>{J="",u()},1e4)}function we(t){if(!t)return"Unknown date";const e=Date.now(),i=Math.floor((e-t)/1e3);if(i<60)return"Just now";const s=Math.floor(i/60);if(s<60)return`${s}m ago`;const n=Math.floor(s/60);if(n<24)return`${n}h ago`;const r=Math.floor(n/24);return r===1?"Yesterday":r<30?`${r}d ago`:new Date(t).toLocaleDateString()}function U(t){return t?new Date(t).toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function ce(t){switch(t){case"Mathematics":return"badge-math";case"Science":return"badge-science";case"Languages":return"badge-languages";case"Humanities":return"badge-humanities";case"Arts":return"badge-arts";default:return"badge-active"}}function Oe(t){switch(t){case"PrimarySchool":return"badge-primary";case"MiddleSchool":return"badge-middle";case"HighSchool":return"badge-high";case"UniversityPrep":return"badge-uniprep";default:return"badge-active"}}function Pt(t){switch(t){case"PrimarySchool":return"Primary (Years 1-6)";case"MiddleSchool":return"Middle School (Years 7-9)";case"HighSchool":return"High School (Years 10-13)";case"UniversityPrep":return"Uni Prep";default:return t||"General"}}function je(t){switch(t){case"New":return d`
        <span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">
          Verified New
        </span>
      `;case"LikeNew":return d`
        <span class="badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.35);">
          Like New
        </span>
      `;case"Good":return d`
        <span class="badge" style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);">
          Good Condition
        </span>
      `;case"Acceptable":return d`
        <span class="badge" style="background:rgba(156,163,175,0.15);color:#d1d5db;border:1px solid rgba(156,163,175,0.35);">
          Acceptable
        </span>
      `;default:return d`<span class="badge badge-active">${t||"Good"}</span>`}}function Ue(t){if(!t)return!0;const e=Date.now();if(S==="today"){const i=new Date;return i.setHours(0,0,0,0),t>=i.getTime()}if(S==="7days"){const i=e-6048e5;return t>=i}if(S==="30days"){const i=e-2592e6;return t>=i}if(S==="custom"){let i=!0;if(se){const s=new Date(se).setHours(0,0,0,0);t<s&&(i=!1)}if(ne){const s=new Date(ne).setHours(23,59,59,999);t>s&&(i=!1)}return i}return!0}function Et(t){return t.filter(e=>{if(T.trim()){const i=T.toLowerCase().trim();if(!(e.title&&e.title.toLowerCase().includes(i)||e.concept&&e.concept.toLowerCase().includes(i)||e.description&&e.description.toLowerCase().includes(i)||e.domain&&e.domain.toLowerCase().includes(i)||e.providerCategory&&e.providerCategory.toLowerCase().includes(i)||e.sellerPhone&&e.sellerPhone.toLowerCase().includes(i)))return!1}return!(k!=="all"&&e.domain!==k||I!=="all"&&e.providerCategory!==I||j!=="all"&&e.conditionType!==j||R!=="all"&&e.sellerPhone!==R||!Ue(e.createdAt))}).sort((e,i)=>{const s=e.createdAt||0,n=i.createdAt||0;return Q?n-s:s-n})}function We(t,e){return t.filter(i=>{if(i.status!==e)return!1;if(T.trim()){const s=T.toLowerCase().trim();if(!(i.requestedQuery&&i.requestedQuery.toLowerCase().includes(s)||i.concept&&i.concept.toLowerCase().includes(s)||i.domain&&i.domain.toLowerCase().includes(s)||i.userPhone&&i.userPhone.toLowerCase().includes(s)))return!1}return!(k!=="all"&&i.domain!==k||!Ue(i.createdAt))}).sort((i,s)=>{const n=i.createdAt||0,r=s.createdAt||0;return Q?r-n:n-r})}function It(){let t=0;return T.trim()&&t++,k!=="all"&&t++,I!=="all"&&t++,j!=="all"&&t++,R!=="all"&&t++,S!=="all"&&t++,t}function Fe(){T="",k="all",I="all",j="all",R="all",S="all",se="",ne="",u()}async function w(){ie=!0,u();try{const[t,e,i,s,n]=await Promise.all([$.listInventory(),$.listDemands(),$.getLifecycleEvents(),$.getSecurityObservabilityStatus(),$.getSupplyGaps()]);B=t||[],C=e||[],le=i||[],_t=s||null,M=n||null}catch(t){console.error("Failed to load dashboard data:",t),h(`❌ Failed to load data: ${t.message}`)}finally{ie=!1,u()}}async function Tt(t){xe=!0,N=!0,x=null,u();try{x=await $.getSellerStorefront(t)}catch(e){h(`❌ Failed to load seller storefront: ${e.message}`),N=!1}finally{xe=!1,u()}}async function Lt(){try{const t=await $.verifyWebhook("subscribe","my_verify_token_123",`challenge_${Date.now()}`);t.status===200?h(`✅ Handshake Verified! Echoed challenge: "${t.challenge}"`):h(`❌ Verification failed: ${t.error}`)}catch(t){h(`❌ Error verifying webhook: ${t.message}`)}w()}async function z(t,e="+15550199001"){var i,s,n,r;h(`🚀 Processing simulated WhatsApp message: "${t}"...`),u();try{const a={media_id:`media_${Date.now()}`,from_phone:e,message_text:t},o=await $.handleWebhook(a);((i=o.result)==null?void 0:i.status)==="matched"?(h(`🎉 Match Connected! Matched wishlist ID: ${o.result.matchedDemandId}`),m="matches"):((s=o.result)==null?void 0:s.status)==="needs_year_clarification"?h("ℹ️ Clarification Prompt Triggered: Bot asked parent for school year/grade!"):((n=o.result)==null?void 0:n.status)==="greeting"?h("👋 Greeting Handled: Welcome & Guide sent."):(h(`📦 Book Listed into Inventory! Item ID: ${((r=o.result)==null?void 0:r.itemId)||"saved"}`),m="available")}catch(a){h(`❌ Webhook simulation error: ${a.message}`)}w()}async function $e(t,e,i="Mathematics",s="+15550199002"){h(`⏳ Registering demand for "${e}" (${t})...`),u();try{const n=await $.createDemand(s,e,t,i);h(`✨ Wishlist demand registered: "${n.requestedQuery}"!`),G=!1,m="pendings"}catch(n){h(`❌ Error adding demand: ${n.message}`)}w()}async function Ye(t){try{await $.deleteDemand(t),h("🗑️ Removed demand entry."),C=C.filter(e=>e.demandId!==t),u()}catch(e){h(`❌ Error removing demand: ${e.message}`)}}async function Mt(t){try{await $.deleteInventory(t),h("🗑️ Removed inventory item."),B=B.filter(e=>e.itemId!==t),u()}catch(e){h(`❌ Error removing inventory: ${e.message}`)}}async function Ge(){h("🔒 Validating HMAC-SHA256 Payload Signature..."),u();try{const t="secret_key_whatsapp_demo_1234",e=JSON.stringify({test:"hmac-verification",timestamp:Date.now()}),i=new TextEncoder,s=await crypto.subtle.importKey("raw",i.encode(t),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),n=await crypto.subtle.sign("HMAC",s,i.encode(e)),r=Array.from(new Uint8Array(n)).map(o=>o.toString(16).padStart(2,"0")).join("");(await $.validateSignature(e,`sha256=${r}`,t)).valid?h("🛡️ HMAC Verification SUCCESS: Timing-safe cryptographic signature verified."):h("❌ HMAC Verification Failed!")}catch(t){h(`❌ HMAC test error: ${t.message}`)}w()}function Dt(){const t=C.filter(n=>n.status==="pending").length,e=C.filter(n=>n.status==="matched").length,i=B.length,s=le.length;return d`
    <div class="stats-row">
      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="available",u()}}>
        <div class="stat-icon" style="background:rgba(59,130,246,0.15);color:#60a5fa;">📚</div>
        <div class="stat-info">
          <div class="stat-value">${i}</div>
          <div class="stat-label">Available Books</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="pendings",u()}}>
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24;">⏳</div>
        <div class="stat-info">
          <div class="stat-value">${t}</div>
          <div class="stat-label">Pending Demands</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="matches",u()}}>
        <div class="stat-icon" style="background:rgba(16,185,129,0.15);color:#34d399;">🤝</div>
        <div class="stat-info">
          <div class="stat-value">${e}</div>
          <div class="stat-label">Matched Demands</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="observability",u()}}>
        <div class="stat-icon" style="background:rgba(139,92,246,0.15);color:#a78bfa;">📊</div>
        <div class="stat-info">
          <div class="stat-value">${s}</div>
          <div class="stat-label">Live Events</div>
        </div>
      </div>
    </div>
  `}function Ht(){const t=C.filter(s=>s.status==="pending").length,e=C.filter(s=>s.status==="matched").length,i=B.length;return d`
    <div class="tabs-nav">
      <button
        class="tab-btn ${m==="available"?"active":""}"
        @click=${()=>{m="available",u()}}
      >
        <span>📚 Available Books</span>
        <span class="tab-count">${i}</span>
      </button>

      <button
        class="tab-btn ${m==="pendings"?"active":""}"
        @click=${()=>{m="pendings",u()}}
      >
        <span>⏳ Pending Demands</span>
        <span class="tab-count">${t}</span>
      </button>

      <button
        class="tab-btn ${m==="matches"?"active":""}"
        @click=${()=>{m="matches",u()}}
      >
        <span>🤝 Matched Pairs</span>
        <span class="tab-count">${e}</span>
      </button>

      <button
        class="tab-btn ${m==="webhook"?"active":""}"
        @click=${()=>{m="webhook",u()}}
      >
        <span>⚡ Webhook & Simulations</span>
      </button>

      <button
        class="tab-btn ${m==="observability"?"active":""}"
        @click=${()=>{m="observability",u()}}
      >
        <span>📊 Observability & Stream</span>
      </button>
    </div>
  `}function Bt(){return M?d`
    <div class="card" style="background:linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%);border:1px solid rgba(236,72,153,0.3);margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
        <div style="max-width:700px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:1.1rem;">📢</span>
            <h4 style="font-size:1.1rem;color:#f472b6;">Community Supply Deficit Alert (Feature 3B)</h4>
          </div>
          <p style="margin:0;font-size:0.88rem;color:var(--text-muted);line-height:1.4;">
            High demand / low stock in: 
            <strong>${M.deficitSubjects.map(t=>`${t.domain} (${t.count})`).join(", ")}</strong> 
            and grades <strong>${M.deficitGrades.map(t=>t.grade).join(", ")}</strong>.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            class="sm"
            style="background:linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);"
            title="Preview and simulate WhatsApp Broadcast to parent group"
            @click=${()=>{h(`📢 Broadcast Dispatched to WhatsApp Group: "${M==null?void 0:M.broadcastMessageEn}"`)}}
          >
            🚀 Broadcast Supply Call
          </button>
        </div>
      </div>
    </div>
  `:""}function Se(t=!0){const e=It(),i=Array.from(new Set(B.map(s=>s.sellerPhone).filter(Boolean)));return d`
    <div class="filter-toolbar">
      <div class="toolbar-main">
        <!-- Search Input -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search titles, concepts, subjects, or phone..."
            .value=${T}
            @input=${s=>{T=s.target.value,u()}}
          />
        </div>

        <!-- Subject / Domain Selector -->
        <select
          class="filter-select"
          .value=${k}
          @change=${s=>{k=s.target.value,u()}}
        >
          <option value="all">🌐 All Subjects</option>
          <option value="Mathematics">📐 Mathematics</option>
          <option value="Science">🔬 Science</option>
          <option value="Languages">🗣️ Languages</option>
          <option value="Humanities">🌍 Humanities</option>
          <option value="Arts">🎨 Arts</option>
        </select>

        <!-- Class / Level Selector -->
        ${t?d`
              <select
                class="filter-select"
                .value=${I}
                @change=${s=>{I=s.target.value,u()}}
              >
                <option value="all">🏫 All Classes / Levels</option>
                <option value="PrimarySchool">🎒 Primary School (Y1-Y6)</option>
                <option value="MiddleSchool">📘 Middle School (Y7-Y9)</option>
                <option value="HighSchool">🎓 High School (Y10-Y13)</option>
                <option value="UniversityPrep">🏛️ University Prep</option>
              </select>
            `:""}

        <!-- Condition Selector (Feature 3D) -->
        ${t?d`
              <select
                class="filter-select"
                .value=${j}
                @change=${s=>{j=s.target.value,u()}}
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="LikeNew">Like New</option>
                <option value="Good">Good</option>
                <option value="Acceptable">Acceptable</option>
              </select>
            `:""}

        <!-- Seller Filter (Feature 3A) -->
        ${i.length>1?d`
              <select
                class="filter-select"
                .value=${R}
                @change=${s=>{R=s.target.value,u()}}
              >
                <option value="all">👨‍👩‍👧 All Parent Sellers</option>
                ${i.map(s=>d`<option value="${s}">Seller: ${s}</option>`)}
              </select>
            `:""}

        <!-- Date Range Presets -->
        <select
          class="filter-select"
          .value=${S}
          @change=${s=>{S=s.target.value,u()}}
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
          @click=${()=>{Q=!Q,u()}}
        >
          ${Q?"⬇️ Newest First":"⬆️ Oldest First"}
        </button>

        <!-- Reset Button -->
        ${e>0?d`
              <button class="danger sm" @click=${Fe}>
                ✕ Reset (${e})
              </button>
            `:""}
      </div>

      <!-- Custom Date Inputs (if selected) -->
      ${S==="custom"?d`
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:10px;">
              <span style="font-size:0.82rem;color:var(--text-muted);font-weight:600;">Custom Created Date:</span>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">From:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${se}
                  @change=${s=>{se=s.target.value,u()}}
                />
              </div>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">To:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${ne}
                  @change=${s=>{ne=s.target.value,u()}}
                />
              </div>
            </div>
          `:""}

      <!-- Interactive Subject & Class Pills -->
      <div class="toolbar-secondary">
        <div class="pill-group">
          <span class="pill-label">Subjects:</span>
          ${["all","Mathematics","Science","Languages","Humanities","Arts"].map(s=>d`
              <button
                class="pill ${k===s?"active":""}"
                @click=${()=>{k=s,u()}}
              >
                ${s==="all"?"All Subjects":s}
              </button>
            `)}
        </div>

        ${t?d`
              <div class="pill-group">
                <span class="pill-label">Classes:</span>
                ${[{id:"all",label:"All Levels"},{id:"PrimarySchool",label:"Primary"},{id:"MiddleSchool",label:"Middle"},{id:"HighSchool",label:"High"},{id:"UniversityPrep",label:"Uni Prep"}].map(s=>d`
                    <button
                      class="pill ${I===s.id?"active":""}"
                      @click=${()=>{I=s.id,u()}}
                    >
                      ${s.label}
                    </button>
                  `)}
              </div>
            `:""}
      </div>
    </div>
  `}function Rt(){const t=Et(B);return d`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>📚 Available Books Catalog</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Active inventory extracted from WhatsApp parent messages, categorized by class and subject (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <!-- View Grouping Selector -->
          <div style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;">
            <button
              class="sm ${P==="all"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{P="all",u()}}
            >
              Grid
            </button>
            <button
              class="sm ${P==="by-subject"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{P="by-subject",u()}}
            >
              By Subject
            </button>
            <button
              class="sm ${P==="by-class"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{P="by-class",u()}}
            >
              By Class
            </button>
          </div>
          <button class="secondary sm" @click=${w}>
            ${ie?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      <!-- Feature 3B: Supply Gaps Alert -->
      ${Bt()}

      ${Se(!0)}

      ${t.length===0?d`
            <div class="empty-state">
              <div class="empty-state-icon">📖</div>
              <div class="empty-state-title">No books match your current filters</div>
              <div class="empty-state-text">
                Try clearing your search keyword, selecting "All Subjects" / "All Dates", or simulate a book upload in the Webhook tab.
              </div>
              <button class="secondary sm" style="margin-top:10px;" @click=${Fe}>
                Clear All Filters
              </button>
            </div>
          `:P==="all"?d`
            <div class="items-grid">
              ${t.map(e=>Ce(e))}
            </div>
          `:P==="by-subject"?Nt(t):zt(t)}
    </div>

    <!-- Feature 3A: Seller Storefront Modal -->
    ${Ot()}
  `}function Ce(t){return d`
    <div class="item-card">
      <div class="item-card-header">
        <div class="item-title-wrap">
          <div class="book-title">${t.title}</div>
          <div class="book-concept">${t.concept}</div>
        </div>
        <span class="badge ${ce(t.domain)}">
          ${t.domain}
        </span>
      </div>

      <div class="tags-row">
        <span class="badge ${Oe(t.providerCategory)}">
          ${Pt(t.providerCategory)}
        </span>
        <!-- Feature 3D: Verified Condition Badge -->
        ${je(t.conditionType)}
      </div>

      ${t.description?d`<div style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">${t.description}</div>`:""}

      <div class="card-footer">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <!-- Feature 3A: Clickable Seller Storefront Link -->
          <div style="font-size:0.75rem;color:var(--text-dim);">
            Seller: 
            <button
              class="secondary sm"
              style="padding:2px 6px;font-size:0.72rem;margin-left:4px;display:inline-flex;"
              title="Click to view full family collection & grade bundles"
              @click=${()=>Tt(t.sellerPhone)}
            >
              👨‍👩‍👧 ${t.sellerPhone||"Parent"} Storefront
            </button>
          </div>
          <div class="date-badge" title="${U(t.createdAt)}">
            📅 ${we(t.createdAt)} (${U(t.createdAt)})
          </div>
        </div>
        <button
          class="danger sm"
          style="padding:4px 8px;font-size:0.72rem;"
          title="Remove from active inventory"
          @click=${()=>Mt(t.itemId)}
        >
          🗑️
        </button>
      </div>
    </div>
  `}function Nt(t){return d`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${["Mathematics","Science","Languages","Humanities","Arts"].map(i=>{const s=t.filter(n=>n.domain===i);return s.length===0?"":d`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${i}</h4>
              <span class="badge ${ce(i)}">${s.length} Available</span>
            </div>
            <div class="items-grid">
              ${s.map(n=>Ce(n))}
            </div>
          </div>
        `})}
    </div>
  `}function zt(t){return d`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${[{key:"PrimarySchool",label:"Primary School (Years 1 - 6)"},{key:"MiddleSchool",label:"Middle School (Years 7 - 9)"},{key:"HighSchool",label:"High School (Years 10 - 13)"},{key:"UniversityPrep",label:"University Prep"}].map(i=>{const s=t.filter(n=>n.providerCategory===i.key);return s.length===0?"":d`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${i.label}</h4>
              <span class="badge ${Oe(i.key)}">${s.length} Available</span>
            </div>
            <div class="items-grid">
              ${s.map(n=>Ce(n))}
            </div>
          </div>
        `})}
    </div>
  `}function Ot(){return N?d`
    <div
      style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);"
      @click=${t=>{t.target===t.currentTarget&&(N=!1,u())}}
    >
      <div class="card" style="width:100%;max-width:680px;max-height:85vh;overflow-y:auto;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);display:flex;flex-direction:column;gap:18px;">
        ${xe?d`<div style="text-align:center;padding:40px 0;color:var(--text-muted);">Loading Family Storefront...</div>`:x?d`
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">
                <div>
                  <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:rgba(59,130,246,0.15);color:#60a5fa;font-size:0.75rem;font-weight:600;margin-bottom:6px;">
                    👨‍👩‍👧 FAMILY COLLECTION (FEATURE 3A)
                  </div>
                  <h3 style="font-size:1.4rem;">Parent Storefront: ${x.sellerPhone}</h3>
                  <p style="margin:4px 0 0 0;font-size:0.85rem;color:var(--text-muted);">
                    Total <strong>${x.totalBooks} textbooks</strong> available across multiple grades.
                  </p>
                </div>
                <button class="secondary sm" @click=${()=>{N=!1,u()}}>
                  ✕ Close
                </button>
              </div>

              <!-- Grade Bundles Section -->
              <div>
                <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">📦 Available Grade Bundles</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;">
                  ${x.bundles.map(t=>d`
                      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--surface-border);border-radius:10px;padding:12px;">
                        <div style="font-weight:700;font-size:0.95rem;color:#fff;">${t.grade} Bundle</div>
                        <div style="font-size:0.8rem;color:#60a5fa;margin-top:2px;">${t.count} Books Available</div>
                        <button
                          class="secondary sm"
                          style="margin-top:8px;width:100%;font-size:0.72rem;"
                          @click=${()=>{h(`💬 WhatsApp Bundle Request sent to seller ${x==null?void 0:x.sellerPhone} for all ${t.count} books in ${t.grade}!`)}}
                        >
                          Request Entire Bundle
                        </button>
                      </div>
                    `)}
                </div>
              </div>

              <!-- Individual Books List -->
              <div>
                <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">📖 All Books from this Parent</h4>
                <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;">
                  ${x.items.map(t=>d`
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--surface-border);border-radius:8px;">
                        <div>
                          <div style="font-weight:600;font-size:0.88rem;color:#fff;">${t.title}</div>
                          <div style="font-size:0.75rem;color:var(--text-dim);">${t.domain} &bull; ${t.concept}</div>
                        </div>
                        <div>
                          ${je(t.conditionType)}
                        </div>
                      </div>
                    `)}
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">
                <button
                  class="secondary"
                  @click=${()=>{R=(x==null?void 0:x.sellerPhone)||"all",N=!1,u()}}
                >
                  Filter Main Catalog by this Seller
                </button>
              </div>
            `:""}
      </div>
    </div>
  `:""}function jt(){const t=We(C,"pending");return d`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>⏳ Pending Wishlists & Demands</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Parents actively seeking books. When an inbound offer matches, Relay automatically pairs them (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="sm" @click=${()=>{G=!0,u()}}>
            + Create Demand
          </button>
          <button class="secondary sm" @click=${w}>
            ${ie?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${Se(!1)}

      ${t.length===0?d`
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <div class="empty-state-title">No pending wishlists found</div>
              <div class="empty-state-text">
                All requests have either been matched or no parents are waiting for books right now.
              </div>
              <button
                class="sm"
                style="margin-top:10px;"
                @click=${()=>$e("Year5Chemistry","Year 5 Chemistry","Science")}
              >
                + Add Demo "Year 5 Chemistry" Demand
              </button>
            </div>
          `:d`
            <div class="items-grid">
              ${t.map(e=>d`
                  <div class="item-card" style="border-left: 3px solid var(--warning);">
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${e.requestedQuery}</div>
                        <div class="book-concept">Concept: ${e.concept}</div>
                      </div>
                      <span class="badge badge-pending">PENDING</span>
                    </div>

                    <div class="tags-row">
                      <span class="badge ${ce(e.domain)}">
                        ${e.domain||"Marketplace"}
                      </span>
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          Waiting Parent: <strong style="color:var(--text);">${e.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${U(e.createdAt)}">
                          📅 ${we(e.createdAt)} (${U(e.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        <button
                          class="secondary sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Simulate seller offering this book to trigger automatic match"
                          @click=${()=>z(`I have ${e.requestedQuery} available for Year parent`,"+15559998888")}
                        >
                          ⚡ Match
                        </button>
                        <button
                          class="danger sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Delete demand"
                          @click=${()=>Ye(e.demandId)}
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
    ${G?d`
          <div
            style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);"
            @click=${e=>{e.target===e.currentTarget&&(G=!1,u())}}
          >
            <div class="card" style="width:100%;max-width:480px;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);">
              <h3>Create Parent Wishlist Request</h3>
              <p style="margin:4px 0 18px 0;font-size:0.85rem;color:var(--text-muted);">
                Add a demand for a textbook that isn't currently in stock.
              </p>

              <div style="display:flex;flex-direction:column;gap:14px;">
                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Book Title / Request Query</label>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="e.g. Year 10 Physics Textbook"
                    style="padding-left:14px;"
                    .value=${Y}
                    @input=${e=>{Y=e.target.value,re=e.target.value.replace(/[^a-zA-Z0-9]/g,"")}}
                  />
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Normalized Concept Key</label>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="e.g. Year10Physics"
                    style="padding-left:14px;"
                    .value=${re}
                    @input=${e=>{re=e.target.value}}
                  />
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Subject Domain</label>
                  <select
                    class="filter-select"
                    style="width:100%;"
                    .value=${he}
                    @change=${e=>{he=e.target.value}}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Parent WhatsApp Phone Number</label>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="+15550199002"
                    style="padding-left:14px;"
                    .value=${me}
                    @input=${e=>{me=e.target.value}}
                  />
                </div>

                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                  <button class="secondary" @click=${()=>{G=!1,u()}}>
                    Cancel
                  </button>
                  <button
                    @click=${()=>{Y.trim()&&$e(re||Y.replace(/[^a-zA-Z0-9]/g,""),Y,he,me)}}
                  >
                    Save Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        `:""}
  `}function Ut(){const t=We(C,"matched");return d`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>🤝 Matched Pairs & Successful Connections</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Demands successfully connected with available books via the Proactive Bedrock Matchmaker (Sorted newest first).
          </p>
        </div>
        <button class="secondary sm" @click=${w}>
          ${ie?"⏳ Refreshing...":"🔄 Refresh"}
        </button>
      </div>

      ${Se(!1)}

      ${t.length===0?d`
            <div class="empty-state">
              <div class="empty-state-icon">🤝</div>
              <div class="empty-state-title">No matched pairs found yet</div>
              <div class="empty-state-text">
                When a seller lists a book that matches a waiting parent's wishlist, it will be displayed here in real time.
              </div>
              <div style="margin-top:12px;display:flex;gap:10px;">
                <button
                  class="secondary sm"
                  @click=${async()=>{await $e("Year8Science","Year 8 Science","Science","+15559990001"),await z("I have Year 8 Science textbook in great shape","+15559990002")}}
                >
                  ⚡ Run Auto-Match Simulation
                </button>
              </div>
            </div>
          `:d`
            <div class="items-grid">
              ${t.map(e=>d`
                  <div class="item-card" style="border-left: 3px solid var(--success);">
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${e.requestedQuery}</div>
                        <div class="book-concept">Concept: ${e.concept}</div>
                      </div>
                      <span class="badge badge-matched">${e.status==="fulfilled"?"COMPLETED / SOLD":"48H HOLD"}</span>
                    </div>

                    <div class="tags-row">
                      <span class="badge ${ce(e.domain)}">
                        ${e.domain||"Marketplace"}
                      </span>
                      ${e.handoverCode?d`<span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);">Code: #${e.handoverCode}</span>`:""}
                    </div>

                    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);padding:10px 12px;border-radius:8px;font-size:0.83rem;color:#6ee7b7;">
                      ${e.status==="fulfilled"?"Handover completed! Book marked as sold and removed from active catalog.":"48-Hour Reservation Active. Matched parents introduced via WhatsApp."}
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          Recipient Parent: <strong style="color:var(--text);">${e.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${U(e.createdAt)}">
                          ${we(e.createdAt)} (${U(e.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        ${e.status!=="fulfilled"?d`
                              <button
                                class="sm"
                                style="font-size:0.72rem;padding:4px 8px;background:#059669;"
                                title="Confirm physical handover and mark book sold"
                                @click=${async()=>{await $.confirmHandover({itemId:e.matchedItemId||"",demandId:e.demandId}),h("Handover confirmed! Book marked as sold."),await w()}}
                              >
                                Mark Sold
                              </button>
                            `:""}
                        <button
                          class="danger sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Delete demand"
                          @click=${()=>Ye(e.demandId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                `)}
            </div>
          `}
    </div>
  `}function Wt(){return d`
    <div style="display:flex;flex-direction:column;gap:24px;">
      <div class="card">
        <h3>⚡ WhatsApp Webhook Controls & Live Simulator</h3>
        <p style="margin:4px 0 20px 0;font-size:0.92rem;color:var(--text-muted);">
          Simulate inbound parent WhatsApp group messages, media uploads, and test API Gateway webhook verification handshakes.
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
          <!-- Simulation 1: Inbound Book Offer -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">📦 Inbound Book Listing (Offer)</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate parent sending "Year 5 Chemistry Textbook" with photo cover.</div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>z("Year 5 Chemistry Textbook - Pristine Condition")}
            >
              Simulate "Year 5 Chemistry"
            </button>
          </div>

          <!-- Simulation 2: Inbound High School CS -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">💻 Computer Science Book</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate parent offering "Year 12 Computer Science" textbook.</div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>z("I have Year 12 Computer Science Book")}
            >
              Simulate "Year 12 CS"
            </button>
          </div>

          <!-- Simulation 3: Bilingual French Message -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">🇫🇷 French Message (Collège)</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate French parent offering "Manuel de Physique 3ème".</div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>z("J'ai un livre de physique pour la classe de 3ème")}
            >
              Simulate "Physique 3ème"
            </button>
          </div>

          <!-- Simulation 4: Clarification Flow -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">❓ Year Clarification Prompt</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate offer with missing school year (triggers conversational clarification).</div>
            </div>
            <button
              class="secondary sm"
              @click=${()=>z("I have Chemistry books available for anyone who wants them")}
            >
              Simulate Missing Year
            </button>
          </div>
        </div>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:12px;flex-wrap:wrap;">
          <button @click=${Lt}>
            🔗 Test GET Webhook Handshake (hub.challenge)
          </button>
          <button class="secondary" @click=${Ge}>
            🔐 Test HMAC-SHA256 Payload Signature
          </button>
        </div>
      </div>
    </div>
  `}function Ft(){return d`
    <div style="display:flex;flex-direction:column;gap:24px;">
      <!-- Enterprise Security & Governance Overview -->
      <div class="card" style="border-left: 4px solid var(--accent, #6366f1)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h3 style="margin:0 0 4px 0;">Enterprise Security, Governance & Observability</h3>
            <p style="margin:0;font-size:0.9rem;color:var(--text-muted);">
              Real-time telemetry, perimeter defense, encryption at rest, and Bedrock Guardrails.
            </p>
          </div>
          <button class="secondary sm" @click=${Ge}>
            🔐 Validate HMAC
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;margin-top:18px;">
          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Perimeter Defense</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#10b981;">🛡️ AWS WAF & Rate Limit</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">2,000 req/5min per IP</div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Data Governance</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#3b82f6;">🔒 Bedrock Guardrails</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">PII Redaction (Phone, Address)</div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Encryption & Storage</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#a855f7;">🔑 AWS KMS CMK</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">30-Day S3 Image Expiration</div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Telemetry & Observability</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#f59e0b;">📊 X-Ray Tracing + EMF</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">Zero-latency CloudWatch EMF</div>
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
          <button class="secondary sm" @click=${w}>
            🔄 Refresh Stream
          </button>
        </div>

        <div class="terminal-log">
          ${le.length===0?d`<div style="color:var(--text-muted);padding:12px 0;">Waiting for lifecycle events...</div>`:le.slice().reverse().map(t=>d`
                    <div class="log-entry">
                      <span class="log-time">[${new Date(t.timestamp).toLocaleTimeString([],{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}]</span>
                      <span class="log-type">${t.eventType}</span>
                      <span class="log-details">${JSON.stringify(t.details)}</span>
                    </div>
                  `)}
        </div>
      </div>
    </div>
  `}function u(){St(d`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Status Notification Banner -->
        ${J?d`
              <div class="status-banner">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:1.1rem;">🔔</span>
                  <span>${J}</span>
                </div>
                <button
                  class="secondary sm"
                  style="padding:2px 8px;font-size:0.75rem;"
                  @click=${()=>{J="",u()}}
                >
                  ✕
                </button>
              </div>
            `:""}

        <!-- Top Level Stats Summary -->
        ${Dt()}

        <!-- Tab Bar Navigation -->
        ${Ht()}

        <!-- Active Tab Content -->
        ${m==="available"?Rt():m==="pendings"?jt():m==="matches"?Ut():m==="webhook"?Wt():Ft()}
      </div>
    `,Ct)}w();
