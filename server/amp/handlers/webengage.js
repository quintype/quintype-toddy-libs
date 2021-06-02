function getHelperIframeHtmlStr() {
  // https://cdn.ampproject.org/v0/amp-web-push-helper-frame.html
  return `
  <!doctype html>
  <html>
  <!-- AMP Web Push Helper IFrame -->

  <head>
    <meta charset="utf-8">
    <script>(function(){'use strict';var h;function aa(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}function ba(a){for(var b=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global],c=0;c<b.length;++c){var d=b[c];if(d&&d.Math==Math)return d}return function(){throw Error("Cannot find global object");}()}var ca=ba(this);var m=Array.isArray;function da(a,b){for(var c=[],d=0,e=0;e<a.length;e++){var g=a[e];b(g,e,a)?c.push(g):(d<e&&(a[d]=g),d++)}d<a.length&&(a.length=d);return c}function ea(a,b){for(var c=0;c<a.length;c++)if(b(a[c],c,a))return c;return-1};function la(a,b){var c;"number"!==typeof c&&(c=0);return c+b.length>a.length?!1:-1!==a.indexOf(b,c)};function n(a){return 1==(null==a?void 0:a.nodeType)?a.tagName.toLowerCase()+(a.id?"#"+a.id:""):a};function ma(a,b,c,d){var e=void 0===c?"Assertion failed":c;if(b)return b;a&&!la(e,a)&&(e+=a);for(var g=3,f=e.split("%s"),k=f.shift(),l=[k];f.length;){var r=arguments[g++],t=f.shift();k+=n(r)+t;l.push(r,t.trim())}g=Error(k);g.messageArray=da(l,function(v){return""!==v});self.__AMP_REPORT_ERROR&&self.__AMP_REPORT_ERROR(g);throw g;}function p(a,b,c,d,e){m(e)?a(c,e.concat([b])):a(c,(e||d)+": %s",b);return b};function q(a){var b;if(null==(b=Object.getOwnPropertyDescriptor(a,"message"))?0:b.writable)return a;var c=a.stack;b=Error(a.message);for(var d in a)b[d]=a[d];b.stack=c;return b}function u(a){var b=null,c="";var d=arguments;var e="undefined"!=typeof Symbol&&Symbol.iterator&&d[Symbol.iterator];d=e?e.call(d):{next:aa(d)};for(e=d.next();!e.done;e=d.next())e=e.value,e instanceof Error&&!b?b=q(e):(c&&(c+=" "),c+=e);b?c&&(b.message=c+": "+b.message):b=Error(c);return b};function w(a,b){var c=b=void 0===b?"":b;try{return decodeURIComponent(a)}catch(d){return c}};var na=/(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;function x(a){var b=Object.create(null);if(!a)return b;for(var c;c=na.exec(a);){var d=w(c[1],c[1]);c=c[2]?w(c[2].replace(/\+/g," "),c[2]):"";b[d]=c}return b};var y="";function z(a){var b=a||self;if(b.__AMP_MODE)var c=b.__AMP_MODE;else c=x(b.location.originalHash||b.location.hash),y||(y=b.AMP_CONFIG&&b.AMP_CONFIG.v?b.AMP_CONFIG.v:"012105150310000"),c={localDev:!1,development:!!(0<=["1","actions","amp","amp4ads","amp4email"].indexOf(c.development)||b.AMP_DEV_MODE),examiner:"2"==c.development,esm:!1,geoOverride:c["amp-geo"],minified:!0,test:!1,log:c.log,version:"2105150310000",rtvVersion:y},c=b.__AMP_MODE=c;return c};function oa(a){var b=!1,c=null,d=a;return function(e){for(var g=[],f=0;f<arguments.length;++f)g[f-0]=arguments[f];b||(c=d.apply(self,g),b=!0,d=null);return c}};var B=self.AMP_CONFIG||{},C=("string"==typeof B.cdnProxyRegex?new RegExp(B.cdnProxyRegex):B.cdnProxyRegex)||/^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;function D(a){if(!self.document||!self.document.head||self.location&&C.test(self.location.origin))return null;var b=self.document.head.querySelector('meta[name="'+a+'"]');return b&&b.getAttribute("content")||null}
  var E={thirdParty:B.thirdPartyUrl||"https://3p.ampproject.net",thirdPartyFrameHost:B.thirdPartyFrameHost||"ampproject.net",thirdPartyFrameRegex:("string"==typeof B.thirdPartyFrameRegex?new RegExp(B.thirdPartyFrameRegex):B.thirdPartyFrameRegex)||/^d-\d+\.ampproject\.net$/,cdn:B.cdnUrl||D("runtime-host")||"https://cdn.ampproject.org",cdnProxyRegex:C,localhostRegex:/^https?:\/\/localhost(:\d+)?$/,errorReporting:B.errorReportingUrl||"https://us-central1-amp-error-reporting.cloudfunctions.net/r",betaErrorReporting:B.betaErrorReportingUrl||
  "https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta",localDev:B.localDev||!1,trustedViewerHosts:[/(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/,/(^|\.)gmail\.(com|dev)$/],geoApi:B.geoApiUrl||D("amp-geo-api")};function pa(){}function F(a){return 0<=a.indexOf("\u200b\u200b\u200b")}function qa(a,b){return b.reduce(function(c,d){return c+"&s[]="+encodeURIComponent(String(n(d)))},"https://log.amp.dev/?v=012105150310000&id="+encodeURIComponent(a))}
  function G(a,b,c){var d=this,e=c=void 0===c?"":c;this.win=a;this.Y=b;this.F=this.win.console&&this.win.console.log&&"0"!=z().log?this.Y(parseInt(z().log,10),z().development):0;this.G=e;this.j=null;this.X=oa(function(){a.fetch(E.cdn+"/rtv/012105150310000/log-messages.simple.json").then(function(g){return g.json()},pa).then(function(g){g&&(d.j=g)})});this.D=this.assert.bind(this)}
  function I(a,b,c,d){if(0!=a.F){var e=a.win.console.log;"ERROR"==c?e=a.win.console.error||e:"INFO"==c?e=a.win.console.info||e:"WARN"==c&&(e=a.win.console.warn||e);c=m(d[0])?J(a,d[0]):d;b="["+b+"]";"string"===typeof c[0]?c[0]=b+" "+c[0]:c.unshift(b);e.apply(a.win.console,c)}}h=G.prototype;h.isEnabled=function(){return 0!=this.F};h.fine=function(a,b){4<=this.F&&I(this,a,"FINE",Array.prototype.slice.call(arguments,1))};
  h.info=function(a,b){3<=this.F&&I(this,a,"INFO",Array.prototype.slice.call(arguments,1))};h.warn=function(a,b){2<=this.F&&I(this,a,"WARN",Array.prototype.slice.call(arguments,1))};h.R=function(a,b){if(1<=this.F)I(this,a,"ERROR",Array.prototype.slice.call(arguments,1));else{var c=u.apply(null,Array.prototype.slice.call(arguments,1));K(this,c);return c}};h.error=function(a,b){var c=this.R.apply(this,arguments);c&&(c.name=a||c.name,self.__AMP_REPORT_ERROR(c))};
  h.expectedError=function(a,b){var c=this.R.apply(this,arguments);c&&(c.expected=!0,self.__AMP_REPORT_ERROR(c))};h.createError=function(a){var b=u.apply(null,arguments);K(this,b);return b};h.createExpectedError=function(a){var b=u.apply(null,arguments);K(this,b);b.expected=!0;return b};h.assert=function(a,b,c){return m(b)?this.assert.apply(this,[a].concat(J(this,b))):ma.apply(null,[this.G].concat(Array.prototype.slice.call(arguments)))};
  h.assertElement=function(a,b){return p(this.D,a,1==(null==a?void 0:a.nodeType),"Element expected",b)};h.assertString=function(a,b){return p(this.D,a,"string"==typeof a,"String expected",b)};h.assertNumber=function(a,b){return p(this.D,a,"number"==typeof a,"Number expected",b)};h.assertArray=function(a,b){return p(this.D,a,m(a),"Array expected",b)};h.assertBoolean=function(a,b){return p(this.D,a,!!a===a,"Boolean expected",b)};
  h.assertEnumValue=function(a,b,c){var d=this.D;a:{for(var e in a)if(a[e]===b){a=!0;break a}a=!1}return p(d,b,a,"Unknown "+(void 0===c?"enum":c)+' value: "'+b+'"')};function K(a,b){b=q(b);a.G?b.message?-1==b.message.indexOf(a.G)&&(b.message+=a.G):b.message=a.G:F(b.message)&&(b.message=b.message.replace("\u200b\u200b\u200b",""))}function J(a,b){var c=b.shift();z(a.win).development&&a.X();return a.j&&c in a.j?[a.j[c]].concat(b):["More info at "+qa(c,b)]}
  self.__AMP_LOG=self.__AMP_LOG||{user:null,dev:null,userForEmbed:null};var L=self.__AMP_LOG,M=null;function N(){L.user||(L.user=ra());return L.user}function ra(){if(!M)throw Error("failed to call initLogConstructor");return new M(self,function(a,b){return b||1<=a?4:2},"\u200b\u200b\u200b")}function O(){if(L.dev)return L.dev;if(!M)throw Error("failed to call initLogConstructor");return L.dev=new M(self,function(a){return 3<=a?4:2<=a?3:0})};var P;/*
   https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
  function Q(){this.U=100;this.K=this.P=0;this.H=Object.create(null)}Q.prototype.has=function(a){return!!this.H[a]};Q.prototype.get=function(a){var b=this.H[a];if(b)return b.access=++this.K,b.payload};Q.prototype.put=function(a,b){this.has(a)||this.P++;this.H[a]={payload:b,access:this.K};if(!(this.P<=this.U)){a=this.H;var c=this.K+1,d;for(d in a){var e=a[d].access;if(e<c){c=e;var g=d}}void 0!==g&&(delete a[g],this.P--)}};var R,S;
  function T(a){R||(R=self.document.createElement("a"),S=self.__AMP_URL_CACHE||(self.__AMP_URL_CACHE=new Q));var b=S,c=R;if(b&&b.has(a))a=b.get(a);else{c.href=a;c.protocol||(c.href=c.href);var d={href:c.href,protocol:c.protocol,host:c.host,hostname:c.hostname,port:"0"==c.port?"":c.port,pathname:c.pathname,search:c.search,hash:c.hash,origin:null};"/"!==d.pathname[0]&&(d.pathname="/"+d.pathname);if("http:"==d.protocol&&80==d.port||"https:"==d.protocol&&443==d.port)d.port="",d.host=d.hostname;d.origin=
  c.origin&&"null"!=c.origin?c.origin:"data:"!=d.protocol&&d.host?d.protocol+"//"+d.host:d.href;b&&b.put(a,d);a=d}return a};function U(a){a||(a={debug:!1,windowContext:window});this.j={};this.B={};this.A=a.debug;this.I=this.V=this.Z=!1;this.J=this.N=this.O=this.o=this.M=null;this.h=a.windowContext||window}h=U.prototype;
  h.listen=function(a){var b=this;return(new Promise(function(c,d){b.I?d(Error("Already connected.")):b.Z?d(Error("Already listening for connections.")):Array.isArray(a)?(b.O=b.ga.bind(b,a,c,d),b.h.addEventListener("message",b.O),b.A&&O().fine("amp-web-push","Listening for a connection message...")):d(Error("allowedOrigins should be a string array of allowed origins to accept messages from. Got:",a))})).then(function(){b.send(U.Topics.CONNECT_HANDSHAKE,null);b.I=!0})};
  h.ga=function(a,b,c,d){var e=d.data,g=d.origin,f=d.ports;this.A&&O().fine("amp-web-push","Window message for listen() connection received:",e);a:{var k=T(g).origin;for(var l=0;l<a.length;l++)if(T(a[l]).origin===k){k=!0;break a}k=!1}k?e&&e.topic===U.Topics.CONNECT_HANDSHAKE?(O().fine("amp-web-push","Received expected connection handshake message:",e),this.h.removeEventListener("message",this.O),this.o=f[0],this.J=this.S.bind(this),this.o.addEventListener("message",this.J,!1),this.o.start(),b()):O().fine("amp-web-push",
  "Discarding connection message because it did not contain our expected handshake:",e):O().fine("amp-web-push","Discarding connection message from "+g+" because it isn't an allowed origin:",e," (allowed  origins are)",a)};
  h.connect=function(a,b){var c=this;return new Promise(function(d,e){a||e(Error("Provide a valid Window context to connect to."));b||e(Error("Provide an expected origin for the remote Window or provide the wildcard *."));c.I?e(Error("Already connected.")):c.V?e(Error("Already connecting.")):(c.M=new MessageChannel,c.o=c.M.port1,c.N=c.fa.bind(c,c.o,b,d),c.o.addEventListener("message",c.N),c.o.start(),a.postMessage({topic:U.Topics.CONNECT_HANDSHAKE},"*"===b?"*":T(b).origin,[c.M.port2]),O().fine("amp-web-push",
  "Opening channel to "+b+"..."))})};h.fa=function(a,b,c){this.I=!0;this.A&&O().fine("amp-web-push","Messenger channel to "+b+" established.");a.removeEventListener("message",this.N);this.J=this.S.bind(this);a.addEventListener("message",this.J,!1);c()};
  h.S=function(a){a=a.data;if(this.j[a.id]&&a.isReply){var b=this.j[a.id];delete this.j[a.id];var c=b.promiseResolver;b.message=a.data;this.A&&O().fine("amp-web-push","Received reply for topic '%s': %s",a.topic,a.data);c([a.data,this.T.bind(this,a.id,b.topic)])}else{var d=this.B[a.topic];if(d){this.A&&O().fine("amp-web-push","Received new message for topic '"+(a.topic+"': "+a.data));for(var e=0;e<d.length;e++)(0,d[e])(a.data,this.T.bind(this,a.id,a.topic))}}};
  h.on=function(a,b){this.B[a]?this.B[a].push(b):this.B[a]=[b]};h.off=function(a,b){if(b){var c=this.B[a].indexOf(b);-1!==c&&this.B[a].splice(c,1)}else this.B[a]&&delete this.B[a]};h.T=function(a,b,c){var d=this,e={id:a,topic:b,data:c,isReply:!0};this.o.postMessage(e);return new Promise(function(g){d.j[e.id]={message:c,topic:b,promiseResolver:g}})};
  h.send=function(a,b){var c=this,d={id:crypto.getRandomValues(new Uint8Array(10)).join(""),topic:a,data:b};this.A&&O().fine("amp-web-push","Sending %s: %s",a,b);this.o.postMessage(d);return new Promise(function(e){c.j[d.id]={message:b,topic:a,promiseResolver:e}})};
  ca.Object.defineProperties(U,{Topics:{configurable:!0,enumerable:!0,get:function(){return{CONNECT_HANDSHAKE:"topic-connect-handshake",NOTIFICATION_PERMISSION_STATE:"topic-notification-permission-state",SERVICE_WORKER_STATE:"topic-service-worker-state",SERVICE_WORKER_REGISTRATION:"topic-service-worker-registration",SERVICE_WORKER_QUERY:"topic-service-worker-query",STORAGE_GET:"topic-storage-get"}}}});function sa(a){a=a.__AMP_TOP||(a.__AMP_TOP=a);return ta(a,"ampdoc")}function ua(a){var b=va(a);b=va(b);b=b.isSingleDoc()?b.win:b;return ta(b,"viewer")}function va(a){return a.nodeType?sa((a.ownerDocument||a).defaultView).getAmpDoc(a):a}function ta(a,b){var c=a.__AMP_SERVICES;c||(c=a.__AMP_SERVICES={});a=c[b];a.obj||(a.obj=new a.ctor(a.context),a.context=null,a.resolve&&a.resolve(a.obj));return a.obj};function wa(){var a=xa();return function(b){return setTimeout(b,a())}}function xa(){var a=0;return function(){var b=Math.pow(1.5,a++);var c=b*(c||.3)*Math.random();.5<Math.random()&&(c*=-1);b+=c;return 1E3*b}};var V,ya="Webkit webkit Moz moz ms O o".split(" ");var za=!1;function Aa(a){if(!za){za=!0;a=a.body;var b={opacity:1,visibility:"visible",animation:"none"},c;for(c in b){var d=a,e=b[c];var g=d.style;var f=c;if(f.startsWith("--"))g=f;else{V||(V=Object.create(null));var k=V[f];if(!k){k=f;if(void 0===g[f]){var l=f;l=l.charAt(0).toUpperCase()+l.slice(1);b:{for(var r=0;r<ya.length;r++){var t=ya[r]+l;if(void 0!==g[t]){l=t;break b}}l=""}void 0!==g[l]&&(k=l)}V[f]=k}g=k}g&&(g.startsWith("--")?d.style.setProperty(g,e):d.style[g]=e)}}};var W=self.__AMP_ERRORS||[];self.__AMP_ERRORS=W;function X(a){X=wa();return X(a)}function Ba(a){try{return JSON.stringify(a)}catch(b){return String(a)}}function Ca(a,b,c,d,e){var g=this;!this||!this.document||e&&e.expected||Aa(this.document);if(!z().development){var f=!1;try{f=Da()}catch(l){}if(!(f&&.01<Math.random())){var k=Ea(a,b,c,d,e,f);k&&X(function(){try{return Fa(g,k).catch(function(){})}catch(l){}})}}}
  function Fa(a,b){b.pt&&.9>Math.random()?(P||(P=Promise.resolve(void 0)),a=P):a=Ga(a,b).then(function(c){if(!c){var d=new XMLHttpRequest;d.open("POST",.1>Math.random()?E.betaErrorReporting:E.errorReporting,!0);d.send(JSON.stringify(b))}});return a}
  function Ga(a,b){a=sa(a);if(!a.isSingleDoc())return Promise.resolve(!1);var c=a.getSingleDoc();if(!c.getRootNode().documentElement.hasAttribute("report-errors-to-viewer"))return Promise.resolve(!1);var d=ua(c);return d.hasCapability("errorReporter")?d.isTrustedViewer().then(function(e){if(!e)return!1;d.sendMessage.call(d,"error",{m:b.m,a:b.a,s:b.s,el:b.el,ex:b.ex,v:b.v,pt:b.pt});return!0}):Promise.resolve(!1)}
  function Ea(a,b,c,d,e,g){var f=a;e&&(f=e.message?e.message:String(e));f||(f="Unknown error");a=f;var k=!(!e||!e.expected);if(!/_reported_/.test(a)&&"CANCELLED"!=a){var l=!(self&&self.window),r=Math.random();if(-1!=a.indexOf("Failed to load:")||"Script error."==a||l)if(k=!0,.001<r)return;var t=F(a);if(!(t&&.1<r)){f=Object.create(null);f.v=z().rtvVersion;f.noAmp=g?"1":"0";f.m=a.replace("\u200b\u200b\u200b","");f.a=t?"1":"0";f.ex=k?"1":"0";f.dw=l?"1":"0";var v="1p";self.context&&self.context.location?
  (f["3p"]="1",v="3p"):z().runtime&&(v=z().runtime);f.rt=v;"inabox"===v&&(f.adid=z().a4aId);var H;g=!(null==(H=self.AMP_CONFIG)||!H.canary);f.ca=g?"1":"0";var A;H=(null==(A=self.AMP_CONFIG)?void 0:A.type)||"unknown";f.bt=H;self.location.ancestorOrigins&&self.location.ancestorOrigins[0]&&(f.or=self.location.ancestorOrigins[0]);self.viewerState&&(f.vs=self.viewerState);self.parent&&self.parent!=self&&(f.iem="1");if(self.AMP&&self.AMP.viewer){var fa=self.AMP.viewer.getResolvedViewerUrl(),ha=self.AMP.viewer.maybeGetMessagingOrigin();
  fa&&(f.rvu=fa);ha&&(f.mso=ha)}var ia=[];A=self.__AMP__EXPERIMENT_TOGGLES||null;for(var ja in A)ia.push(ja+"="+(A[ja]?"1":"0"));f.exps=ia.join(",");if(e){var ka;f.el=(null==(ka=e.associatedElement)?void 0:ka.tagName)||"u";e.args&&(f.args=JSON.stringify(e.args));t||e.ignoreStack||!e.stack||(f.s=e.stack);e.message&&(e.message+=" _reported_")}else f.f=b||"",f.l=c||"",f.c=d||"";f.r=self.document?self.document.referrer:"";f.ae=W.join(",");f.fr=self.location.originalHash||self.location.hash;"production"===
  f.bt&&(f.pt="1");b=a;25<=W.length&&W.splice(0,W.length-25+1);W.push(b);return f}}}function Da(){var a=self;if(!a.document)return!1;a=a.document.querySelectorAll("script[src]");for(var b=0;b<a.length;b++){var c=a[b].src.toLowerCase();"string"==typeof c&&(c=T(c));if(!E.cdnProxyRegex.test(c.origin))return!0}return!1};(function(){M=G;O();N()})();
  (function(a){self.__AMP_REPORT_ERROR=a})(function(a,b){try{if(a)if(void 0!==a.message)a=q(a);else{var c=a;a=Error(Ba(c));a.origError=c}else a=Error("Unknown error");if(a.reported)return a;a.reported=!0;if(a.messageArray){var d,e=ea(a.messageArray,function(k){return null==(d=k)?void 0:d.tagName});-1<e&&(a.associatedElement=a.messageArray[e])}var g=b||a.associatedElement;g&&g.classList&&(g.classList.add("i-amphtml-error"),z().development&&(g.classList.add("i-amphtml-element-error"),g.setAttribute("error-message",
  a.message)));if(self.console&&(F(a.message)||!a.expected)){var f=console.error||console.log;a.messageArray?f.apply(console,a.messageArray):g?f.call(console,a.message,g):f.call(console,a.message)}g&&g.W&&g.W("amp:error",a.message);Ca.call(self,void 0,void 0,void 0,void 0,a)}catch(k){setTimeout(function(){throw k;})}return a});function Ha(){var a={debug:!1};this.A=a&&a.debug;this.h=a.windowContext||window;this.C=new U({debug:this.A,windowContext:this.h});this.L={}}
  function Y(a,b){a({success:!0,error:void 0,result:b})}h=Ha.prototype;h.$=function(a,b){if(a&&a.isQueryTopicSupported){var c=!1,d;for(d in U.Topics)a.isQueryTopicSupported===U.Topics[d]&&(c=!0);Y(b,c)}else Y(b,Notification.permission)};h.ea=function(a,b){var c=null;try{a&&a.key&&this.h.localStorage?c=this.h.localStorage.getItem(a.key):N().warn("amp-web-push","LocalStorage retrieval failed.")}catch(d){}Y(b,c)};
  h.da=function(a,b){Y(b,{isControllingFrame:!!this.h.navigator.serviceWorker.controller,url:this.h.navigator.serviceWorker.controller?this.h.navigator.serviceWorker.controller.scriptURL:null,state:this.h.navigator.serviceWorker.controller?this.h.navigator.serviceWorker.controller.state:null})};
  h.ba=function(a,b){if(!a||!a.workerUrl||!a.registrationOptions)throw Error("Expected arguments workerUrl and registrationOptions in message, got:",a);this.h.navigator.serviceWorker.register(a.workerUrl,a.registrationOptions).then(function(){Y(b,null)}).catch(function(c){Y(b,c?c.message||c.toString():null)})};h.messageServiceWorker=function(a){this.h.navigator.serviceWorker.controller.postMessage({command:a.topic,payload:a.payload})};
  h.aa=function(a,b){var c=this;if(!a||!a.topic)throw Error("Expected argument topic in message, got:",a);(new Promise(function(d){c.L[a.topic]=d;c.waitUntilWorkerControlsPage().then(function(){c.messageServiceWorker(a)})})).then(function(d){delete c.L[a.topic];return Y(b,d)})};function Ia(a){var b=x(a.h.location.search);if(!b.parentOrigin)throw Error("Expecting parentOrigin URL query parameter.");return b.parentOrigin}
  h.ha=function(a){a=a.data;var b=a.payload,c=this.L[a.command];"function"===typeof c&&c(b)};function Z(a){return a.h.navigator.serviceWorker&&a.h.navigator.serviceWorker.controller&&"activated"===a.h.navigator.serviceWorker.controller.state}
  h.waitUntilWorkerControlsPage=function(){var a=this;return new Promise(function(b){Z(a)?b():a.h.navigator.serviceWorker.addEventListener("controllerchange",function(){Z(a)?b():a.h.navigator.serviceWorker.controller.addEventListener("statechange",function(){Z(a)&&b()})})})};
  h.run=function(a){var b=this;this.C.on(U.Topics.NOTIFICATION_PERMISSION_STATE,this.$.bind(this));this.C.on(U.Topics.SERVICE_WORKER_STATE,this.da.bind(this));this.C.on(U.Topics.SERVICE_WORKER_REGISTRATION,this.ba.bind(this));this.C.on(U.Topics.SERVICE_WORKER_QUERY,this.aa.bind(this));this.C.on(U.Topics.STORAGE_GET,this.ea.bind(this));this.waitUntilWorkerControlsPage().then(function(){b.h.navigator.serviceWorker.addEventListener("message",b.ha.bind(b))});this.C.listen([a||Ia(this)])};
  window._ampWebPushHelperFrame=new Ha;window._ampWebPushHelperFrame.run();})();

  //# sourceMappingURL=amp-web-push-helper-frame.js.map
  </script>
  </head>
  <body>
  </body>
  </html>`;
}
function getPermissionDialogStr() {
  // https://cdn.ampproject.org/v0/amp-web-push-permission-dialog.html
  return `<!doctype html>
    <html>
    <!-- AMP Web Push Permission Dialog -->

    <head>
      <meta charset="utf-8">

      <!-- Do not edit styles in this section -->
      <style builtin>
        /* Do not edit styles in this section. Add custom styles in the next
          style section */
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        /* Default loading spinner */
        .spinner,
        .spinner:after {
          border-radius: 50%;
          width: 10em;
          height: 10em;
        }
        .spinner {
          margin: 60px auto;
          font-size: 10px;
          position: relative;
          text-indent: -9999em;
          border-top: 1.1em solid rgba(140, 140, 140, 0.2);
          border-right: 1.1em solid rgba(140, 140, 140, 0.2);
          border-bottom: 1.1em solid rgba(140, 140, 140, 0.2);
          border-left: 1.1em solid rgb(140, 140, 140);
          -webkit-transform: translateZ(0);
          -ms-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-animation: spinner 1.1s infinite linear;
          animation: spinner 1.1s infinite linear;
        }
        @-webkit-keyframes spinner {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }
        @keyframes spinner {
          0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
          }
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
          }
        }

        /* Horizontally and vertically center items */
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
        }

        /* Page message text styles */
        .message {
          font-size: 22px;
          font-family: sans-serif;
          text-align: center;
        }

        /* Close icon styles */
        #close {
          position: fixed;
          right: 32px;
          top: 32px;
          width: 32px;
          height: 32px;
          opacity: 0.5;
          cursor: pointer;
        }
        #close:before, #close:after {
          position: fixed;
          right: 48px;
          content: ' ';
          height: 33px;
          width: 3px;
          background-color: #333;
        }
        #close:before {
          transform: rotate(45deg);
        }
        #close:after {
          transform: rotate(-45deg);
        }

        /* Used to hide the preload and postload sections */
        .invisible {
          display: none;
        }
      </style>

      <!-- Optional: Add custom styles here -->
      <style custom>
        /* Add custom styles here */
      </style>
    </head>
    <body>
      <div id="preload">
        <!-- Anything in this section will be shown before the main script
              runs, and will be hidden after -->
        <div class="spinner"></div>
      </div>
      <div id="postload" class="invisible">
        <span id="close"></span>
        <div permission="default">
          <p class="message">
            <!--
            Customize the subscribing message here
                (e.g. "Click Allow to receive notifications")
            -->
            Click Allow to receive notifications.
          </p>
        </div>
        <div permission="denied">
          <!--
            Customize the unblocking message here
                (e.g. "Please unblock notifications in your browser settings
                        to receive notifications from this website.")
            -->
          <p class="message">
            Please unblock notifications in your browser settings to receive notifications from this website.
          </p>
        </div>
      </div>
      <script>(function(){'use strict';var f;function g(a){for(var b=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global],c=0;c<b.length;++c){var d=b[c];if(d&&d.Math==Math)return d}return function(){throw Error("Cannot find global object");}()}var k=g(this);function l(a,b){var c=b=void 0===b?"":b;try{return decodeURIComponent(a)}catch(d){return c}};var m=/(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;var n=self.AMP_CONFIG||{},q=("string"==typeof n.cdnProxyRegex?new RegExp(n.cdnProxyRegex):n.cdnProxyRegex)||/^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;function r(a){if(self.document&&self.document.head&&(!self.location||!q.test(self.location.origin))){var b=self.document.head.querySelector('meta[name="'+a+'"]');b&&b.getAttribute("content")}}n.cdnUrl||r("runtime-host");n.geoApiUrl||r("amp-geo-api");self.__AMP_LOG=self.__AMP_LOG||{user:null,dev:null,userForEmbed:null};var t=self.__AMP_LOG;function v(){if(t.dev)return t.dev;throw Error("failed to call initLogConstructor");};/*
    https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
    var w=/(\0)|^(-)$|([\x01-\x1f\x7f]|^-?[0-9])|([\x80-\uffff0-9a-zA-Z_-]+)|[^]/g;function x(a,b,c,d,e){return e?e:b?"\ufffd":d?a.slice(0,-1)+"\\"+a.slice(-1).charCodeAt(0).toString(16)+" ":"\\"+a};function y(){this.O=100;this.G=this.K=0;this.C=Object.create(null)}y.prototype.has=function(a){return!!this.C[a]};y.prototype.get=function(a){var b=this.C[a];if(b)return b.access=++this.G,b.payload};y.prototype.put=function(a,b){this.has(a)||this.K++;this.C[a]={payload:b,access:this.G};if(!(this.K<=this.O)){a=this.C;var c=this.G+1,d;for(d in a){var e=a[d].access;if(e<c){c=e;var h=d}}void 0!==h&&(delete a[h],this.K--)}};(function(a){return a||{}})({c:!0,v:!0,a:!0,ad:!0});var z,A;
    function B(a){z||(z=self.document.createElement("a"),A=self.__AMP_URL_CACHE||(self.__AMP_URL_CACHE=new y));var b=A,c=z;if(b&&b.has(a))a=b.get(a);else{c.href=a;c.protocol||(c.href=c.href);var d={href:c.href,protocol:c.protocol,host:c.host,hostname:c.hostname,port:"0"==c.port?"":c.port,pathname:c.pathname,search:c.search,hash:c.hash,origin:null};"/"!==d.pathname[0]&&(d.pathname="/"+d.pathname);if("http:"==d.protocol&&80==d.port||"https:"==d.protocol&&443==d.port)d.port="",d.host=d.hostname;d.origin=
    c.origin&&"null"!=c.origin?c.origin:"data:"!=d.protocol&&d.host?d.protocol+"//"+d.host:d.href;b&&b.put(a,d);a=d}return a};function C(a){a||(a={debug:!1,windowContext:window});this.B={};this.A={};this.o=a.debug;this.D=this.P=this.R=!1;this.F=this.I=this.J=this.j=this.H=null;this.h=a.windowContext||window}f=C.prototype;
    f.listen=function(a){var b=this;return(new Promise(function(c,d){b.D?d(Error("Already connected.")):b.R?d(Error("Already listening for connections.")):Array.isArray(a)?(b.J=b.T.bind(b,a,c,d),b.h.addEventListener("message",b.J),b.o&&v().fine("amp-web-push","Listening for a connection message...")):d(Error("allowedOrigins should be a string array of allowed origins to accept messages from. Got:",a))})).then(function(){b.send(C.Topics.CONNECT_HANDSHAKE,null);b.D=!0})};
    f.T=function(a,b,c,d){var e=d.data,h=d.origin,H=d.ports;this.o&&v().fine("amp-web-push","Window message for listen() connection received:",e);a:{var p=B(h).origin;for(var u=0;u<a.length;u++)if(B(a[u]).origin===p){p=!0;break a}p=!1}p?e&&e.topic===C.Topics.CONNECT_HANDSHAKE?(v().fine("amp-web-push","Received expected connection handshake message:",e),this.h.removeEventListener("message",this.J),this.j=H[0],this.F=this.M.bind(this),this.j.addEventListener("message",this.F,!1),this.j.start(),b()):v().fine("amp-web-push",
    "Discarding connection message because it did not contain our expected handshake:",e):v().fine("amp-web-push","Discarding connection message from "+h+" because it isn't an allowed origin:",e," (allowed  origins are)",a)};
    f.connect=function(a,b){var c=this;return new Promise(function(d,e){a||e(Error("Provide a valid Window context to connect to."));b||e(Error("Provide an expected origin for the remote Window or provide the wildcard *."));c.D?e(Error("Already connected.")):c.P?e(Error("Already connecting.")):(c.H=new MessageChannel,c.j=c.H.port1,c.I=c.S.bind(c,c.j,b,d),c.j.addEventListener("message",c.I),c.j.start(),a.postMessage({topic:C.Topics.CONNECT_HANDSHAKE},"*"===b?"*":B(b).origin,[c.H.port2]),v().fine("amp-web-push",
    "Opening channel to "+b+"..."))})};f.S=function(a,b,c){this.D=!0;this.o&&v().fine("amp-web-push","Messenger channel to "+b+" established.");a.removeEventListener("message",this.I);this.F=this.M.bind(this);a.addEventListener("message",this.F,!1);c()};
    f.M=function(a){a=a.data;if(this.B[a.id]&&a.isReply){var b=this.B[a.id];delete this.B[a.id];var c=b.promiseResolver;b.message=a.data;this.o&&v().fine("amp-web-push","Received reply for topic '%s': %s",a.topic,a.data);c([a.data,this.N.bind(this,a.id,b.topic)])}else{var d=this.A[a.topic];if(d){this.o&&v().fine("amp-web-push","Received new message for topic '"+(a.topic+"': "+a.data));for(var e=0;e<d.length;e++)(0,d[e])(a.data,this.N.bind(this,a.id,a.topic))}}};
    f.on=function(a,b){this.A[a]?this.A[a].push(b):this.A[a]=[b]};f.off=function(a,b){if(b){var c=this.A[a].indexOf(b);-1!==c&&this.A[a].splice(c,1)}else this.A[a]&&delete this.A[a]};f.N=function(a,b,c){var d=this,e={id:a,topic:b,data:c,isReply:!0};this.j.postMessage(e);return new Promise(function(h){d.B[e.id]={message:c,topic:b,promiseResolver:h}})};
    f.send=function(a,b){var c=this,d={id:crypto.getRandomValues(new Uint8Array(10)).join(""),topic:a,data:b};this.o&&v().fine("amp-web-push","Sending %s: %s",a,b);this.j.postMessage(d);return new Promise(function(e){c.B[d.id]={message:b,topic:a,promiseResolver:e}})};
    k.Object.defineProperties(C,{Topics:{configurable:!0,enumerable:!0,get:function(){return{CONNECT_HANDSHAKE:"topic-connect-handshake",NOTIFICATION_PERMISSION_STATE:"topic-notification-permission-state",SERVICE_WORKER_STATE:"topic-service-worker-state",SERVICE_WORKER_REGISTRATION:"topic-service-worker-registration",SERVICE_WORKER_QUERY:"topic-service-worker-query",STORAGE_GET:"topic-storage-get"}}}});function D(){var a={debug:!1};this.o=a&&a.debug;this.h=a.windowContext||window;this.L=new C({debug:this.o,windowContext:this.h})}f=D.prototype;f.isCurrentDialogPopup=function(){return!!this.h.opener&&this.h.opener!==this.h};f.requestNotificationPermission=function(){var a=this;return new Promise(function(b,c){try{a.h.Notification.requestPermission(function(d){return b(d)})}catch(d){c(d)}})};
    f.run=function(){E(this);F(this);for(var a=this.h.document.querySelectorAll("[permission]"),b=0;b<a.length;b++)G(a[b],!1);(a=this.h.document.querySelector("[permission="+String(this.h.Notification.permission).replace(w,x)+"]"))&&G(a,!0);a=this.h.document.querySelector("#preload");b=this.h.document.querySelector("#postload");a&&b&&(G(a,!1),G(b,!0));"denied"!==this.h.Notification.permission?I(this):J(this)};
    function E(a){var b=a.h.document.querySelector("#close");b&&b.addEventListener("click",function(){a.closeDialog()})}f.closeDialog=function(){if(this.isCurrentDialogPopup())this.h.close();else{var a=(this.h.fakeLocation||this.h.location).search,b=Object.create(null);if(a)for(var c;c=m.exec(a);){var d=l(c[1],c[1]);c=c[2]?l(c[2].replace(/\+/g," "),c[2]):"";b[d]=c}if(!b["return"])throw Error("Missing required parameter.");a=l(b["return"],void 0);this.redirectToUrl(a)}};
    function J(a){navigator.permissions.query({name:"notifications"}).then(function(b){b.onchange=function(){F(a);switch(a.h.Notification.permission){case "default":case "granted":I(a)}}})}function F(a){a.h.localStorage.setItem("amp-web-push-notification-permission",a.h.Notification.permission)}function G(a,b){a&&(b?a.classList.remove("invisible"):a.classList.add("invisible"))}
    function I(a){a.requestNotificationPermission().then(function(b){F(a);if(a.isCurrentDialogPopup())return a.L.connect(opener,"*"),a.L.send(C.Topics.NOTIFICATION_PERMISSION_STATE,b).then(function(c){(c=c[0])&&c.closeFrame&&a.closeDialog()});a.closeDialog()})}f.redirectToUrl=function(a){var b=B(a);!b||"http:"!==b.protocol&&"https:"!==b.protocol||(this.h.location.href=a)};window._ampWebPushPermissionDialog=new D;window._ampWebPushPermissionDialog.run();})();

    //# sourceMappingURL=amp-web-push-permission-dialog.js.map
    </script>
    </body>
    </html>`;
}

async function webengageHelperIframeHandler(req, res) {
  return res
    .set({
      "Content-Type": "text/html",
      "Cache-Control": "public,max-age=31104000,s-maxage=31104000",
    })
    .status(200)
    .send(getHelperIframeHtmlStr());
}
async function webengagePermissionDialogHandler(req, res) {
  return res
    .set({
      "Content-Type": "text/html",
      "Cache-Control": "public,max-age=31104000,s-maxage=31104000",
    })
    .status(200)
    .send(getPermissionDialogStr());
}

module.exports = {
  webengageHelperIframeHandler,
  webengagePermissionDialogHandler,
};
