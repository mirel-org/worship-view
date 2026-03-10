import { FC } from 'react';
import { buildTextShadowStyle, type TextStyleData } from '../../../../jazz/text-style-store';

type VerseSlideProps = {
  text: string;
  reference: string;
  isStage?: boolean;
  textStyle?: TextStyleData;
};

const VerseSlide: FC<VerseSlideProps> = ({
  text,
  reference,
  isStage = false,
  textStyle,
}) => {
  const fontSize = (400 / text.length) * 100 + 500;

  // Scale verse and reference sizes proportionally from the base style
  const verseFontSize = textStyle ? textStyle.fontSize * (450 / 410) : undefined;
  const refFontSize = textStyle ? textStyle.fontSize * (350 / 410) : undefined;
  const textShadow = textStyle ? buildTextShadowStyle(textStyle) : undefined;

  return (
    <div className={isStage ? 'w-[95%]' : 'w-[80%]'}>
      {isStage ? (
        <div
          className="font-iosevka text-white text-center leading-none"
          style={{
            fontSize: `${fontSize}%`,
            letterSpacing: '-0.1em',
          }}
        >
          {text}
        </div>
      ) : textStyle ? (
        <div
          style={{
            fontFamily: textStyle.fontFamily,
            fontSize: `${verseFontSize}%`,
            fontWeight: textStyle.fontWeight,
            fontStyle: textStyle.italic ? 'italic' : 'normal',
            color: textStyle.fontColor,
            textAlign: textStyle.textAlign,
            lineHeight: textStyle.lineHeight,
            textShadow,
          }}
        >
          {text}
        </div>
      ) : (
        <div
          className="font-montserrat text-[450%] font-bold italic text-white text-center"
          style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
        >
          {text}
        </div>
      )}
      {textStyle && !isStage ? (
        <div
          className="mt-8"
          style={{
            fontFamily: textStyle.fontFamily,
            fontSize: `${refFontSize}%`,
            fontWeight: textStyle.fontWeight,
            fontStyle: textStyle.italic ? 'italic' : 'normal',
            textTransform: 'uppercase',
            color: textStyle.fontColor,
            textAlign: 'right',
            lineHeight: textStyle.lineHeight,
            textShadow,
          }}
        >
          {reference}
        </div>
      ) : (
        <div
          className="mt-8 font-montserrat text-[350%] font-bold italic uppercase text-white text-right"
          style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
        >
          {reference}
        </div>
      )}
    </div>
  );
};

export default VerseSlide;
