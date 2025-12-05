import { prayerRequestFontSizeAtom } from '@ipc/prayer/prayer.atoms';
import { useAtom } from 'jotai';

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
    <div
      className="w-[95vw] font-montserrat font-bold italic text-white text-center flex"
      style={{
        fontSize: `${prayerRequestFontSize}%`,
        textShadow: '0.08em 0.08em 0 black',
      }}
    >
      {chunks.map((chunk, chunkIndex) => (
        <div key={chunkIndex} className="h-full w-full">
          {chunk.map((request, requestIndex) => (
            <div key={requestIndex}>{request}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
