import React, { useState, useRef } from 'react';
import { Modal } from '../components/UI';
import { Button } from '../components/UI';
import { Mic, Square, Play, Pause, RotateCcw, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { ATTITUDES, ATTITUDE_COLORS, today } from '../utils';

function fmtDur(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export function VoiceRecorderModal({ open, onClose, onSave }) {
  const [recState, setRecState] = useState('idle'); // idle | recording | done
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [label, setLabel] = useState('');
  const [attitude, setAttitude] = useState('Weird');
  const [errorMsg, setErrorMsg] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRef   = useRef(null);
  const chunksRef  = useRef([]);
  const timerRef   = useRef(null);
  const srRef      = useRef(null);
  const blobRef    = useRef(null);
  const playRef    = useRef(null);
  const rafRef     = useRef(null);
  const audioCtxRef = useRef(null);
  const isStartingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vol, setVol] = useState(1);

  const start = async () => {
    if (recState === 'recording' || isStartingRef.current) return;
    isStartingRef.current = true;
    setErrorMsg('');
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        blobRef.current = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blobRef.current));
        stream.getTracks().forEach(t => t.stop());
        setRecState('done');
      };

      recorder.start(100);
      setRecState('recording');

      // Audio Analyzer for Visualizer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      const src = audioCtx.createMediaStreamSource(stream);
      src.connect(analyser);
      analyser.fftSize = 128;
      const dataArr = new Uint8Array(analyser.frequencyBinCount);

      const updateVol = () => {
        analyser.getByteFrequencyData(dataArr);
        const sum = dataArr.reduce((a, b) => a + b, 0);
        const avg = sum / dataArr.length;
        setVol(1 + (avg / 255) * 0.8);
        rafRef.current = requestAnimationFrame(updateVol);
      };
      updateVol();

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Web Speech API — graceful degradation
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-IN';
        rec.onresult = e => {
          let final = '';
          for (let i = 0; i < e.results.length; i++) {
            if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
          }
          setTranscript(final.trim());
        };
        rec.onerror = () => {};
        rec.start();
        srRef.current = rec;
      }
    } catch (err) {
      const isDenied = err.name === 'NotAllowedError' || err.name === 'SecurityError';
      setPermissionDenied(isDenied);
      setErrorMsg(
        isDenied
          ? 'Microphone access denied. Please allow mic access and try again.'
          : 'Could not access microphone. Check your device settings and origin (must be HTTPS).'
      );
    } finally {
      isStartingRef.current = false;
    }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close();
    try { srRef.current?.stop(); } catch {} // eslint-disable-line no-empty
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop();
    }
  };

  const handlePlayPause = () => {
    if (!playRef.current) return;
    if (isPlaying) {
      playRef.current.pause();
      setIsPlaying(false);
    } else {
      playRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = () => {
    onSave({
      idea: transcript || label || 'Voice note',
      attitude,
      source: 'Voice Recording',
      angle: '',
      promoted: false,
      date: today(),
      label: label || `Recording ${fmtDur(duration)}`,
      audioURL: audioURL || null,
      _blob: blobRef.current,
    });
    handleClose();
  };

  const handleReRecord = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setRecState('idle');
    setDuration(0);
    setTranscript('');
    setAudioURL(null);
    blobRef.current = null;
  };

  const handleClose = () => {
    clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close();
    try { srRef.current?.stop(); } catch {} // eslint-disable-line no-empty
    try { if (mediaRef.current?.state === 'recording') mediaRef.current.stop(); } catch {} // eslint-disable-line no-empty
    if (audioURL) URL.revokeObjectURL(audioURL);
    blobRef.current = null;
    setAudioURL(null); setTranscript(''); setLabel(''); setAttitude('Weird');
    setDuration(0); setRecState('idle'); setErrorMsg(''); setIsPlaying(false); setVol(1);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Voice Idea Recorder" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Timer */}
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <motion.div 
            animate={{ 
              scale: recState === 'recording' ? vol : 1,
              boxShadow: recState === 'recording' ? `0 0 ${vol * 40}px rgba(255, 0, 85, ${0.2 * vol})` : '0 0 0px transparent'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: '50%',
              background: recState === 'recording' ? 'linear-gradient(135deg, rgba(255,0,85,0.15) 0%, rgba(255,76,76,0.2) 100%)' : 'rgba(255,255,255,0.04)',
              border: `2px solid ${recState === 'recording' ? 'var(--red)' : 'var(--border)'}`,
              marginBottom: 16,
            }} 
            className={recState === 'recording' ? 'pulse-ring' : ''}
          >
            <Mic size={28} color={recState === 'recording' ? 'var(--red)' : 'var(--text3)'} />
          </motion.div>

          <div style={{
            fontFamily: 'var(--mono)', fontSize: 52, fontWeight: 700,
            color: recState === 'recording' ? 'var(--red)' : 'var(--text)',
            letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {fmtDur(duration)}
          </div>

          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8 }}>
            {recState === 'idle' && 'ready to record'}
            {recState === 'recording' && '● recording — speak your idea'}
            {recState === 'done' && '✓ recording complete'}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {recState === 'idle' && (
            <Button onClick={start} variant="primary" icon={Mic} style={{ padding: '12px 32px', borderRadius: 999 }}>
              Start Recording
            </Button>
          )}
          {recState === 'recording' && (
            <Button onClick={stop} variant="danger" icon={Square} style={{ padding: '12px 32px', borderRadius: 999, background: 'var(--red)', borderColor: 'var(--red)' }}>
              Stop
            </Button>
          )}
          {recState === 'done' && (
            <Button onClick={handleReRecord} variant="ghost" icon={RotateCcw} style={{ borderRadius: 999 }}>
              Re-record
            </Button>
          )}
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(255,76,76,0.1)', border: '1px solid rgba(255,76,76,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span>{errorMsg}</span>
            {permissionDenied && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text3)', fontSize: 12 }}>
                  To resolve:
                  1) Allow microphone in browser prompt.
                  2) Reload page if your browser blocked it.
                  3) Check browser site permissions under security settings.
                </span>
                <Button onClick={start} variant="ghost" style={{ borderRadius: 8, color: 'var(--accent)' }}>Retry mic permission</Button>
              </div>
            )}
          </div>
        )}

        {/* Audio playback */}
        {audioURL && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <button
              onClick={handlePlayPause}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {isPlaying ? <Pause size={16} color="#0A0A0A" /> : <Play size={16} color="#0A0A0A" />}
            </button>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Playback — {fmtDur(duration)}</span>
            <audio
              ref={playRef} src={audioURL}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Transcript */}
        <div>
          <label style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
            Transcript / Edit Idea
          </label>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder={recState === 'idle' ? 'Live transcript will appear here during recording…' : 'Your idea text…'}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        {/* Label */}
        <div>
          <label style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
            Note Label (optional)
          </label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="E.g. Zomato bit, late night thought…"
          />
        </div>

        {/* Attitude */}
        <div>
          <label style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
            Attitude Tag
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {ATTITUDES.map(a => (
              <button
                key={a}
                onClick={() => setAttitude(a)}
                style={{
                  padding: '6px 14px', borderRadius: 999,
                  border: `1px solid ${attitude === a ? ATTITUDE_COLORS[a] : 'var(--border)'}`,
                  background: attitude === a ? `${ATTITUDE_COLORS[a]}15` : 'transparent',
                  color: attitude === a ? ATTITUDE_COLORS[a] : 'var(--text3)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
          <Button onClick={handleClose} variant="ghost">Cancel</Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={recState === 'recording' || (recState !== 'done' && !transcript.trim())}
            icon={recState === 'done' ? Upload : undefined}
          >
            Save to Idea Dump
          </Button>
        </div>
      </div>
    </Modal>
  );
}
