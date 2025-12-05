import {
  selectedSongAtom,
  songInputFocusAtom,
  songInputValueAtom,
} from '@ipc/song/song.atoms';
import { useGetSongs } from '@ipc/song/song.hooks';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import useInputFocus from '@renderer/hooks/useInputFocus';
import { useAtom } from 'jotai';
import React from 'react';
import styled from 'styled-components';

const SongsListPanel = () => {
  const [, setSelectedSong] = useAtom(selectedSongAtom);
  const songs = useGetSongs();
  const [search, setSearch] = useAtom(songInputValueAtom);
  const [focused, setFocused] = useAtom(songInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  const filteredSongs =
    search.length > 2
      ? songs.filter((song) =>
          song.fullText.includes(
            (search.toLocaleLowerCase().match(/(\w+-\w+)|\w+/g) ?? []).join(
              ' ',
            ),
          ),
        )
      : songs;

  console.log(filteredSongs);

  return (
    <Container>
      <TextField
        label='Search for song'
        onBlur={focusProps.onBlur}
        onFocus={focusProps.onFocus}
        inputRef={focusProps.ref}
        fullWidth
        value={search}
        onChange={(ev) => setSearch(ev.target.value)}
      />
      <List>
        {filteredSongs.map((song) => (
          <ListItem
            disablePadding
            key={song.id}
            onClick={() => setSelectedSong(song)}
          >
            <ListItemButton>
              <ListItemText primary={song.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default SongsListPanel;

const Container = styled.div`
  width: auto;
  overflow-y: auto;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
`;
