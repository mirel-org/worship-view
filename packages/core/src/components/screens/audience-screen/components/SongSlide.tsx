import { FC } from 'react';

type SongSlideProps = {
  lines: string[];
};

const SongSlide: FC<SongSlideProps> = ({ lines }) => {
  return (
    <div>
      {lines.map((line, index) => (
        <div
          key={index}
          className="font-montserrat text-[410%] font-bold italic uppercase text-white text-center"
          style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export default SongSlide;
