import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@worship-view/ui';

type Props = {
  presentationName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
};

const PresentationDeleteDialog: FC<Props> = ({
  presentationName,
  open,
  onOpenChange,
  onDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Șterge prezentarea</DialogTitle>
          <DialogDescription>
            Sigur doriți să ștergeți prezentarea &quot;{presentationName}&quot;? Această acțiune
            nu poate fi anulată.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Șterge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PresentationDeleteDialog;
