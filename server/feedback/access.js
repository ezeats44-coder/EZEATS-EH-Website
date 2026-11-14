// Fail closed: enabling Feedback alone never opens it to every account.
export function feedbackAccess(identity,env=process.env){
 if(!identity?.userId||env.FEEDBACK_ENABLED!=='true')return false;
 if(env.FEEDBACK_ACCESS_MODE==='signed-in')return true;
 if(env.FEEDBACK_ACCESS_MODE!==undefined&&env.FEEDBACK_ACCESS_MODE!=='test')return false;
 const accounts=(env.FEEDBACK_TEST_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);
 return identity.owner===true||accounts.includes(identity.userId);
}
