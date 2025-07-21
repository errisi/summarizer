'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Button,
  Card,
  Progress,
  message,
  Avatar,
  Tag,
  Input,
  Tooltip,
} from 'antd';
import {
  FileOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  FileTextOutlined,
  CopyOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import logoImg from '@/assets/logo.svg';
import avatarOne from '@/assets/32.jpg';
import avatarTwo from '@/assets/44.jpg';
import avatarThree from '@/assets/68.jpg';

const DEEPGRAM_API_KEY = '656f980aab3a728f113a1fa10c3ba654f33a5059';
const COHERE_API_KEY = 'GnCyJEnLyES8rznrgN1j3KvSFTIjpKP1VhghxeNO';

const summarizeCohere = async (text: string): Promise<string | null> => {
  const prompt = `You are an expert meeting summarizer. Carefully analyze the entire transcript below and generate a detailed summary in bullet points. 
Make sure to include all key points, important facts, numbers, and insights without leaving out any crucial information. 
Avoid generalizations and be specific. Use your own words but keep the meaning accurate.

Transcript:
${text}`;

  const res = await fetch('https://api.cohere.ai/v1/summarize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      length: 'long',
      format: 'bullets',
      extractiveness: 'low',
      model: 'summarize-xlarge',
    }),
  });

  const result = await res.json();
  if (res.ok && result.summary) {
    return result.summary;
  } else {
    console.warn('[Cohere warning]', result);
    return null;
  }
};

const summarizeText = async (text: string): Promise<string> => {
  const initialSummary = await summarizeCohere(text);

  if (initialSummary !== null) return initialSummary;

  console.warn(
    'Splitting input into smaller chunks due to summarization error.'
  );
  const midpoint = Math.floor(text.length / 2);
  const part1 = text.slice(0, midpoint);
  const part2 = text.slice(midpoint);

  const [summary1, summary2] = await Promise.all([
    summarizeCohere(part1),
    summarizeCohere(part2),
  ]);

  return `${summary1 ?? part1}\n\n${summary2 ?? part2}`;
};

const { Dragger } = Upload;
const { TextArea } = Input;

