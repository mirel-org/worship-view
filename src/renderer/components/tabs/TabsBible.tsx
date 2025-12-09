import { BibleVersesHistory } from '../panels/bible-verses-history/BibleVersesHistory';
import VersesPanel from '../panels/verses-panel/VersesPanel';

const TabsBible = () => {
  return (
    <div className="flex h-full">
      <div className="w-[300px] flex-none">
        <BibleVersesHistory />
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-[90%] h-full">
          <VersesPanel />
        </div>
      </div>
    </div>
  );
};

export default TabsBible;
