import { selectedSongAtom } from '@ipc/song/song.atoms';
import { useServerSongs } from '@ipc/song/song.hooks';
import { useAtom } from 'jotai';
import { OliList } from 'oli-design-system';
import styled from 'styled-components';

const SongsListPanel = () => {
  const { serverSongs } = useServerSongs();
  const [, setSelectedSong] = useAtom(selectedSongAtom);
  return (
    <Container>
      <OliList
        items={serverSongs.map((song) => ({
          key: song.id.toString(),
          text: song.title,
          onClick: () => setSelectedSong(song),
        }))}
      />
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
