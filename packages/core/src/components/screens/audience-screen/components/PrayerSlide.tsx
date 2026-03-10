import { prayerRequestFontSizeAtom } from '../../../../state/prayer.atoms';
import { useAtom } from 'jotai';
import type { TextStyleData } from '../../../../jazz/text-style-store';

type PrayerSlideProps = {
  prayerRequests: string[];
  textStyle?: TextStyleData;
};

function sliceIntoChunks(arr: any[], chunkSize: number) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export function PrayerSlide({ prayerRequests, textStyle }: PrayerSlideProps) {
  const chunks = sliceIntoChunks(prayerRequests, 10);
  const [prayerRequestFontSize] = useAtom(prayerRequestFontSizeAtom);

  const prayerFontSize = textStyle
    ? textStyle.fontSize * (300 / 410)
    : prayerRequestFontSize;

  return (
    <div
      className={textStyle ? 'w-[95vw] flex' : 'w-[95vw] font-montserrat font-bold italic text-white text-center flex'}
      style={
        textStyle
          ? {
              fontFamily: textStyle.fontFamily,
              fontSize: `${prayerFontSize}%`,
              fontWeight: textStyle.fontWeight,
              fontStyle: textStyle.italic ? 'italic' : 'normal',
              color: textStyle.fontColor,
              textAlign: textStyle.textAlign,
              textShadow: `${textStyle.shadowOffsetX}em ${textStyle.shadowOffsetY}em ${textStyle.shadowBlur}px ${textStyle.shadowColor}`,
            }
          : {
              fontSize: `${prayerFontSize}%`,
              textShadow: '0.08em 0.08em 0 black',
            }
      }
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
