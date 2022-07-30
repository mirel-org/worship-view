import { prayerRequestFontSizeAtom } from '@ipc/prayer/prayer.atoms';
import { useAtom } from 'jotai';
import styled from 'styled-components';

type PrayerSlideProps = {
  prayerRequests: string[];
};

function sliceIntoChunks(arr: any[], chunkSize: number) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export function PrayerSlide({ prayerRequests }: PrayerSlideProps) {
  const chunks = sliceIntoChunks(prayerRequests, 10);
  const [prayerRequestFontSize] = useAtom(prayerRequestFontSizeAtom);

  return (
    <Container fontSize={prayerRequestFontSize}>
      {chunks.map((chunk, chunkIndex) => (
        <Column key={chunkIndex}>
          {chunk.map((request, requestIndex) => (
            <div key={requestIndex}>{request}</div>
          ))}
        </Column>
      ))}
    </Container>
  );
}

const Container = styled.div<{ fontSize: number }>`
  width: 95vw;
  font-family: 'Montserrat';
  font-size: ${(props) => props.fontSize + '%'};
  font-weight: 700;
  font-style: italic;
  color: white;
  text-shadow: 0.08em 0.08em 0 black;
  text-align: center;
  display: flex;
`;

const Column = styled.div`
  height: 100%;
  width: 100%;
`;
