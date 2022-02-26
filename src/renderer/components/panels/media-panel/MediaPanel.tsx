import { selectedBackgroundMediaItemAtom } from '@ipc/media/media.atoms';
import useGetMediaItems from '@ipc/media/media.hooks';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useAtom } from 'jotai';
import React, { FC } from 'react';
import styled from 'styled-components';

const MediaPanel: FC = () => {
  const mediaItems = useGetMediaItems();
  const [, setSelectedMediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  return (
    <Container>
      <Typography variant='h4'>Media</Typography>
      <List>
        {mediaItems.map((mediaItem) => (
          <ListItem
            disablePadding
            key={mediaItem.id}
            onClick={() => setSelectedMediaItem(mediaItem)}
          >
            <ListItemButton>
              <ListItemText primary={mediaItem.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default MediaPanel;

const Container = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
`;
