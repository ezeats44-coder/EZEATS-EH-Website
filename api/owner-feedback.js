import {createFeedbackHandler} from './feedback.js';
import {observeEndpoint} from '../server/diagnostics.js';
export default observeEndpoint('owner-feedback',createFeedbackHandler({owner:true}));
