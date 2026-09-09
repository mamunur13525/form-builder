/**
 * Workspace domain types.
 *
 * These mirror `backend-form-builder/src/modules/workspaces/workspace.types.ts`
 * exactly — when a field changes there it must change here, since nothing
 * generates one from the other.
 */

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

/** Roles that can be granted. `owner` is reachable only via a transfer. */
export type AssignableWorkspaceRole = Exclude<WorkspaceRole, "owner">;

export type WorkspaceMemberStatus = "active" | "invited";

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "expired";

export type WorkspaceVisibility = "private" | "workspace" | "public";

export type WorkspacePermission =
  | "workspace:view"
  | "workspace:update"
  | "workspace:delete"
  | "settings:update"
  | "member:view"
  | "member:invite"
  | "member:remove"
  | "member:role-change"
  | "invitation:manage"
  | "ownership:transfer"
  | "activity:view"
  // Content permissions. A `member` holds all of these — they are a builder,
  // with full control over the workspace's forms and none over the workspace
  // itself. A `viewer` holds only the two `:view` entries.
  | "form:view"
  | "form:create"
  | "form:update"
  | "form:publish"
  | "form:delete"
  | "response:view"
  | "response:manage";

export type WorkspaceActivityType =
  | "workspace.created"
  | "workspace.updated"
  | "workspace.settings_updated"
  | "member.invited"
  | "member.joined"
  | "member.removed"
  | "member.left"
  | "member.role_changed"
  | "invitation.cancelled"
  | "invitation.resent"
  | "invitation.rejected"
  | "workspace.ownership_transferred"
  // `form.updated` deliberately has no counterpart — autosaves would drown the
  // feed.
  | "form.created"
  | "form.published"
  | "form.deleted";

export interface WorkspaceUserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface WorkspaceSettings {
  visibility: WorkspaceVisibility;
  defaultMemberRole: WorkspaceRole;
  allowMemberInvites: boolean;
  requireInviteApproval: boolean;
}

/**
 * A row in the members table. Active members and pending invitations share this
 * shape, discriminated by `status`:
 *
 * - `active` — `id` is the membership id and `user` is set.
 * - `invited` — `id` is the *invitation* id (what cancel/resend take), `user` is
 *   null, and only `email` and `expiresAt` are known.
 */
export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  status: WorkspaceMemberStatus;
  role: WorkspaceRole;
  email: string;
  user: WorkspaceUserSummary | null;
  invitedBy: WorkspaceUserSummary | null;
  joinedAt: string | null;
  invitedAt: string | null;
  expiresAt: string | null;
  isOwner: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  owner: WorkspaceUserSummary | null;
  settings: WorkspaceSettings;
  memberCount: number;
  pendingInvitationCount: number;
  /** The signed-in user's role here. */
  currentUserRole: WorkspaceRole | null;
  /** What the signed-in user may do — check this before enabling a control. */
  permissions: WorkspacePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceDetail extends Workspace {
  members: WorkspaceMember[];
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  invitedBy: WorkspaceUserSummary | null;
  expiresAt: string;
  isExpired: boolean;
  resendCount: number;
  lastSentAt: string;
  createdAt: string;
  /** Present on create/resend only — the link to hand to the invitee. */
  inviteUrl?: string;
}

export interface IncomingInvitation extends WorkspaceInvitation {
  /**
   * Bearer token from the invite link. Sent only on the "addressed to me"
   * endpoints, so the invitee can accept from the UI without the original link.
   */
  token: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
    memberCount: number;
  } | null;
}

/**
 * Extra detail on an activity row. Every field is optional: each activity type
 * fills in only the keys it needs, so read them per `type`.
 */
export interface WorkspaceActivityMeta {
  fromRole?: WorkspaceRole;
  toRole?: WorkspaceRole;
  changedFields?: string[];
  previousName?: string;
  newName?: string;
  previousSlug?: string;
  newSlug?: string;
  previousOwnerName?: string;
  newOwnerName?: string;
  role?: WorkspaceRole;
  /** Set on `workspace.created` when the workspace was provisioned at signup. */
  automatic?: boolean;
  // Form lifecycle entries.
  formId?: string;
  formTitle?: string;
  formSlug?: string;
  /** Source form id, when this form was created as a duplicate. */
  duplicatedFrom?: string;
}

export interface WorkspaceActivity {
  id: string;
  workspaceId: string;
  type: WorkspaceActivityType;
  actor: WorkspaceUserSummary | null;
  targetUser: WorkspaceUserSummary | null;
  targetEmail: string | null;
  meta: WorkspaceActivityMeta;
  createdAt: string;
}

export interface PaginatedActivity {
  items: WorkspaceActivity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SlugAvailability {
  slug: string;
  available: boolean;
  /** A free alternative when `available` is false. */
  suggestion: string;
}

export interface ActiveWorkspaceRef {
  workspaceId: string | null;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface CreateWorkspacePayload {
  name: string;
  /** Omit to have the server derive one from `name`. */
  slug?: string;
  logoUrl?: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
}

export interface UpdateWorkspaceSettingsPayload {
  visibility?: WorkspaceVisibility;
  defaultMemberRole?: AssignableWorkspaceRole;
  allowMemberInvites?: boolean;
  requireInviteApproval?: boolean;
}

export interface InviteMemberPayload {
  email: string;
  role?: AssignableWorkspaceRole;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

export const WORKSPACE_ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  owner: "Full control, including deleting the workspace",
  admin: "Manage members, invitations and settings",
  member: "Create and edit forms in this workspace",
  viewer: "Read-only access to forms and responses",
};

/** Roles the invite and role-change pickers offer. */
export const ASSIGNABLE_WORKSPACE_ROLES: AssignableWorkspaceRole[] = [
  "admin",
  "member",
  "viewer",
];

export const WORKSPACE_VISIBILITY_LABELS: Record<WorkspaceVisibility, string> = {
  private: "Private",
  workspace: "Workspace",
  public: "Public",
};

export const WORKSPACE_VISIBILITY_DESCRIPTIONS: Record<WorkspaceVisibility, string> = {
  private: "Only invited members can open this workspace",
  workspace: "Members can share read-only links to its contents",
  public: "Anyone with the workspace URL can discover it",
};

/**
 * Whether the signed-in user holds a permission. Reads the server-sent
 * `permissions` array rather than re-deriving the matrix on the client, so the
 * two can never disagree.
 */
export const hasWorkspacePermission = (
  workspace: Pick<Workspace, "permissions"> | null | undefined,
  permission: WorkspacePermission
): boolean => workspace?.permissions?.includes(permission) ?? false;
