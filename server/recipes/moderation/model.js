import {createHash} from 'node:crypto';
import {validateRecipe,safeUrl} from '../model.js';
export const recipeOrigins=['ezeats-owned','licensed-provider','user-submitted'];
export const revisionStatuses=['draft','pending','changes-requested','approved','rejected','published'];
export const evidenceStatuses=['claimed','verified','unknown'];
export function plainText(value,max=2000){
 if(typeof value!=='string'||value.length>max||/[<>\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value))throw new Error('Plain text required');
 return value.normalize('NFC').trim();
}
function nullableText(value,max=2000){return value==null?null:plainText(value,max);}
function evidence(value={}){
 const status=value.status||'unknown';if(!evidenceStatuses.includes(status))throw new Error('Invalid evidence status');
 const verifiedBy=nullableText(value.verifiedBy,200),verifiedAt=nullableText(value.verifiedAt,40),basis=nullableText(value.basis);
 if(status==='verified'&&(!verifiedBy||!verifiedAt||!basis))throw new Error('Verification requires reviewer, date and evidence');
 return {status,claim:nullableText(value.claim),basis,verifiedBy:status==='verified'?verifiedBy:null,verifiedAt:status==='verified'?verifiedAt:null};
}
export function normalizeRevisionInput(input){
 if(!input||typeof input!=='object')throw new Error('Revision required');
 const payload=structuredClone(validateRecipe(input.payload));
 // Reject markup rather than interpreting or rendering it; no rich HTML accepted.
 function check(value){if(typeof value==='string')plainText(value,15000);else if(Array.isArray(value))value.forEach(check);else if(value&&typeof value==='object')Object.values(value).forEach(check);}
 check(payload);
 const attribution=plainText(input.publicAttribution||'',2000);if(!attribution)throw new Error('Public attribution required');
 const originalAuthor={name:nullableText(input.originalAuthor?.name,200),sourceUrl:safeUrl(input.originalAuthor?.sourceUrl)};
 const a=input.copyrightAttestation||{};
 if(!['unknown','original-work','permission','licensed'].includes(a.basis||'unknown'))throw new Error('Invalid copyright basis');
 const copyrightAttestation={confirmed:a.confirmed===true,basis:a.basis||'unknown',statement:nullableText(a.statement),attestedBy:nullableText(a.attestedBy,200),attestedAt:nullableText(a.attestedAt,40),licenseReference:nullableText(a.licenseReference),storagePermitted:a.storagePermitted===true};
 const image=input.imageRights||{};
 if(!['unknown','author-owned','licensed','none'].includes(image.ownership||'unknown'))throw new Error('Invalid image ownership');
 if(!['unknown','permission-confirmed','not-permitted','not-applicable'].includes(image.licenseStatus||'unknown'))throw new Error('Invalid image license');
 const imageRights={ownership:image.ownership||'unknown',licenseStatus:image.licenseStatus||'unknown',owner:nullableText(image.owner,200),licenseReference:nullableText(image.licenseReference),attribution:nullableText(image.attribution)};
 const suitability={diet:evidence(input.suitability?.diet),allergens:evidence(input.suitability?.allergens),foodSafety:evidence(input.suitability?.foodSafety)};
 return {payload,originalAuthor,publicAttribution:attribution,copyrightAttestation,imageRights,suitability,contentFingerprint:createHash('sha256').update(JSON.stringify([payload.title.toLowerCase(),payload.ingredients,payload.instructions])).digest('hex')};
}
export function requirePublicationRights(revision,origin){
 const a=revision.copyrightAttestation;
 if(!a.confirmed||a.basis==='unknown'||!a.attestedBy||!a.attestedAt||!a.statement)throw new Error('Copyright confirmation required');
 if(origin==='licensed-provider'&&(!a.storagePermitted||!a.licenseReference))throw new Error('Provider storage permission required');
 if(revision.payload.imageUrl&&(revision.imageRights.licenseStatus!=='permission-confirmed'||!revision.imageRights.owner||!revision.imageRights.licenseReference))throw new Error('Image rights required');
}
