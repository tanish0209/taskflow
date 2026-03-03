export const PLAN_LIMITS = {
  free: {
    maxOrgs: 1,              // personal only
    maxCompaniesPerOrg: 1,
    maxProjectsPerCompany: 3,
    maxMembersPerOrg: 5,
    maxTasksPerProject: 50,
    maxStorageMB: 100,
    allowProfessionalOrg: false,
    allowMeetings: false,
    allowVoice: false,
    allowAI: false,
  },
  pro: {
    maxOrgs: 2,              // personal + 1 professional
    maxCompaniesPerOrg: 5,
    maxProjectsPerCompany: 20,
    maxMembersPerOrg: 50,
    maxTasksPerProject: 500,
    maxStorageMB: 5120,
    allowProfessionalOrg: true,
    allowMeetings: true,
    allowVoice: false,
    allowAI: true,
  },
  enterprise: {
    maxOrgs: Infinity,
    maxCompaniesPerOrg: Infinity,
    maxProjectsPerCompany: Infinity,
    maxMembersPerOrg: Infinity,
    maxTasksPerProject: Infinity,
    maxStorageMB: 51200,
    allowProfessionalOrg: true,
    allowMeetings: true,
    allowVoice: true,
    allowAI: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
