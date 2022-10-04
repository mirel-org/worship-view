import { trpc } from '@common/trpc';
import { useImportNativeFormatSongs } from '@ipc/song/song.hooks';
import { OliButton } from 'oli-design-system';

export const SettingsImport = () => {
  const { data: songsData } = trpc.useQuery(['getSongs']);
  const importSongs = useImportNativeFormatSongs();

  return (
    <div>
      <OliButton
        disabled={!songsData || songsData.allSongs.length > 0}
        onClick={importSongs}
        text="Import"
      />
    </div>
  );
};
