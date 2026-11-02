/**
 * Validator skema profile.json
 */
function validateProfileSchema(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Payload data harus berupa object JSON.'] };
  }

  // 1. General Validation
  if (!data.general || typeof data.general !== 'object') {
    errors.push('Section "general" wajib ada dan bertipe object.');
  } else {
    if (!data.general.name || typeof data.general.name !== 'string') {
      errors.push('Field "general.name" wajib diisi string.');
    }
    if (!data.general.title || typeof data.general.title !== 'string') {
      errors.push('Field "general.title" wajib diisi string.');
    }
    if (!data.general.email || typeof data.general.email !== 'string') {
      errors.push('Field "general.email" wajib diisi format string.');
    }
  }

  // 2. Socials Validation
  if (!Array.isArray(data.socials)) {
    errors.push('Section "socials" wajib berupa array.');
  }

  // 3. About Validation
  if (!data.about || typeof data.about !== 'object') {
    errors.push('Section "about" wajib ada dan bertipe object.');
  } else {
    if (!Array.isArray(data.about.skills)) {
      errors.push('Field "about.skills" wajib berupa array.');
    }
  }

  // 4. Experience Validation
  if (!Array.isArray(data.experience)) {
    errors.push('Section "experience" wajib berupa array.');
  }

  // 5. Projects Validation
  if (!Array.isArray(data.projects)) {
    errors.push('Section "projects" wajib berupa array.');
  }

  // 6. Services Validation
  if (!Array.isArray(data.services)) {
    errors.push('Section "services" wajib berupa array.');
  }

  // 7. Education Validation (if present, must be array)
  if (data.education && !Array.isArray(data.education)) {
    errors.push('Section "education" harus berupa array jika disertakan.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateProfileSchema
};
