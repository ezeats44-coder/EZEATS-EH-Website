// Basic public-page statistics only. Never load on previews or private tools.
export function publicAnalyticsUrl(value) {
 try {
  const url=new URL(value);
  if(!['www.ezeats-eh.com','ezeats-eh.com','ezeats.vercel.app'].includes(url.hostname)||url.protocol!=='https:')return null;
  if(/^\/recipes\/contribute(?:\/|$)/.test(url.pathname))return null;
  if(!/^\/(?:index\.html)?$|^\/(?:about|reviews|privacy|recipe)(?:\/(?:index\.html)?)?$|^\/recipes\/[a-z0-9-]+(?:\/(?:index\.html)?)?$/.test(url.pathname))return null;
  url.search='';url.hash='';return url.toString();
 } catch {return null;}
}
export function publicPageEvent(event) {
 if(event.type!=='pageview')return null;
 const url=publicAnalyticsUrl(event.url);
 return url?{...event,url}:null;
}
if(typeof window!=='undefined'&&publicAnalyticsUrl(window.location.href)&&navigator.doNotTrack!=='1'&&!navigator.globalPrivacyControl){
 window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
 window.va('beforeSend',publicPageEvent);
 const script=document.createElement('script');
 script.defer=true;script.src='/_vercel/insights/script.js';
 document.head.append(script);
}
