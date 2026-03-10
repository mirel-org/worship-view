import { FC } from 'react';
import type { TextStyleData } from '../../../../jazz/text-style-store';

type SongSlideProps = {
  lines: string[];
  textStyle?: TextStyleData;
};

const SongSlide: FC<SongSlideProps> = ({ lines, textStyle }) => {
  return (
    <div>
      {lines.map((line, index) => (
        <div
          key={index}
          style={
            textStyle
              ? {
                  fontFamily: textStyle.fontFamily,
                  fontSize: `${textStyle.fontSize}%`,
                  fontWeight: textStyle.fontWeight,
                  fontStyle: textStyle.italic ? 'italic' : 'normal',
                  textTransform: textStyle.uppercase ? 'uppercase' : 'none',
                  color: textStyle.fontColor,
                  textAlign: textStyle.textAlign,
                  lineHeight: textStyle.lineHeight,
                  textShadow: `${textStyle.shadowOffsetX}em ${textStyle.shadowOffsetY}em ${textStyle.shadowBlur}px ${textStyle.shadowColor}`,
                }
              : { textShadow: '0.06em 0.06em 1px #00000094' }
          }
          className={
            textStyle
              ? undefined
              : 'font-montserrat text-[410%] font-bold italic uppercase text-white text-center'
          }
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export default SongSlide;
