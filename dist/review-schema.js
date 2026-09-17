export function validateReview(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['name','comment','rating','consent','submissionId'].includes(k)))throw new Error('Please check your review.');
 const name=typeof value.name==='string'?value.name.trim():'';
 const comment=typeof value.comment==='string'?value.comment.trim():'';
 if(name.length>40)throw new Error('Use a display name of 40 characters or fewer.');
 if(comment.length<10||comment.length>2000)throw new Error('Write a comment between 10 and 2,000 characters.');
 if(value.rating!==null&&(!Number.isInteger(value.rating)||value.rating<1||value.rating>5))throw new Error('Choose a rating from 1 to 5, or skip it.');
 if(value.consent!==true)throw new Error('Please confirm you want to submit your review for publication.');
 if(typeof value.submissionId!=='string'||!/^[-a-zA-Z0-9]{16,80}$/.test(value.submissionId))throw new Error('Refresh the page and try again.');
 return {name:name||'Anonymous',comment,rating:value.rating,submissionId:value.submissionId};
}