export const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState('');

  const draggerProps = {
    name: 'audio',
    multiple: false,
    accept: 'audio/*',
    beforeUpload: (file: File) => {
      setFile(file);
      setSummary('');
      return false;
    },
    onRemove: () => {
      setFile(null);
      setSummary('');
    },
    disabled: isProcessing,
    fileList: [],
  };

  const processAudio = async () => {
    if (!file) {
      message.error('Please upload an audio file first!');
      return;
    }

    setSummary('');

    setIsProcessing(true);

    const smoothProgress = (from: number, to: number, duration: number) => {
      return new Promise<void>(resolve => {
        const startTime = Date.now();
        const step = () => {
          const elapsed = Date.now() - startTime;
          const progressValue = Math.min(
            from + ((to - from) * elapsed) / duration,
            to
          );
          setProgress(progressValue);

          if (elapsed < duration) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        step();
      });
    };

    try {
      await smoothProgress(0, 10, 1000);

      const audioBuffer = await file.arrayBuffer();

      await smoothProgress(10, 30, 1000);

      const res = await fetch(
        'https://api.deepgram.com/v1/listen?smart_format=true',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${DEEPGRAM_API_KEY}`,
            'Content-Type': file.type || 'audio/mp3',
          },
          body: audioBuffer,
        }
      );

      const json = await res.json();
      const transcriptText =
        json?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

      if (!transcriptText) {
        throw new Error('Transcription failed or is empty');
      }

      await smoothProgress(30, 70, 1000);

      const summary = await summarizeText(transcriptText);

      setSummary(summary || 'Processing failed.');

      await smoothProgress(70, 100, 1000);
    } catch (err) {
      console.error(err);
      message.error('Processing failed.');
      setSummary('An error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(summary);
    message.success('Summary copied to clipboard!');
  };

  const downloadSummary = (): void => {
    const link = document.createElement('a');
    const blob = new Blob([summary], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.download = 'summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Summary downloaded!');
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      avatar: avatarTwo,
      quote:
        'This tool has saved me hours of note‑taking during team meetings. The summaries are accurate and highlight all the key points.',
    },
    {
      name: 'Michael Chen',
      role: 'CEO, TechStart Inc.',
      avatar: avatarOne,
      quote:
        "As a busy executive, I don't have time to review long recordings — this gives me just what I need.",
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      avatar: avatarThree,
      quote:
        'The action items feature is a game‑changer for our team. We never miss important follow‑ups from our strategy sessions anymore.',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <header className="text-center mb-12">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 flex flex-col md:flex-row justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-1 items-center justify-center mr-1">
              <img src={logoImg} alt="" className="w-10" />
              Brieflyzer
            </div>

            <span className="text-xl md:text-2xl text-gray-600">
              <span className="hidden md:inline">-</span> your AI Audio
              Summarizer
            </span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto text-balance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Turn any voice recording — from meetings to interviews — into
            structured, actionable summaries
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              bordered={false}
              bodyStyle={{ padding: 0, margin: 0 }}
              title={
                <span className="flex items-center">
                  <FileOutlined className="mr-2 text-blue-500" />
                  Upload Audio File
                </span>
              }
            >
              <div className="p-6">
                <Dragger {...draggerProps} className="bg-white ">
                  {file ? (
                    <div className="flex flex-col items-center py-10">
                      <CheckCircleOutlined className="text-4xl text-green-500 mb-3" />
                      <p className="text-lg font-medium text-gray-800  mb-1">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500 ">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10">
                      <UploadOutlined className="text-4xl text-gray-400  mb-3" />
                      <p className="text-lg font-medium text-gray-800  mb-1">
                        Drag & drop your audio file here
                      </p>
                      <p className="text-sm text-gray-500 ">
                        or click to browse (MP3, WAV, M4A)
                      </p>
                    </div>
                  )}
                </Dragger>
              </div>
              <div className="p-6 pt-0 text-right">
                <Button
                  type="primary"
                  disabled={!file || isProcessing}
                  onClick={processAudio}
                  icon={isProcessing ? <LoadingOutlined /> : undefined}
                >
                  {isProcessing ? 'Processing...' : 'Generate Summary'}
                </Button>
              </div>
            </Card>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <LoadingOutlined className="mr-2 text-blue-500" />
                        <span className="font-medium">
                          Processing your audio
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 ">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress percent={Math.round(progress)} showInfo={false} />
                    <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-500 ">
                      <div>Transcribing</div>
                      <div>Analyzing</div>
                      <div>Summarizing</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card
              title={
                <span className="flex items-center">
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  Summary
                </span>
              }
            >
              {summary ? (
                <div className="relative">
                  <TextArea
                    value={summary}
                    readOnly
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Tooltip title="Copy">
                      <Button
                        icon={<CopyOutlined />}
                        size="small"
                        onClick={copyToClipboard}
                      />
                    </Tooltip>
                    <Tooltip title="Download">
                      <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={downloadSummary}
                      />
                    </Tooltip>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-4 border-2 border-dashed rounded-lg border-gray-200 ">
                  <FileTextOutlined className="text-5xl text-gray-300  mb-4" />
                  <h3 className="text-lg font-medium text-gray-700  mb-2">
                    No Summary Yet
                  </h3>
                  <p className="text-gray-500 text-balance max-w-md">
                    Upload or drop any audio — meetings, interviews, lectures,
                    voice notes — and get a smart summary in seconds
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 ">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, quote }) => (
              <Card key={name} className="overflow-hidden">
                <div className="pt-6 flex items-start space-x-4">
                  <Avatar src={avatar} size={48} className="shadow-md" />
                  <div>
                    <p className="font-medium text-gray-800 ">{name}</p>
                    <p className="text-sm text-gray-500 ">{role}</p>
                  </div>
                </div>
                <blockquote className="mt-4 text-gray-600  italic">
                  "{quote}"
                </blockquote>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 ">
            Ready to save time on meeting notes?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-lg text-balance">
            Start summarizing your recordings — meetings, lectures, podcasts,
            voice notes — and focus on what really matters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Tag
              className="text-[1rem] p-2 rounded-lg"
              color="blue"
              icon={<ClockCircleOutlined />}
            >
              Save 90% of note‑taking time
            </Tag>
            <Tag
              className="text-[1rem] p-2 rounded-lg"
              color="green"
              icon={<CheckCircleOutlined />}
            >
              AI‑powered accuracy
            </Tag>
            <Tag
              className="text-[1rem] p-2 rounded-lg"
              color="purple"
              icon={<FileTextOutlined />}
            >
              Structured summaries
            </Tag>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
