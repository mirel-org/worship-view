import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTextStyles } from '../../hooks/useTextStyle';
import {
  DEFAULT_TEXT_STYLE_TEMPLATE,
  AVAILABLE_FONTS,
  createTextStyle,
  updateTextStyle,
  deleteTextStyle,
} from '../../jazz/text-style-store';
import type { TextStyleData } from '../../jazz/text-style-store';
import { Label, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn } from '@worship-view/ui';
import { CheckCircle2, Trash2, Plus, Save, ImageOff } from 'lucide-react';
import { useGetMediaItems, useMediaBlobUrl } from '../../hooks/useMedia';
import type { MediaItemResponse } from '../../jazz/media-store';

const FONT_WEIGHT_OPTIONS = [
  { value: 100, label: '100 - Thin' },
  { value: 200, label: '200 - Extra Light' },
  { value: 300, label: '300 - Light' },
  { value: 400, label: '400 - Regular' },
  { value: 500, label: '500 - Medium' },
  { value: 600, label: '600 - Semi Bold' },
  { value: 700, label: '700 - Bold' },
  { value: 800, label: '800 - Extra Bold' },
  { value: 900, label: '900 - Black' },
];

const TEXT_ALIGN_OPTIONS: { value: 'left' | 'center' | 'right'; label: string }[] = [
  { value: 'left', label: 'Stânga' },
  { value: 'center', label: 'Centru' },
  { value: 'right', label: 'Dreapta' },
];

const VERTICAL_ALIGN_OPTIONS: { value: 'top' | 'center' | 'bottom'; label: string }[] = [
  { value: 'top', label: 'Sus' },
  { value: 'center', label: 'Centru' },
  { value: 'bottom', label: 'Jos' },
];

const SONG_SLIDE_SIZE_OPTIONS = [
  { value: '1', label: '1 linie' },
  { value: '2', label: '2 linii' },
  { value: '4', label: '4 linii' },
  { value: '8', label: '8 linii' },
  { value: 'full', label: 'Strofa întreagă' },
];

const PREVIEW_LINES = [
  'Binecuvântat este Domnul',
  'Cel ce vine în numele Lui',
  'Osana în ceruri',
  'Slavă veșnică Lui',
];

function buildTextShadow(style: TextStyleData): string {
  if (!style.shadowEnabled) return 'none';
  return `${style.shadowOffsetX}em ${style.shadowOffsetY}em ${style.shadowBlur}px ${style.shadowColor}`;
}

function PreviewBackgroundThumb({
  mediaItem,
  selected,
  onSelect,
}: {
  mediaItem: MediaItemResponse;
  selected: boolean;
  onSelect: () => void;
}) {
  const { blobUrl } = useMediaBlobUrl(mediaItem.fileStreamId);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex-shrink-0 w-16 h-12 rounded border overflow-hidden bg-muted',
        selected ? 'border-2 border-ring' : 'border-border hover:border-ring/60',
      )}
    >
      {blobUrl && (
        mediaItem.mediaType === 'image' ? (
          <img src={blobUrl} className="w-full h-full object-cover" alt={mediaItem.name} />
        ) : (
          <video src={blobUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
        )
      )}
    </button>
  );
}

