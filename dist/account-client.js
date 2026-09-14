let ready;
function script(src,key) {
 return new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';
  if(key)s.dataset.clerkPublishableKey=key;
  const timeout=setTimeout(()=>reject(new Error('Sign-in took too long to load. Please retry.')),15000);
  s.onload=()=>{clearTimeout(timeout);resolve();};s.onerror=()=>{clearTimeout(timeout);reject(new Error('Sign-in is unavailable. Please retry or continue as a guest.'));};document.head.append(s);
 });
}
export function accountReady() {
 return ready ||= (async()=>{
  const r=await fetch('/api/config',{cache:'no-store'});if(!r.ok)throw new Error('Sign-in is unavailable. You can still use the meal picker as a guest.');
  const {publishableKey}=await r.json();
  if(!/^pk_(test|live)_/.test(publishableKey))throw new Error('Sign-in configuration is unavailable.');
  const domain=atob(publishableKey.split('_')[2]).replace(/\$$/,'');
  if(!/^[a-z0-9.-]+$/.test(domain))throw new Error('Invalid sign-in configuration.');
  await script(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
  await script(`https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,publishableKey);
  await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor},localization:{signIn:{start:{title:'Sign in to EZEATS EH'}},signUp:{start:{title:'Create your EZEATS EH account'}}},signInUrl:'/account/',signUpUrl:'/account/?create=1',signInForceRedirectUrl:'/settings/?welcome=1',signUpForceRedirectUrl:'/settings/?welcome=1',afterSignOutUrl:'/',appearance:{variables:{colorPrimary:'#e94926',fontFamily:'DM Sans, sans-serif',borderRadius:'12px'}}});
  return window.Clerk;
 })();
}
export async function profileRequest(method='GET',body) {
 const clerk=await accountReady();const token=await clerk.session?.getToken();
 if(!token)throw new Error('Please sign in to save your preferences.');
 const response=await fetch('/api/profile',{method,headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store'});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'Please try again.');return data;
}
