import React, { useState, useCallback } from 'react';
import { useIsAuthenticated } from 'jazz-tools/react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useActiveOrganization } from '../../hooks/useActiveOrganization';
import { batchUpsertSongs, BatchUpsertResponse } from '../../lib/jazz/store';
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { isOpenSongFormat, convertOpenSong } from '../../lib/openSongParser';

interface FileWithContent {
  file: File;
  name: string;
  content: string;
}

export function SettingsImportSongs() {
  const isAuthenticated = useIsAuthenticated();
  const { activeOrganization } = useActiveOrganization();
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BatchUpsertResponse | null>(
    null,
  );
  const [selectedFiles, setSelectedFiles] = useState<FileWithContent[]>([]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = async (
    files: FileList | File[],
  ): Promise<FileWithContent[]> => {
    const fileArray = Array.from(files);
    const processedFiles: FileWithContent[] = [];

    for (const file of fileArray) {
      try {
        const content = await file.text();
        // Use the full filename as the song name (including extension)
        const name = file.name;
        processedFiles.push({ file, name, content });
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }

    return processedFiles;
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!isAuthenticated || !activeOrganization) {
        return;
      }

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const processed = await processFiles(files);
      setSelectedFiles(processed);
      setImportResult(null);
    },
    [isAuthenticated, activeOrganization],
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      if (!isAuthenticated || !activeOrganization) {
        return;
      }

      const processed = await processFiles(e.target.files);
      setSelectedFiles(processed);
      setImportResult(null);
      e.target.value = '';
    },
    [isAuthenticated, activeOrganization],
  );

  const handleImport = async () => {
    if (!activeOrganization || selectedFiles.length === 0) {
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const songs: Array<{ name: string; fullText: string }> = [];

      for (const file of selectedFiles) {
        try {
          if (isOpenSongFormat(file.content)) {
            const converted = convertOpenSong(file.content, file.name);
            songs.push({ name: converted.name, fullText: converted.fullText });
          } else {
            songs.push({ name: file.name, fullText: file.content });
          }
        } catch {
          songs.push({ name: file.name, fullText: file.content });
        }
      }

      const result = batchUpsertSongs(activeOrganization, songs);
      setImportResult(result);
      setSelectedFiles([]);
    } catch (error) {
      setImportResult({
        success: false,
        created: 0,
        updated: 0,
        errorCount: selectedFiles.length,
        results: [],
        errors: selectedFiles.map((file) => ({
          name: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })),
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setImportResult(null);
  };

  if (!isAuthenticated) {
    return (
      <div className='text-sm text-muted-foreground'>
        Vă rugăm să vă autentificați pentru a importa cântece.
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className='text-sm text-muted-foreground'>
        Vă rugăm să selectați o organizație activă pentru a importa cântece.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Importă cântece</Label>
        <p className='text-sm text-muted-foreground'>
          Trageți mai multe fișiere sau faceți clic pentru a selecta. Suportă
          formate text simplu și OpenSong XML. Fișierele OpenSong sunt detectate
          automat și convertite. Numele complet al fișierului va fi folosit ca
          nume al cântecului pentru fișierele text.
        </p>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${selectedFiles.length > 0 ? 'border-primary/50' : ''}
          cursor-pointer hover:border-primary/50
        `}
      >
        <input
          type='file'
          id='file-input'
          multiple
          onChange={handleFileInput}
          className='hidden'
        />
        <label htmlFor='file-input' className='cursor-pointer'>
          <Upload className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
          <p className='text-sm font-medium mb-2'>
            {isDragging
              ? 'Eliberați fișierele aici'
              : 'Trageți fișierele aici sau faceți clic pentru a selecta'}
          </p>
          <p className='text-xs text-muted-foreground'>
            Suportă formate text simplu și OpenSong XML
          </p>
        </label>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className='space-y-2'>
          <Label>Fișiere selectate ({selectedFiles.length})</Label>
          <div className='border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto'>
            {selectedFiles.map((file, index) => (
              <div key={index} className='flex items-center gap-2 text-sm'>
                <FileText className='h-4 w-4 text-muted-foreground' />
                <span className='flex-1'>{file.file.name}</span>
                <span className='text-xs text-muted-foreground'>
                  ({file.content.length} chars)
                </span>
              </div>
            ))}
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className='flex-1'
            >
              {isImporting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Se importă...
                </>
              ) : (
                'Importă cântece'
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant='outline'
              disabled={isImporting}
            >
              Golește
            </Button>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className='space-y-2'>
          <Label>Rezultate import</Label>
          <div className='border rounded-lg p-4 space-y-2'>
            <div className='flex items-center gap-2'>
              {importResult.success ? (
                <CheckCircle2 className='h-5 w-5 text-primary' />
              ) : (
                <XCircle className='h-5 w-5 text-destructive' />
              )}
              <span className='font-medium'>
                {importResult.created + (importResult.updated || 0)} cântece procesate
              </span>
            </div>
            <div className='text-sm text-muted-foreground space-y-1'>
              {importResult.created > 0 && (
                <div>
                  {importResult.created} cântece noi create
                </div>
              )}
              {importResult.updated > 0 && (
                <div>
                  {importResult.updated} cântece existente actualizate
                </div>
              )}
            </div>
            {importResult.errorCount > 0 && (
              <div className='text-sm text-muted-foreground'>
                {importResult.errorCount} erori apărute
              </div>
            )}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className='mt-4 space-y-1'>
                <Label className='text-sm'>Erori:</Label>
                {importResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className='text-sm text-destructive bg-destructive/10 p-2 rounded'
                  >
                    <strong>{error.name}:</strong> {error.error}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
