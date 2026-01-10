import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { setCoMapProperty } from '../../lib/jazz/helpers';
import { OrganizationType } from '../../lib/jazz/schema';

interface RenameOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationType | null;
}

export function RenameOrganizationDialog({
  open,
  onOpenChange,
  organization,
}: RenameOrganizationDialogProps) {
  const [name, setName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && organization) {
      setName(organization.name || '');
      setError(null);
    } else if (!open) {
      setName('');
      setError(null);
    }
  }, [open, organization]);

  const handleRename = async () => {
    if (!name.trim()) {
      setError('Please enter an organization name');
      return;
    }

    if (!organization) {
      setError('No organization selected');
      return;
    }

    try {
      setIsRenaming(true);
      setError(null);

      setCoMapProperty(organization, 'name', name.trim());
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to rename organization:', error);
      setError(error.message || 'Failed to rename organization');
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Rename Organization</DialogTitle>
          <DialogDescription>
            Change the name of this organization. All members will see the updated name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Enter organization name"
              disabled={isRenaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRenaming}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isRenaming || !name.trim()}>
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

