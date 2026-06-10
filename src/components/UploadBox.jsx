import React, { useState } from 'react';

export function UploadBox({ onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [summary, setSummary] = useState('No file selected yet.');

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const newFiles = selectedFiles.map(file => ({
      file,
      name: file.name,
      status: 'Wird geprüft...',
      type: file.type
    }));

    setFiles(newFiles);
    setStatus('uploading');
    setSummary(`${selectedFiles.length} Datei(en) werden hochgeladen...`);

    const config = {
      apiBaseUrl: window.APP_CONFIG?.API_BASE_URL || '',
      uploadPath: window.APP_CONFIG?.UPLOAD_PATH || '/api/upload-url'
    };

    let successCount = 0;
    let errorCount = 0;
    
    const updatedFiles = [...newFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
      
      const updateItemStatus = (msg) => {
        updatedFiles[i].status = msg;
        setFiles([...updatedFiles]);
      };

      if (!allowed.includes(item.type)) {
        updateItemStatus('✗ Ungültiges Format');
        errorCount++;
        continue;
      }

      if (!config.apiBaseUrl || config.apiBaseUrl.includes('REPLACE_WITH_API_ID')) {
        updateItemStatus('✗ API URL nicht konfiguriert');
        errorCount++;
        continue;
      }

      try {
        updateItemStatus('⏳ Presigned URL wird geholt...');
        const params = new URLSearchParams({ filename: item.name, contentType: item.type });
        const presignResponse = await fetch(`${config.apiBaseUrl}${config.uploadPath}?${params}`, { method: 'GET' });

        if (!presignResponse.ok) throw new Error(`Status ${presignResponse.status}`);

        const { uploadUrl } = await presignResponse.json();
        if (!uploadUrl) throw new Error('Keine Upload-URL erhalten');

        updateItemStatus('⏳ Wird hochgeladen...');
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': item.type },
          body: item.file
        });

        if (!uploadResponse.ok) throw new Error(`Upload Status ${uploadResponse.status}`);

        updateItemStatus('✓ Erfolgreich');
        successCount++;
      } catch (err) {
        updateItemStatus(`✗ ${err.message}`);
        errorCount++;
      }
    }

    setSummary(`${successCount} erfolgreich, ${errorCount} fehlgeschlagen.`);
    setStatus(errorCount === 0 ? 'success' : 'error');

    if (successCount > 0 && onUploadSuccess) {
      setTimeout(() => {
        onUploadSuccess();
      }, 3000);
    }
  };

  return (
    <div className="mt-5 rounded-lg border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[var(--color-surface-2)] p-4 text-[length:var(--text-sm)] shadow-sm"
         style={{ borderColor: status === 'error' ? 'color-mix(in srgb, #a12c7b 30%, transparent)' : status === 'success' ? 'color-mix(in srgb, #437a22 30%, transparent)' : undefined }}>
      <ul className="flex flex-col gap-1.5 list-none">
        {files.map((f, i) => (
          <li key={i}>{f.name} — {f.status}</li>
        ))}
      </ul>
      <span className="mt-2 block font-medium">{summary}</span>
      <div className="mt-4">
         <label
          htmlFor="fileUpload"
          className="inline-flex min-h-[40px] cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-text-inverse)] shadow-md transition hover:bg-[var(--color-primary-hover)]"
        >
          Weitere Dateien wählen
        </label>
        <input
          id="fileUpload"
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
          multiple
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
