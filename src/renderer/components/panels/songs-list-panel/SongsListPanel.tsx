import {
  selectedSongAtom,
  songInputFocusAtom,
  songInputValueAtom,
} from '@ipc/song/song.atoms';
import { useGetSongs } from '@ipc/song/song.hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useInputFocus from '@renderer/hooks/useInputFocus';
import { useAtom } from 'jotai';

const SongsListPanel = () => {
  const [, setSelectedSong] = useAtom(selectedSongAtom);
  const songs = useGetSongs();
  const [search, setSearch] = useAtom(songInputValueAtom);
  const [focused, setFocused] = useAtom(songInputFocusAtom);
  const focusProps = useInputFocus(focused, setFocused);

  const filteredSongs =
    search.length > 2
      ? songs.filter((song) =>
          song.fullText.includes(
            (search.toLocaleLowerCase().match(/(\w+-\w+)|\w+/g) ?? []).join(
              ' ',
            ),
          ),
        )
      : songs;

  console.log(filteredSongs);

  return (
    <div className="w-auto overflow-y-auto h-full p-2 box-border">
      <div className="space-y-2 mb-4">
        <Label htmlFor="search-song">Search for song</Label>
        <Input
          id="search-song"
          onBlur={focusProps.onBlur}
          onFocus={focusProps.onFocus}
          ref={focusProps.ref}
          className="w-full"
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
        />
      </div>
      <ul className="space-y-1">
        {filteredSongs.map((song) => (
          <li
            key={song.id}
            onClick={() => setSelectedSong(song)}
            className="cursor-pointer hover:bg-accent rounded-md p-2 transition-colors"
          >
            <span>{song.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SongsListPanel;
