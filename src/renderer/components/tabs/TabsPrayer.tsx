import {
  prayerRequestFontSizeAtom,
  prayerRequestsAtom,
} from '@ipc/prayer/prayer.atoms';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const TabsPrayer = () => {
  const [inputValue, setInputValue] = useState('');
  const [, setPrayerRequests] = useAtom(prayerRequestsAtom);
  const [, setPrauerRequestFontSize] = useAtom(prayerRequestFontSizeAtom);
  useEffect(() => {
    setPrayerRequests(inputValue.split('\n'));
    console.log(inputValue.split('\n'));
  }, [inputValue, setPrayerRequests]);

  return (
    <div className="flex flex-col items-center h-full p-4 space-y-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setPrauerRequestFontSize((fontSize) => fontSize + 25)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Increase font size
        </Button>
        <Button
          variant="outline"
          onClick={() => setPrauerRequestFontSize((fontSize) => fontSize - 25)}
        >
          <Minus className="mr-2 h-4 w-4" />
          Decrease font size
        </Button>
      </div>
      <div className="w-full max-w-2xl space-y-2">
        <Label htmlFor="prayer-requests">Prayer requests (one per line)</Label>
        <textarea
          id="prayer-requests"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={10}
        />
      </div>
    </div>
  );
};

export default TabsPrayer;