function PreviewBackgroundImage({ fileStreamId, mediaType }: { fileStreamId: string; mediaType: 'image' | 'video' }) {
  const { blobUrl } = useMediaBlobUrl(fileStreamId);
  if (!blobUrl) return null;
  return (
    <div className="absolute inset-0 z-0">
      {mediaType === 'image' ? (
        <img src={blobUrl} className="w-full h-full object-cover" alt="" />
      ) : (
        <video src={blobUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
      )}
    </div>
  );
}

function StylePreview({ style, backgroundMedia }: { style: TextStyleData; backgroundMedia?: MediaItemResponse | null }) {
  const lineCount = style.songSlideSize === 'full' ? PREVIEW_LINES.length : Math.min(style.songSlideSize, PREVIEW_LINES.length);
  const visibleLines = PREVIEW_LINES.slice(0, lineCount);

  const verticalAlignClass = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  }[style.verticalAlign ?? 'center'];

  return (
    <div className="mt-4 rounded-lg overflow-hidden border">
      <div className="text-xs text-muted-foreground px-3 py-1.5 bg-muted/30 border-b">
        Previzualizare
      </div>
      <div
        className={`bg-black flex ${verticalAlignClass} justify-center relative overflow-hidden w-full p-4`}
        style={{ aspectRatio: '16 / 9' }}
      >
        {backgroundMedia && (
          <PreviewBackgroundImage fileStreamId={backgroundMedia.fileStreamId} mediaType={backgroundMedia.mediaType} />
        )}
        <div
          className="relative z-10 w-full"
          style={{
            fontFamily: style.fontFamily,
            fontSize: `${style.fontSize / 200}rem`,
            fontWeight: style.fontWeight,
            fontStyle: style.italic ? 'italic' : 'normal',
            textTransform: style.uppercase ? 'uppercase' : 'none',
            color: style.fontColor,
            textAlign: style.textAlign,
            lineHeight: style.lineHeight,
            textShadow: style.shadowEnabled
              ? `${style.shadowOffsetX}em ${style.shadowOffsetY}em ${style.shadowBlur * 0.5}px ${style.shadowColor}`
              : 'none',
          }}
        >
          {visibleLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsTextStyles() {
  const { styles, selectedStyleId, setSelectedStyleId, activeOrganization } = useTextStyles();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TextStyleData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewBackground, setPreviewBackground] = useState<MediaItemResponse | null>(null);
  const { data: mediaItems } = useGetMediaItems();

  // Set initial selection
  useEffect(() => {
    if (!selectedItemId && styles.length > 0) {
      setSelectedItemId(styles[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when selectedItemId or list length changes
  }, [selectedItemId, styles.length]);

  const selectedItem = styles.find((s) => s.id === selectedItemId) ?? null;
  const isActive = selectedItemId === selectedStyleId || (!selectedStyleId && selectedItem === styles[0]);
  const isLastStyle = styles.length <= 1;

  // Detect unsaved changes
  const hasChanges = useMemo(() => {
    if (!editValues || !selectedItem) return false;
    return (Object.keys(editValues) as (keyof TextStyleData)[]).some(
      (key) => key !== 'id' && editValues[key] !== selectedItem[key],
    );
  }, [editValues, selectedItem]);

  // Sync edit values when selection changes
  useEffect(() => {
    if (selectedItem) {
      setEditValues({ ...selectedItem });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only re-run when selectedItemId changes
  }, [selectedItemId]);

  const handleFieldChange = useCallback(
    (field: keyof TextStyleData, value: TextStyleData[keyof TextStyleData]) => {
      if (!editValues) return;
      setEditValues({ ...editValues, [field]: value });
    },
    [editValues],
  );

  const handleSave = () => {
    if (!activeOrganization || !selectedItemId || !editValues || !hasChanges) return;

    setIsSaving(true);
    try {
      const { id: _, ...fields } = editValues;
      updateTextStyle(activeOrganization, selectedItemId, fields);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = () => {
    if (!activeOrganization) return;
    const newStyle = createTextStyle(activeOrganization, {
      ...DEFAULT_TEXT_STYLE_TEMPLATE,
      name: 'Stil nou',
    });
    setSelectedItemId(newStyle.id);
  };

  const handleDelete = () => {
    if (!activeOrganization || !selectedItemId || isLastStyle) return;
    if (!confirm('Sigur doriți să ștergeți acest stil?')) return;

    // If deleted style was the active one, clear selection (falls back to first)
    if (selectedStyleId === selectedItemId) {
      setSelectedStyleId(null);
    }

    deleteTextStyle(activeOrganization, selectedItemId);
    setSelectedItemId(styles.find((s) => s.id !== selectedItemId)?.id ?? null);
  };

  const handleSelect = () => {
    if (selectedItemId) {
      setSelectedStyleId(selectedItemId);
    }
  };

  // The preview style: use editValues for live preview, fallback to selectedItem
  const previewStyle = editValues ?? selectedItem ?? styles[0] ?? null;

  return (
    <div className="flex h-[calc(90vh-6rem)] gap-4">
      {/* Left Sidebar - Style List */}
      <div className="w-52 border-r pr-4 flex flex-col min-h-0">
        <Label className="mb-2">Stiluri text</Label>
        <div className="flex-1 overflow-y-auto space-y-1">
          {styles.map((style) => {
            const isItemActive = style.id === selectedStyleId || (!selectedStyleId && style === styles[0]);
            const isItemSelected = style.id === selectedItemId;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedItemId(style.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${isItemSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{style.name}</span>
                  {isItemActive && (
                    <CheckCircle2 className="h-4 w-4 ml-2 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <Button
          onClick={handleCreate}
          variant="outline"
          className="w-full mt-4"
          disabled={!activeOrganization}
        >
          <Plus className="h-4 w-4 mr-2" />
          Stil nou
        </Button>
      </div>

      {/* Right Side - Style Details */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-10">
        {editValues ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-lg font-semibold">{editValues.name}</h3>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <Button onClick={handleSave} size="sm" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Se salvează...' : 'Salvează'}
                  </Button>
                )}
                {!isActive && (
                  <Button onClick={handleSelect} size="sm" variant="outline">
                    Selectează
                  </Button>
                )}
                {isActive && (
                  <span className="text-sm text-muted-foreground">Stilul activ</span>
                )}
                {!isLastStyle && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Șterge
                  </Button>
                )}
              </div>
            </div>

            {/* General */}
            <div>
              <h4 className="text-2xl font-semibold text-foreground mb-4">General</h4>
              <div className="space-y-1.5">
                <Label htmlFor="style-name">Nume</Label>
                <Input
                  id="style-name"
                  value={editValues.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}

                />
              </div>
            </div>

            {/* Tipografie */}
            <div>
              <h4 className="text-2xl font-semibold text-foreground mb-4">Tipografie</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="style-font">Font</Label>
                  <Select
                    value={editValues.fontFamily}
                    onValueChange={(v) => handleFieldChange('fontFamily', v)}
  
                  >
                    <SelectTrigger id="style-font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FONTS.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-weight">Grosime</Label>
                  <Select
                    value={String(editValues.fontWeight)}
                    onValueChange={(v) => handleFieldChange('fontWeight', Number(v))}
  
                  >
                    <SelectTrigger id="style-weight">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_WEIGHT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-size">Dimensiune (%)</Label>
                  <Input
                    id="style-size"
                    type="number"
                    value={editValues.fontSize}
                    onChange={(e) => handleFieldChange('fontSize', Number(e.target.value))}
  
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Stil font</Label>
                  <div className="flex items-center gap-4 h-9">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editValues.italic}
                        onChange={(e) => handleFieldChange('italic', e.target.checked)}
      
                        className="rounded"
                      />
                      Italic
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editValues.uppercase}
                        onChange={(e) => handleFieldChange('uppercase', e.target.checked)}
      
                        className="rounded"
                      />
                      Majuscule
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="style-color">Culoare text</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editValues.fontColor}
                      onChange={(e) => handleFieldChange('fontColor', e.target.value)}
    
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      id="style-color"
                      value={editValues.fontColor}
                      onChange={(e) => handleFieldChange('fontColor', e.target.value)}
    
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Aspect slide */}
            <div>
              <h4 className="text-2xl font-semibold text-foreground mb-4">Aspect slide</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="style-align">Aliniere</Label>
                  <Select
                    value={editValues.textAlign}
                    onValueChange={(v) => handleFieldChange('textAlign', v as 'left' | 'center' | 'right')}

                  >
                    <SelectTrigger id="style-align">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_ALIGN_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-vertical-align">Aliniere verticală</Label>
                  <Select
                    value={editValues.verticalAlign}
                    onValueChange={(v) => handleFieldChange('verticalAlign', v as 'top' | 'center' | 'bottom')}
                  >
                    <SelectTrigger id="style-vertical-align">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VERTICAL_ALIGN_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-line-height">Înălțime linie</Label>
                  <Input
                    id="style-line-height"
                    type="number"
                    step="0.1"
                    value={editValues.lineHeight}
                    onChange={(e) => handleFieldChange('lineHeight', Number(e.target.value))}

                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-slide-size">Linii per slide</Label>
                  <Select
                    value={String(editValues.songSlideSize)}
                    onValueChange={(v) => handleFieldChange('songSlideSize', v === 'full' ? 'full' : Number(v))}

                  >
                    <SelectTrigger id="style-slide-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SONG_SLIDE_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Umbră */}
            <div>
              <h4 className="text-2xl font-semibold text-foreground mb-4">Umbră</h4>
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editValues.shadowEnabled}
                    onChange={(e) => handleFieldChange('shadowEnabled', e.target.checked)}
                    className="rounded"
                  />
                  Activare umbră
                </label>
              </div>
              <div className={cn('grid grid-cols-4 gap-4', !editValues.shadowEnabled && 'opacity-50 pointer-events-none')}>
                <div className="space-y-1.5">
                  <Label htmlFor="style-shadow-x">X (em)</Label>
                  <Input
                    id="style-shadow-x"
                    type="number"
                    step="0.01"
                    value={editValues.shadowOffsetX}
                    onChange={(e) => handleFieldChange('shadowOffsetX', Number(e.target.value))}

                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-shadow-y">Y (em)</Label>
                  <Input
                    id="style-shadow-y"
                    type="number"
                    step="0.01"
                    value={editValues.shadowOffsetY}
                    onChange={(e) => handleFieldChange('shadowOffsetY', Number(e.target.value))}

                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-shadow-blur">Blur (px)</Label>
                  <Input
                    id="style-shadow-blur"
                    type="number"
                    step="1"
                    value={editValues.shadowBlur}
                    onChange={(e) => handleFieldChange('shadowBlur', Number(e.target.value))}

                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="style-shadow-color">Culoare</Label>
                  <Input
                    id="style-shadow-color"
                    value={editValues.shadowColor}
                    onChange={(e) => handleFieldChange('shadowColor', e.target.value)}

                  />
                </div>
              </div>
            </div>

            {/* Fundal previzualizare */}
            <div>
              <h4 className="text-2xl font-semibold text-foreground mb-4">Fundal previzualizare</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setPreviewBackground(null)}
                  className={cn(
                    'flex-shrink-0 w-16 h-12 rounded border bg-black flex items-center justify-center',
                    previewBackground === null ? 'border-2 border-ring' : 'border-border hover:border-ring/60',
                  )}
                >
                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                </button>
                {mediaItems.map((item) => (
                  <PreviewBackgroundThumb
                    key={item.id}
                    mediaItem={item}
                    selected={previewBackground?.id === item.id}
                    onSelect={() => setPreviewBackground(item)}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <StylePreview style={previewStyle} backgroundMedia={previewBackground} />
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Selectați un stil pentru a vedea detaliile
          </div>
        )}
      </div>
    </div>
  );
}
