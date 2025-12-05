import {
  selectedVerseReferenceAtom,
  versesHistoryAtom,
} from '@ipc/verse/verse.atoms';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useAtom } from 'jotai';

export function BibleVersesHistory() {
  const [versesHistory] = useAtom(versesHistoryAtom);
  const [, setSelectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  return (
    <div style={{ paddingLeft: 8 }}>
      <Typography variant='h4'>Verses History</Typography>
      <List>
        {versesHistory.map((verseReference, index) => (
          <ListItem
            disablePadding
            key={index}
            onClick={() => setSelectedVerseReference(verseReference)}
          >
            <ListItemButton>
              <ListItemText
                primary={`${verseReference.book} ${verseReference.chapter}:${verseReference.verse}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
