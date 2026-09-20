import { isAuthorized } from "@cedar-policy/cedar-wasm/nodejs";
import type { Role } from "../../packages/shared/domain";

// AWS open-source Cedar runs locally, without an AWS account or paid policy service.
export const walletPolicies = `
permit(principal, action, resource)
when { principal.wallet == resource.id && principal.role == "owner" &&
  [Action::"add-expense", Action::"add-context", Action::"upload"].contains(action) };
permit(principal, action, resource)
when { principal.wallet == resource.id && principal.role == "supporter" &&
  [Action::"top-up", Action::"acknowledge"].contains(action) };
permit(principal, action, resource)
when { principal.wallet == resource.id &&
  ["owner", "supporter"].contains(principal.role) &&
  [Action::"propose", Action::"accept-pact", Action::"dismiss-pact"].contains(action) };
`;
export function authorized(
  role: Role,
  memberWallet: string,
  resourceWallet: string,
  action: string,
) {
  const principal = { type: "Member", id: "current-session" };
  const resource = { type: "Wallet", id: resourceWallet };
  const answer = isAuthorized({
    principal,
    resource,
    action: { type: "Action", id: action },
    context: {},
    policies: { staticPolicies: walletPolicies },
    entities: [
      { uid: principal, attrs: { role, wallet: memberWallet }, parents: [] },
      { uid: resource, attrs: { id: resourceWallet }, parents: [] },
    ],
  });
  return answer.type === "success" && answer.response.decision === "allow";
}
