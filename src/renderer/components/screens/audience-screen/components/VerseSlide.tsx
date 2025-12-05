import React, { FC } from 'react';

type VerseSlideProps = {
  text: string;
  reference: string;
  isStage?: boolean;
};

const VerseSlide: FC<VerseSlideProps> = ({
  text,
  reference,
  isStage = false,
}) => {
  const fontSize = (400 / text.length) * 100 + 500;
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
      ) : (
        <div
          className="font-montserrat text-[450%] font-bold italic text-white text-center"
          style={{ textShadow: '0.08em 0.08em 0 black' }}
        >
          {text}
        </div>
      )}
      <div
        className="mt-8 font-montserrat text-[350%] font-bold italic uppercase text-white text-right"
        style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
      >
        {reference}
      </div>
    </div>
  );
};

export default VerseSlide;
