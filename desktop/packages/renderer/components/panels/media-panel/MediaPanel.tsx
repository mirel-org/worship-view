import { selectedBackgroundMediaItemAtom } from '@ipc/media/media.atoms';
import useGetMediaItems from '@ipc/media/media.hooks';
import { useAtom } from 'jotai';
import { OliList, OliText } from 'oli-design-system';
import styled from 'styled-components';

const MediaPanel = () => {
  const mediaItems = useGetMediaItems();
  const [, setSelectedMediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  return (
    <Container>
      <OliText variant='h4' text='Media' />
      <OliList
        items={mediaItems.map((mediaItem) => ({
          key: `${mediaItem.id}`,
          text: mediaItem.name,
          onClick: () => setSelectedMediaItem(mediaItem),
        }))}
      />
    </Container>
  );
};

export default MediaPanel;

const Container = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
`;
