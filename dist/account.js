import {accountReady} from './account-client.js';
const status=document.querySelector('#account-status');
try {
 const clerk=await accountReady();
 if(clerk.user)location.replace('/settings/');
 else {
  status.hidden=true;
  const gate=document.createElement('form');
  gate.innerHTML='<h2>Accounts are for ages 14+</h2><p class="field-help">Please confirm your eligibility before signing in or creating an account. We do not need your date of birth.</p><label class="field-help"><input type="checkbox" required> I am 14 years old or older.</label><div class="settings-actions"><button class="primary" type="submit">Continue to sign-in</button><a class="text-button" href="/">Continue as guest</a></div>';
  const target=document.querySelector('#auth-widget');
  target.before(gate);
  gate.addEventListener('submit',event=>{
   event.preventDefault();
   if(!gate.reportValidity())return;
   const options={routing:'hash',forceRedirectUrl:'/settings/?welcome=1',signInUrl:'/account/',signUpUrl:'/account/?create=1'};
   gate.remove();
   if(new URLSearchParams(location.search).has('create'))clerk.mountSignUp(target,options);else clerk.mountSignIn(target,options);
  });
 }
} catch(error) {status.textContent=error.message;document.querySelector('#retry-account').hidden=false;}
