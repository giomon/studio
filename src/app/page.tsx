'use client';

import {useRef, useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {extractOrderItems} from '@/ai/flows/extract-order-items';
import {transcribeAudio} from '@/ai/flows/transcribe-audio';
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [orderItems, setOrderItems] = useState<{item: string; quantity: number}[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          const audioBlob = new Blob([event.data], {type: 'audio/webm'});
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
        };

        recorder.onstop = async () => {
          if (audioURL) {
            try {
              const transcriptionResult = await transcribeAudio({audioUrl: audioURL});
              setTranscribedText(transcriptionResult.transcription);
            } catch (error) {
              console.error('Transcription error:', error);
            }
          }
        };

        setMediaRecorder(recorder);
      } catch (error) {
        console.error('Error initializing media recorder:', error);
      }
    };

    initializeRecorder();
  }, []);

  useEffect(() => {
    const extractOrder = async () => {
      if (transcribedText) {
        try {
          const extractionResult = await extractOrderItems({transcribedText: transcribedText});
          setOrderItems(extractionResult);
        } catch (error) {
          console.error('Order extraction error:', error);
        }
      }
    };
    extractOrder();
  }, [transcribedText]);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSendOrder = () => {
    alert('Order sent to manager!');
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Order Extractor</CardTitle>
          <CardDescription>Record the conversation to extract the order.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={startRecording}
              disabled={isRecording}
            >
              {isRecording ? 'Recording...' : 'Start Recording'}
            </Button>
            <Button
              variant="outline"
              onClick={stopRecording}
              disabled={!isRecording}
            >
              Stop Recording
            </Button>
          </div>

          {audioURL && (
            <audio controls src={audioURL} ref={audioRef}>
              Your browser does not support the audio element.
            </audio>
          )}

          <Textarea
            placeholder="Transcribed text"
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
          />

          <Table>
            <TableCaption>Extracted Order Items</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button onClick={handleSendOrder} className="w-full">
            Send Order to Manager
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
