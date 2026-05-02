const crypto = require('crypto');

function translateClerkIdToUUID(id) {
  if (!id) return null;
  if (id.includes('-') && id.length >= 32) return id;
  const hash = crypto.createHash('sha256').update(id).digest('hex');
  const v_h = hash;
  const v_uuid_str = 
      v_h.substring(0, 8) + '-' + 
      v_h.substring(8, 12) + '-' + 
      '4' + v_h.substring(13, 16) + '-' + 
      '8' + v_h.substring(17, 20) + '-' + 
      v_h.substring(20, 32);
  return v_uuid_str;
}

const clerkId = 'user_3CyueymOUFein248UifL5xSPBOU';
console.log('Clerk ID:', clerkId);
console.log('Translated UUID:', translateClerkIdToUUID(clerkId));
