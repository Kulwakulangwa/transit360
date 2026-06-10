import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  createTeamMember,
  listRoleAuditLog,
  listTeamMembers,
  removeTeamMember,
  updateMemberRole,
} from "@/lib/admin.functions";
import { useHasRole, useMyRoles, type AppRole } from "@/hooks/use-roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Full access including user management" },
  { value: "manager", label: "Manager", description: "Read/write everything except user management" },
  { value: "dispatcher", label: "Dispatcher", description: "Manage operational data (no financials)" },
  { value: "viewer", label: "Viewer", description: "Read-only operational data" },
  { value: "user", label: "User", description: "Default role with minimal access" },
];

function RoleBadge({ role }: { role: string }) {
  const tone: Record<string, string> = {
    admin: "bg-red-500/15 text-red-600 border-red-500/30",
    manager: "bg-purple-500/15 text-purple-600 border-purple-500/30",
    dispatcher: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    viewer: "bg-green-500/15 text-green-600 border-green-500/30",
    user: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={tone[role] ?? tone.user}>
      {role}
    </Badge>
  );
}

function AdminPage() {
  const { allowed, isLoading, roles } = useHasRole("admin");
  const { data, error } = useMyRoles();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }
  if (!allowed) {
    const errMsg = (error as Error | undefined)?.message;
    const looksLikeEnvIssue =
      errMsg && /Missing Supabase environment|SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_PUBLISHABLE_KEY|Unauthorized/i.test(errMsg);
    return (
      <div className="p-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              You need the admin role to manage team access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Detected roles:</span> {roles.length ? roles.join(", ") : <em>none</em>}</div>
            {errMsg && (
              <div className="rounded border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                <div className="font-medium">Role lookup failed</div>
                <div className="font-mono text-xs mt-1 break-all">{errMsg}</div>
                {looksLikeEnvIssue && (
                  <div className="mt-2 text-foreground">
                    This is a deployment configuration problem, not a permission problem.
                    Add the missing server-side environment variables in Vercel (Settings → Environment Variables) and redeploy:
                    <ul className="list-disc pl-5 mt-1">
                      <li><code>SUPABASE_URL</code></li>
                      <li><code>SUPABASE_PUBLISHABLE_KEY</code></li>
                      <li><code>SUPABASE_SERVICE_ROLE_KEY</code> (server-only — never prefix with VITE_)</li>
                      <li><code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, <code>VITE_SUPABASE_PROJECT_ID</code></li>
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!errMsg && data && (
              <div className="text-muted-foreground">
                The server returned roles but none of them is <code>admin</code>. Have an admin grant it via the team page.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Administration</h1>
        <p className="text-muted-foreground">Manage who can access the dashboard and what they can do.</p>
      </div>
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Team members</TabsTrigger>
          <TabsTrigger value="permissions">Role permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <MembersTab />
        </TabsContent>
        <TabsContent value="permissions" className="mt-4">
          <PermissionsTab />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MembersTab() {
  const qc = useQueryClient();
  const listFn = useServerFn(listTeamMembers);
  const createFn = useServerFn(createTeamMember);
  const updateFn = useServerFn(updateMemberRole);
  const removeFn = useServerFn(removeTeamMember);

  const { data, isLoading, error } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => listFn(),
  });

  const createMut = useMutation({
    mutationFn: (vars: { email: string; password: string; role: AppRole }) =>
      createFn({ data: vars }),
    onSuccess: () => {
      toast.success("Team member created");
      qc.invalidateQueries({ queryKey: ["team-members"] });
      qc.invalidateQueries({ queryKey: ["role-audit"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { userId: string; role: AppRole }) => updateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["team-members"] });
      qc.invalidateQueries({ queryKey: ["role-audit"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (vars: { userId: string }) => removeFn({ data: vars }),
    onSuccess: () => {
      toast.success("Team member removed");
      qc.invalidateQueries({ queryKey: ["team-members"] });
      qc.invalidateQueries({ queryKey: ["role-audit"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team members</CardTitle>
          <CardDescription>Create accounts and assign roles.</CardDescription>
        </div>
        <AddMemberDialog onSubmit={(vars) => createMut.mutate(vars)} pending={createMut.isPending} />
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading members…</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
        {data && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last sign-in</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {m.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">no role</span>
                      ) : (
                        m.roles.map((r) => <RoleBadge key={r} role={r} />)
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.last_sign_in_at ? new Date(m.last_sign_in_at).toLocaleString() : "never"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={m.roles[0] ?? ""}
                        onValueChange={(role) =>
                          updateMut.mutate({ userId: m.id, role: role as AppRole })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Set role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Remove
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {m.email}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently deletes their account and revokes all access.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMut.mutate({ userId: m.id })}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AddMemberDialog({
  onSubmit,
  pending,
}: {
  onSubmit: (vars: { email: string; password: string; role: AppRole }) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("viewer");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>
            Create an account directly. Share the temporary password with them securely.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Temporary password (min 8 chars)</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <span>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={pending || !email || password.length < 8}
            onClick={() => {
              onSubmit({ email, password, role });
              setOpen(false);
              setEmail("");
              setPassword("");
              setRole("viewer");
            }}
          >
            {pending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsTab() {
  const rows = [
    { area: "Shipments, Containers, Tracking, Borders, PODs, Fleet, Incidents (read)", admin: "✓", manager: "✓", dispatcher: "✓", viewer: "✓" },
    { area: "Same operational tables (create/edit/delete)", admin: "✓", manager: "✓", dispatcher: "✓", viewer: "—" },
    { area: "Costs, Claims, Customers, Drivers (read & write)", admin: "✓", manager: "✓", dispatcher: "—", viewer: "—" },
    { area: "User & role management", admin: "✓", manager: "—", dispatcher: "—", viewer: "—" },
    { area: "Audit log", admin: "✓", manager: "—", dispatcher: "—", viewer: "—" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role permissions</CardTitle>
        <CardDescription>What each role can do. Enforced by the database.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              <TableHead className="text-center">Admin</TableHead>
              <TableHead className="text-center">Manager</TableHead>
              <TableHead className="text-center">Dispatcher</TableHead>
              <TableHead className="text-center">Viewer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.area}>
                <TableCell>{r.area}</TableCell>
                <TableCell className="text-center">{r.admin}</TableCell>
                <TableCell className="text-center">{r.manager}</TableCell>
                <TableCell className="text-center">{r.dispatcher}</TableCell>
                <TableCell className="text-center">{r.viewer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AuditTab() {
  const listFn = useServerFn(listRoleAuditLog);
  const { data, isLoading, error } = useQuery({
    queryKey: ["role-audit"],
    queryFn: () => listFn(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <CardDescription>Every role grant and revoke is recorded automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
        {data && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No role changes yet.
                  </TableCell>
                </TableRow>
              )}
              {data.logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{l.actor_email}</TableCell>
                  <TableCell>
                    <Badge variant={l.action === "granted" ? "default" : "destructive"}>
                      {l.action}
                    </Badge>
                  </TableCell>
                  <TableCell><RoleBadge role={l.role} /></TableCell>
                  <TableCell>{l.target_email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
