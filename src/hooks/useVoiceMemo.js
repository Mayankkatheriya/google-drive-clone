"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  blobToVoiceFile,
  formatRecordingDuration,
  getDefaultVoiceMemoName,
  getSupportedVoiceMimeType,
} from "@/lib/voiceMemo";

export function useVoiceMemo({ uploadFileDirect }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [duration, setDuration] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const blobRef = useRef(null);
  const mimeTypeRef = useRef("");

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  const resetRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    cleanupStream();
    clearPreview();
    blobRef.current = null;
    chunksRef.current = [];
    mimeTypeRef.current = "";
    setDuration(0);
    setStatus("idle");
    setError(null);
    setUploadProgress(0);
    setFileName(getDefaultVoiceMemoName());
  }, [cleanupStream, clearPreview]);

  const close = useCallback(() => {
    resetRecording();
    setOpen(false);
  }, [resetRecording]);

  const openModal = useCallback(() => {
    resetRecording();
    setOpen(true);
  }, [resetRecording]);

  useEffect(() => {
    if (!open) return undefined;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupStream();
    };
  }, [open, cleanupStream]);

  const startRecording = useCallback(async () => {
    setError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone recording is not supported in this browser.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedVoiceMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeTypeRef.current || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        blobRef.current = blob;
        clearPreview();
        setPreviewUrl(URL.createObjectURL(blob));
        setFileName(getDefaultVoiceMemoName(type));
        setStatus("recorded");
        cleanupStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setDuration(0);
      setStatus("recording");

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      cleanupStream();
      setError("Microphone access denied. Allow mic permission and try again.");
      setStatus("idle");
    }
  }, [cleanupStream, clearPreview]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }, []);

  const discardRecording = useCallback(() => {
    resetRecording();
  }, [resetRecording]);

  const uploadRecording = useCallback(async () => {
    const blob = blobRef.current;
    if (!blob) return;

    setStatus("uploading");
    setUploadProgress(0);

    const file = blobToVoiceFile(blob, fileName || getDefaultVoiceMemoName(blob.type));
    const success = await uploadFileDirect(file, fileName);

    if (success) {
      close();
      return;
    }

    setStatus("recorded");
    setUploadProgress(0);
  }, [fileName, uploadFileDirect, close]);

  return {
    open,
    openModal,
    close,
    status,
    duration,
    durationLabel: formatRecordingDuration(duration),
    fileName,
    setFileName,
    error,
    previewUrl,
    uploadProgress,
    startRecording,
    stopRecording,
    discardRecording,
    uploadRecording,
  };
}
