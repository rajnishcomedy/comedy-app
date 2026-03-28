import { useState, useRef, useEffect } from 'react';
import { Mic, X, Check, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '../components/UI';
import { today } from '../utils';

export default function QuickCapture({ addIdea, toast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        let final = transcript;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(final);
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast?.error('Microphone access denied for transcription.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [transcript, toast]);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Audio Recording
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Transcription
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setTranscript('');
      setInterimTranscript('');
    } catch (err) {
      console.error('Capture start failed:', err);
      toast?.error('Could not access microphone.');
    }
  };

  const stopCapture = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSave = async () => {
    if (!transcript.trim() && chunksRef.current.length === 0) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      const audioBlob = chunksRef.current.length > 0 
        ? new Blob(chunksRef.current, { type: 'audio/webm' }) 
        : null;

      await addIdea({
        idea: transcript.trim() || "Untranscribed Voice Note",
        attitude: 'Weird',
        source: 'Quick Capture',
        angle: '',
        promoted: false,
        date: today(),
        _blob: audioBlob // useIdeas.js handles this
      });

      toast?.success('Idea captured!');
      setIsOpen(false);
      setTranscript('');
    } catch (err) {
      console.error('Quick capture save failed:', err);
      toast?.error('Failed to save idea.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--accent)', color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(200, 241, 53, 0.3)',
          border: 'none', cursor: 'pointer', zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
        title="Quick Capture (Audio + Text)"
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1001,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      padding: 20
    }}>
      <div className="card fade-in" style={{
        width: '100%', maxWidth: 500, padding: 32,
        background: 'var(--bg2)', border: '1px solid var(--border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: 24,
        display: 'flex', flexDirection: 'column', gap: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(200,241,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={20} color="var(--accent)" className={isRecording ? 'pulse' : ''} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Quick Capture</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{isRecording ? 'Listening for jokes...' : 'Ready to record'}</div>
            </div>
          </div>
          <button onClick={() => { stopCapture(); setIsOpen(false); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <textarea
          style={{
            minHeight: 160, padding: 20, borderRadius: 16,
            background: 'var(--bg3)', border: '1px solid var(--border)',
            fontSize: 18, lineHeight: 1.6, color: 'var(--text)',
            resize: 'vertical', width: '100%', outline: 'none',
            fontFamily: 'var(--sans)'
          }}
          placeholder={isRecording ? "I'm listening..." : "Tap the button and start speaking... or just type your idea here."}
          value={transcript + (interimTranscript ? ' ' + interimTranscript : '')}
          onChange={(e) => {
            setTranscript(e.target.value);
            setInterimTranscript('');
          }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          {!isRecording ? (
            <Button 
                variant="primary" 
                onClick={startCapture} 
                style={{ flex: 1, padding: '16px', borderRadius: 14, fontSize: 15 }} 
                icon={Mic}
            >
              Start Recording
            </Button>
          ) : (
            <Button 
                variant="danger" 
                onClick={stopCapture} 
                style={{ flex: 1, padding: '16px', borderRadius: 14, fontSize: 15 }} 
                icon={X} 
                className="pulse"
            >
              Stop
            </Button>
          )}
          
          <Button 
            variant="accent" 
            onClick={handleSave} 
            disabled={isRecording || isSaving || (!transcript && chunksRef.current.length === 0)}
            style={{ flex: 1, padding: '16px', borderRadius: 14, fontSize: 15 }}
          >
            {isSaving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>

        {!isRecording && transcript && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: 12, justifyContent: 'center' }}>
                <Check size={14} /> Transcript captured successfully
            </div>
        )}
      </div>
    </div>
  );
}
