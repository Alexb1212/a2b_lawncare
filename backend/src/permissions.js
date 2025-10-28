// backend/src/permissions.js

// All permission strings used across the API
const PERMISSIONS = {
  // properties
  VIEW_PROPERTIES: 'view:properties',
  EDIT_PROPERTIES: 'edit:properties',
  CREATE_PROPERTIES: 'create:properties',

  // jobs
  VIEW_JOBS: 'view:jobs',
  START_STOP_JOBS: 'act:jobs',
  CREATE_JOBS: 'create:jobs',

  // invoices
  VIEW_INVOICES: 'view:invoices',
  CREATE_INVOICES: 'create:invoices',
  MARK_INVOICES_PAID: 'mark:invoices',

  // users
  VIEW_USERS: 'view:users',
  CREATE_USERS: 'create:users',      // 👈 THIS was missing
};

// Which roles get which permissions
const ROLE_CAPABILITIES = {
  admin: new Set(Object.values(PERMISSIONS)),

  manager: new Set([
    // properties
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.EDIT_PROPERTIES,
    PERMISSIONS.CREATE_PROPERTIES,

    // jobs
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.START_STOP_JOBS,
    PERMISSIONS.CREATE_JOBS,

    // invoices
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.MARK_INVOICES_PAID,

    // users (optional: allow managers to invite)
    // PERMISSIONS.VIEW_USERS,
    // PERMISSIONS.CREATE_USERS,
  ]),

  crew: new Set([
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.START_STOP_JOBS,
    PERMISSIONS.VIEW_INVOICES,
  ]),

  viewer: new Set([
    PERMISSIONS.VIEW_PROPERTIES,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.VIEW_INVOICES,
  ]),
};

module.exports = { PERMISSIONS, ROLE_CAPABILITIES };
