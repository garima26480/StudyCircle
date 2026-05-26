const PROFILE_STORAGE_KEY = "studycircle.profileOverrides";

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const sanitizeUpperAlphaNumeric = (value = "") => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

const getProfileStore = () => {
  if (typeof window === "undefined") {
    return {};
  }

  return parseJson(window.localStorage.getItem(PROFILE_STORAGE_KEY), {});
};

const setProfileStore = (store) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(store));
};

const getStoreKey = (email = "") => {
  return email.trim().toLowerCase();
};

const parseLanguages = (languages) => {
  if (Array.isArray(languages)) {
    return languages.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof languages !== "string") {
    return [];
  }

  return languages
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatSemYear = (user) => {
  if (!user) {
    return "";
  }

  if (user.role === "teacher") {
    return user.year || "Faculty";
  }

  const parts = [];

  if (user.semester) {
    parts.push(`Semester ${user.semester}`);
  }

  if (user.year) {
    parts.push(`Year ${user.year}`);
  }

  return parts.join(" | ") || user.year || "";
};

export const getGhostId = (user) => {
  const userId = typeof user?.id === "string" ? user.id : user?._id;
  const seeds = [
    sanitizeUpperAlphaNumeric(user?.collegeId),
    sanitizeUpperAlphaNumeric(`SC${String(userId || "").slice(-8)}`),
    sanitizeUpperAlphaNumeric(user?.email?.split("@")[0]),
  ].filter(Boolean);

  return seeds[0] || "SCUSER";
};

export const mergeUserProfile = (user) => {
  if (!user) {
    return null;
  }

  const store = getProfileStore();
  const overrides = store[getStoreKey(user.email)] || {};
  const department = overrides.department || user.department || user.course || "";
  const year = overrides.year || user.year || "";
  const semester = overrides.semester || user.semester || (user.role === "teacher" ? "Faculty" : "");
  const languages = parseLanguages(overrides.languages || user.languages);

  const mergedUser = {
    ...user,
    name: overrides.name || user.name || "",
    department,
    course: department || user.course || "",
    year,
    semester,
    semYear: formatSemYear({ ...user, ...overrides, year, semester }),
    collegeId: overrides.collegeId || user.collegeId || "",
    profilePicture: overrides.profilePicture || user.profilePicture || "",
    instaId: overrides.instaId || user.instaId || "",
    languages,
    subjects: overrides.subjects || user.subjects || "",
    ghostMode: typeof overrides.ghostMode === "boolean" ? overrides.ghostMode : Boolean(user.ghostMode),
  };

  const ghostId = getGhostId(mergedUser);

  return {
    ...mergedUser,
    ghostId,
    displayName: mergedUser.ghostMode ? ghostId : mergedUser.name,
  };
};

export const saveProfileOverrides = (email, updates) => {
  const key = getStoreKey(email);

  if (!key) {
    return null;
  }

  const store = getProfileStore();
  const nextStore = {
    ...store,
    [key]: {
      ...(store[key] || {}),
      ...updates,
    },
  };

  setProfileStore(nextStore);

  return nextStore[key];
};

export const saveProfileForUser = (user, updates) => {
  if (!user?.email) {
    return user;
  }

  saveProfileOverrides(user.email, updates);

  return mergeUserProfile({
    ...user,
    ...updates,
  });
};

export const sanitizeStudentId = (value) => {
  return sanitizeUpperAlphaNumeric(value);
};

export const createTeacherCollegeId = ({ email, name }) => {
  const seed = sanitizeUpperAlphaNumeric(`${name}${email.split("@")[0]}`).slice(0, 6) || "TEACHR";
  const randomBlock = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${seed}${randomBlock}`.slice(0, 12);
};

export const buildRegisterPayload = (role, formData) => {
  if (role === "teacher") {
    return {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: "teacher",
      collegeId: createTeacherCollegeId({
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
      }),
      course: formData.department.trim(),
      year: "Faculty",
    };
  }

  return {
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    role: "student",
    collegeId: sanitizeStudentId(formData.studentId),
    course: formData.department.trim(),
    year: formData.year.trim(),
  };
};

export const buildProfileOverridesFromRegister = (role, formData, payload) => {
  if (role === "teacher") {
    return {
      department: formData.department.trim(),
      year: "Faculty",
      semester: "Faculty",
      subjects: formData.subjects.trim(),
      collegeId: payload.collegeId,
      instaId: "",
      languages: [],
      profilePicture: "",
      ghostMode: false,
    };
  }

  return {
    department: formData.department.trim(),
    year: formData.year.trim(),
    semester: formData.semester.trim(),
    collegeId: payload.collegeId,
    instaId: "",
    languages: [],
    profilePicture: "",
    ghostMode: false,
  };
};

export const getProfileFormState = (user) => {
  return {
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || "",
    department: user?.department || user?.course || "",
    year: user?.year || "",
    semester: user?.role === "teacher" ? "Faculty" : user?.semester || "",
    subjects: user?.subjects || "",
    instaId: user?.instaId || "",
    languages: Array.isArray(user?.languages) ? user.languages.join(", ") : "",
    ghostMode: Boolean(user?.ghostMode),
  };
};

export const buildProfileUpdates = (user, formData) => {
  return {
    name: formData.name.trim(),
    profilePicture: formData.profilePicture.trim(),
    department: formData.department.trim(),
    year: user?.role === "teacher" ? formData.year || "Faculty" : formData.year.trim(),
    semester: user?.role === "teacher" ? "Faculty" : formData.semester.trim(),
    subjects: user?.role === "teacher" ? formData.subjects.trim() : "",
    instaId: formData.instaId.trim(),
    languages: parseLanguages(formData.languages),
    ghostMode: Boolean(formData.ghostMode),
  };
};
