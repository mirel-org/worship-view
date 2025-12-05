import BibleSearchPanel from '../panels/bible-search-panel/BibleSearchPanel';
import { BibleVersesHistory } from '../panels/bible-verses-history/BibleVersesHistory';
import VersesPanel from '../panels/verses-panel/VersesPanel';

const TabsBible = () => {
  return (
    <div className="flex flex-col items-center h-full">
      <BibleSearchPanel />
      <div className="flex h-[85%]">
        <div className="w-[300px] flex-none">
          <BibleVersesHistory />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-[90%] h-full">
            <VersesPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabsBible;
