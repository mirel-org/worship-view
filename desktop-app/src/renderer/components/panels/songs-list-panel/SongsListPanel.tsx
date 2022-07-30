import {
  isEditingSongAtom,
  selectedSongAtom,
  songInputFocusAtom,
} from '@ipc/song/song.atoms';
import { SongType } from '@ipc/song/song.types';
import { Edit } from '@mui/icons-material';
import {
  Autocomplete,
  // eslint-disable-next-line import/named
  FilterOptionsState,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import useInputFocus from '@renderer/hooks/useInputFocus';
import { useAtom } from 'jotai';
import styled from 'styled-components';

const SongsListPanel = () => {
  const [selectedSong, setSelectedSong] = useAtom(selectedSongAtom);
  const [, setIsEditingSong] = useAtom(isEditingSongAtom);
  const songs: any[] = [];
  const [focused, setFocused] = useAtom(songInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  const filterOptions = (songs: SongType[], state: FilterOptionsState<SongType>) => {
    const filteredSongs =
      state.inputValue.length > 2
        ? songs.filter((song) =>
            song.fullText.includes(
              (
                state.inputValue.toLocaleLowerCase().match(/(\w+-\w+)|\w+/g) ??
                []
              ).join(' '),
            ),
          )
        : songs;
    return filteredSongs;
  };

  return (
    <Container>
      <Autocomplete
        options={songs}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Search for song'
            onBlur={focusProps.onBlur}
            onFocus={focusProps.onFocus}
            inputRef={focusProps.ref}
            fullWidth
          />
        )}
        filterOptions={filterOptions}
        onChange={(_, newValue) => {
          setSelectedSong(newValue);
        }}
        getOptionLabel={(song) => song.title}
      />
      {selectedSong && (
        <Title>
          <Typography variant='h5'>{selectedSong?.title}</Typography>
          <IconButton onClick={() => setIsEditingSong(true)}>
            <Edit />
          </IconButton>
        </Title>
      )}
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

const Title = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;
