import {accountReady} from './account-client.js';
const status=document.querySelector('#account-status');
try {
 const clerk=await accountReady();
 if(clerk.user)location.replace('/settings/');
 else {
  status.hidden=true;
  const target=document.querySelector('#auth-widget');
  const options={routing:'hash',forceRedirectUrl:'/settings/?welcome=1',signInUrl:'/account/',signUpUrl:'/account/?create=1'};
  if(new URLSearchParams(location.search).has('create'))clerk.mountSignUp(target,options);else clerk.mountSignIn(target,options);
 }
} catch(error) {status.textContent=error.message;document.querySelector('#retry-account').hidden=false;}
