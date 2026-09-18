import {recipeOrigins,normalizeRevisionInput,requirePublicationRights,plainText} from './model.js';
// Pure state transitions only: no network, database, uploads or public collection.
const actorId=actor=>{if(!actor?.authorized||!actor.userId)throw new Error('Authorized administrator required');return actor.userId;};
const timestamp=now=>new Date(now??Date.now()).toISOString();
function event(state,version,action,actor,at,notes=null){state.history.push({version,action,actorAccountId:actorId(actor),at,privateNotes:notes});state.updatedAt=at;state.lockVersion++;}
export function createRecipeRecord({origin,provider=null,submittingAccountId=null,input},actor,now){
 actorId(actor);if(!recipeOrigins.includes(origin))throw new Error('Invalid origin');
 const revision=normalizeRevisionInput(input);if(origin==='licensed-provider'&&!revision.copyrightAttestation.storagePermitted)throw new Error('No provider storage permission');
 const at=timestamp(now),id=revision.payload.id;
 const state={id,origin,provider,submittingAccountId,createdAt:at,updatedAt:at,publishedVersion:null,removedAt:null,removedBy:null,lockVersion:0,revisions:[{...revision,version:1,parentVersion:null,status:'draft',submittingAccountId,createdAt:at,updatedAt:at,submittedAt:null,reviewedAt:null,approvedAt:null,publishedAt:null,reviewingAdministrator:null}],history:[],reports:[]};
 event(state,1,'created',actor,at);return state;
}
export function reviseRecipe(record,input,actor,expectedLock,now){
 actorId(actor);if(record.lockVersion!==expectedLock)throw new Error('Revision conflict');if(record.removedAt)throw new Error('Recipe removed');
 const state=structuredClone(record),revision=normalizeRevisionInput(input),previous=state.revisions.at(-1),at=timestamp(now);
 if(revision.payload.id!==state.id)throw new Error('Identity cannot change');
 if(state.origin==='licensed-provider'&&!revision.copyrightAttestation.storagePermitted)throw new Error('No provider storage permission');
 state.revisions.push({...revision,version:previous.version+1,parentVersion:previous.version,status:'pending',submittingAccountId:state.submittingAccountId,createdAt:at,updatedAt:at,submittedAt:at,reviewedAt:null,approvedAt:null,publishedAt:null,reviewingAdministrator:null});
 event(state,previous.version+1,'revision-submitted',actor,at);return state;
}
export function moderateRecipe(record,{version,action,notes,expectedLock},actor,now){
 actorId(actor);if(record.lockVersion!==expectedLock)throw new Error('Revision conflict');
 const state=structuredClone(record),revision=state.revisions.find(r=>r.version===version),at=timestamp(now);
 if(!revision)throw new Error('Unknown revision');
 const note=notes==null?null:plainText(notes,4000);
 if(action==='remove'){state.removedAt=at;state.removedBy=actor.userId;state.publishedVersion=null;event(state,version,action,actor,at,note);return state;}
 if(state.removedAt)throw new Error('Recipe removed');
 if(version!==state.revisions.at(-1).version)throw new Error('Superseded revision');
 const transitions={submit:['draft'],approve:['pending'],publish:['approved'], 'approve-and-publish':['pending'],'request-changes':['pending'],'reject':['draft','pending','changes-requested','approved']};
 if(!transitions[action]?.includes(revision.status))throw new Error('Invalid moderation transition');
 if(['request-changes','reject'].includes(action)&&!note)throw new Error('Private reason required');
 if(['approve','publish','approve-and-publish'].includes(action))requirePublicationRights(revision,state.origin);
 if(action==='submit'){revision.status='pending';revision.submittedAt=at;}
 else {revision.reviewedAt=at;revision.reviewingAdministrator=actor.userId;
  revision.status=({'approve':'approved','publish':'published','approve-and-publish':'published','request-changes':'changes-requested','reject':'rejected'})[action];
  if(['approve','approve-and-publish'].includes(action))revision.approvedAt=at;
  if(revision.status==='published'){revision.publishedAt=at;state.publishedVersion=version;}
 }
 revision.updatedAt=at;event(state,version,action,actor,at,note);return state;
}
export function publishedRecipe(record){
 if(record.removedAt||!record.publishedVersion)return null;
 const r=record.revisions.find(r=>r.version===record.publishedVersion);if(!r||r.status!=='published')return null;
 // Explicit projection: never expose author account IDs, notes, attestations or reports.
 const recipe=structuredClone(r.payload);recipe.source.attribution=r.publicAttribution;
 // Moderation approval is not ingredient/allergen verification.
 recipe.suitability={...recipe.suitability,status:'unverified',allergensComplete:false,ingredientsComplete:false,dietEvidence:false};
 return {recipe,version:r.version,author:{name:r.originalAuthor.name},origin:record.origin,publicAttribution:r.publicAttribution,publishedAt:r.publishedAt};
}
export function compareRevisions(record,version){
 const pending=record.revisions.find(r=>r.version===version);if(!pending)throw new Error('Unknown revision');
 const published=record.revisions.find(r=>r.version===record.publishedVersion)||null;
 return structuredClone({published,pending,changedFields:Object.keys(pending).filter(k=>JSON.stringify(pending[k])!==JSON.stringify(published?.[k]))});
}
