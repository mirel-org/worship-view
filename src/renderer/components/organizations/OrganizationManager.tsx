import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { WorshipViewAccount } from '../../lib/jazz/schema';
import { useActiveOrganization } from '../../hooks/useActiveOrganization';
import { Button } from '../ui/button';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function OrganizationManager() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // useAccount returns the account directly (or null/undefined if not loaded)
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
    },
  }) as any; // Type assertion needed due to Jazz type resolution
  const { activeOrganization, activeOrgId, switchToOrganization, organizations } =
    useActiveOrganization();

  const handleOrganizationChange = (orgId: string) => {
    const org = organizations.find((o: any) => o?.$jazz.id === orgId);
    if (org) {
      switchToOrganization(org);
    }
  };

  if (!me) {
    return null; // Not authenticated
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={activeOrgId || ''}
          onValueChange={handleOrganizationChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org: any) => {
              if (!org) return null;
              return (
                <SelectItem key={org.$jazz.id} value={org.$jazz.id}>
                  {org.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
          New
        </Button>
      </div>

      {activeOrganization && (
        <p className="text-sm text-muted-foreground">
          Active: {activeOrganization.name}
        </p>
      )}

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}


