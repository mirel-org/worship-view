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
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LibreOfficePrompt: FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>LibreOffice necesar</DialogTitle>
          <DialogDescription>
            Pentru a converti prezentări PowerPoint, este necesar LibreOffice. Vă rugăm să
            instalați LibreOffice și reporniți aplicația.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Descărcați LibreOffice de la:</p>
          <a
            href="https://www.libreoffice.org/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            https://www.libreoffice.org/download/
          </a>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Închide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LibreOfficePrompt;
