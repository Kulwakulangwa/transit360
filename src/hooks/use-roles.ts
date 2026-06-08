import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyRoles } from "@/lib/admin.functions";

export type AppRole = "admin" | "manager" | "dispatcher" | "viewer" | "user";

export function useMyRoles() {
  const fn = useServerFn(getMyRoles);
  return useQuery({
    queryKey: ["my-roles"],
    queryFn: () => fn(),
    staleTime: 60_000,
  });
}

export function useHasRole(...roles: AppRole[]) {
  const { data, isLoading } = useMyRoles();
  const myRoles = (data?.roles ?? []) as AppRole[];
  return {
    isLoading,
    allowed: myRoles.some((r) => roles.includes(r)),
    roles: myRoles,
  };
}
