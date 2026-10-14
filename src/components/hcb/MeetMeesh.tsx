import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Globe,
  ImageUp,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface MeetMeeshProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  meta?: string;
  image?: {
    src: string;
    alt: string;
  };
}

interface ReplyDraft {
  text: string;
  meta?: string;
  promptPhotoUpload?: boolean;
}

interface TanPreviewResult {
  previewUrl: string;
  note: string;
}

const QUICK_PROMPTS = [
  'Why did you start House Call Bronze?',
  'Can spray tans protect me from sunburn?',
  'How do you make a tan look natural?',
  'What’s actually in the solution?',
  'Do you actually come to me?',
  'How do I book?',
];

const INTRO_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text:
    'Hi, I’m Meesh. Ask me anything about spray tans, House Call Bronze, or even a random question — I’ll answer what I can and look up public info when it helps.',
  meta: 'Ready to chat',
};

const TAN_PREVIEW_MESSAGE =
  'Upload a clothed photo and I’ll make a local spray-tan mockup. It stays in your browser, and it’s only a visual preview — not a guarantee of the final result.';

const PHOTO_PREVIEW_PROMPT = /see what (?:i|you|they) look like|what would (?:i|you|they) look like|spray tan preview|spray-tan preview|photo preview|upload a photo|upload photo|mockup|preview/i;

const normalize = (value: string) => value.trim().toLowerCase();

const MEESH_FAQS: Array<{
  test: RegExp;
  reply: (question: string) => ReplyDraft;
}> = [
  {
    test: /^(why|how) did you start|story behind|house call bronze/i,
    reply: () => ({
      text:
        'House Call Bronze grew out of Meesh wanting the glow she loved without the cost of too much sun. It’s built around a custom, skin-first approach to tanning so the result fits your life instead of forcing you to fit the tan.',
      meta: 'House Call Bronze',
    }),
  },
  {
    test: /sunburn|spay tans protect|spray tans protect|spray tan protect/i,
    reply: () => ({
      text:
        'No — spray tans are cosmetic, so they do not protect you from sunburn or UV damage. If you need sun protection, use SPF and other sun-safety habits; if you want the glow, I can help with the tan.',
      meta: 'Safety first',
    }),
  },
  {
    test: /natural|orange|too dark|look natural/i,
    reply: () => ({
      text:
        'Natural-looking color comes from matching the depth and undertone to your skin and the look you want. Meesh customizes the tan instead of using a one-shade-fits-everyone approach, which helps the result look like you — just bronzed.',
      meta: 'Custom color',
    }),
  },
  {
    test: /customi[sz]e|every tan|fit your skin|undertone|depth/i,
    reply: () => ({
      text:
        'Yes — every tan is customized. The depth and undertone are adjusted so the glow feels personal rather than generic.',
      meta: 'Custom mix',
    }),
  },
  {
    test: /what('?|’)s actually in the solution|sjolie|ingredients|olive|violet/i,
    reply: () => ({
      text:
        'Meesh sprays Sjolie. The color develops from DHA, and the line is vegan, PETA-approved, gluten-free, and free of parabens, mineral oil, urea, and added fragrance. Olive leans warmer and golden; violet leans richer and browner.',
      meta: 'Products',
    }),
  },
  {
    test: /come to me|house call|travel|hotel|home/i,
    reply: () => ({
      text:
        'Yes — that’s the House Call part. Meesh can come to your home, hotel, or wherever you feel most comfortable.',
      meta: 'Mobile service',
    }),
  },
  {
    test: /book|booking|how do i book|appointment/i,
    reply: () => ({
      text:
        'You can book right here on the site or text Meesh directly. If you want, I can also point you to the booking link after we chat.',
      meta: 'Book now',
    }),
  },
  {
    test: PHOTO_PREVIEW_PROMPT,
    reply: () => ({
      text:
        'Absolutely — upload a clothed photo and I’ll create a local spray-tan mockup so you can see the direction before booking. It stays in your browser and only appears after the image is generated.',
      meta: 'Photo preview',
      promptPhotoUpload: true,
    }),
  },
];

function stripMarkdown(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function buildMeeshReply(question: string): ReplyDraft | null {
  const q = normalize(question);
  const match = MEESH_FAQS.find((entry) => entry.test.test(q));
  if (match) return match.reply(question);

  if (/aftercare|prep|before|before i come|after i come/i.test(q)) {
    return {
      text:
        'I can help with general prep and aftercare, but I’d rather not invent specifics. If you want the exact instructions Meesh recommends for your appointment, send me a booking question and I’ll keep it focused on the tan you’re after.',
      meta: 'Prep + aftercare',
    };
  }

  return null;
}

function extractWikiTopic(question: string) {
  const cleaned = stripMarkdown(
    question
      .replace(/[?!.,;:()[\]{}"'`]/g, ' ')
      .replace(/\b(what|why|how|does|do|did|can|could|would|should|is|are|was|were|the|a|an|of|for|to|in|on|with|about|tell|me|you|please|explain|work|works|work?)\b/gi, ' ')
  );

  return cleaned.length > 2 ? cleaned : question.trim();
}

async function fetchWikipediaSummary(question: string): Promise<ReplyDraft | null> {
  const topic = extractWikiTopic(question);
  if (!topic) return null;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 7000);

  try {
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=1&namespace=0&format=json&origin=*`,
      { signal: controller.signal }
    );
    if (!searchResponse.ok) return null;

    const searchData = (await searchResponse.json()) as [string, string[], string[], string[]];
    const title = searchData?.[1]?.[0];
    if (!title) return null;

    const summaryResponse = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { signal: controller.signal }
    );
    if (!summaryResponse.ok) return null;

    const summaryData = (await summaryResponse.json()) as {
      extract?: string;
      description?: string;
      content_urls?: { desktop?: { page?: string } };
    };

    const extract = stripMarkdown(summaryData.extract ?? '');
    if (!extract) return null;

    const pageUrl = summaryData.content_urls?.desktop?.page;
    return {
      text: pageUrl
        ? `Here’s a public summary for “${title}”: ${extract}\n\nSource: ${pageUrl}`
        : `Here’s a public summary for “${title}”: ${extract}`,
      meta: 'Public web lookup',
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function buildAnswer(question: string): Promise<ReplyDraft> {
  const meeshReply = buildMeeshReply(question);
  if (meeshReply) return meeshReply;

  const wikiReply = await fetchWikipediaSummary(question);
  if (wikiReply) {
    return {
      text: `${wikiReply.text}\n\nIf you want, I can bring this back to your glow, your tan, or your booking.`,
      meta: wikiReply.meta,
    };
  }

  return {
    text:
      'I can’t verify that one from a reliable public source right now, so I don’t want to guess. If you want, ask me about spray tans, Meesh, or rephrase the question and I’ll try again.',
    meta: 'No guess',
  };
}

function shouldRevealPhotoUpload(text: string) {
  return PHOTO_PREVIEW_PROMPT.test(text);
}

function useWhoopSound(incoming?: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);

  return useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      const now = ctx.currentTime;

      if (incoming) {
        oscillator.frequency.setValueAtTime(420, now);
        oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.12);
      } else {
        oscillator.frequency.setValueAtTime(700, now);
        oscillator.frequency.exponentialRampToValueAtTime(430, now + 0.1);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.16);
    } catch {
      // Sound is optional. Never interrupt the conversation if unavailable.
    }
  }, [incoming]);
}

async function createTanPreview(file: File): Promise<TanPreviewResult> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not load the uploaded image.'));
      img.src = imageUrl;
    });

    const maxWidth = 1200;
    const scale = Math.min(1, maxWidth / image.naturalWidth);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Preview canvas is unavailable.');

    context.filter = 'contrast(1.03) saturate(1.08) brightness(0.99)';
    context.drawImage(image, 0, 0, width, height);
    context.filter = 'none';

    const source = context.getImageData(0, 0, width, height);
    const data = source.data;

    const clamp = (value: number) => Math.max(0, Math.min(255, value));
    const isSkinTone = (r: number, g: number, b: number) => {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      return (
        r > 95 &&
        g > 40 &&
        b > 20 &&
        max - min > 15 &&
        Math.abs(r - g) > 15 &&
        r > g &&
        r > b
      );
    };

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      if (alpha === 0) continue;

      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const warmLift = 0.16 + (1 - luminance) * 0.12;
      const tanBoost = isSkinTone(r, g, b) ? 1.1 : 0.22;

      data[i] = clamp(r * (1 - 0.15 * tanBoost) + 152 * tanBoost * warmLift);
      data[i + 1] = clamp(g * (1 - 0.2 * tanBoost) + 102 * tanBoost * warmLift);
      data[i + 2] = clamp(b * (1 - 0.26 * tanBoost) + 68 * tanBoost * warmLift);
    }

    context.putImageData(source, 0, 0);

    const tanGlow = context.createLinearGradient(0, 0, width, height);
    tanGlow.addColorStop(0, 'rgba(255, 228, 190, 0.14)');
    tanGlow.addColorStop(0.5, 'rgba(192, 125, 68, 0.28)');
    tanGlow.addColorStop(1, 'rgba(112, 69, 35, 0.12)');
    context.globalCompositeOperation = 'soft-light';
    context.fillStyle = tanGlow;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = 'rgba(130, 80, 42, 0.08)';
    context.fillRect(0, 0, width, height);

    const previewUrl = canvas.toDataURL('image/jpeg', 0.92);
    return {
      previewUrl,
      note:
        'Local spray-tan version created in your browser. It’s a visual guide, not an exact prediction.',
    };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function MeetMeesh({ onClose }: MeetMeeshProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [photoPreviewing, setPhotoPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [showReadStory, setShowReadStory] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const conversationRef = useRef<HTMLDivElement | null>(null);
  const draftRef = useRef<HTMLTextAreaElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const pendingTimerRef = useRef<number | null>(null);

  const outgoingSound = useWhoopSound(false);
  const incomingSound = useWhoopSound(true);

  const suggestedPrompts = useMemo(() => QUICK_PROMPTS, []);

  const scrollToBottom = useCallback(() => {
    window.setTimeout(() => {
      conversationRef.current?.scrollTo({
        top: conversationRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 40);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  useEffect(() => {
    draftRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) {
        window.clearTimeout(pendingTimerRef.current);
      }
    };
  }, []);

  const submitMessage = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || isThinking) return;

      if (soundOn) outgoingSound();

      setMessages((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: 'user', text: value },
      ]);
      setDraft('');
      setIsThinking(true);

      if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = window.setTimeout(async () => {
        const reply = await buildAnswer(value);
        if (reply.promptPhotoUpload || shouldRevealPhotoUpload(value)) {
          setShowPhotoUpload(true);
        }

        if (soundOn) incomingSound();

        setMessages((current) => [
          ...current,
          { id: `assistant-${Date.now()}`, role: 'assistant', text: reply.text, meta: reply.meta },
        ]);
        setIsThinking(false);
      }, 700);
    },
    [incomingSound, isThinking, outgoingSound, soundOn]
  );

  const handlePhotoChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      setPreviewError('');
      if (!photoConsent) {
        setPreviewError('Please confirm the photo is clothed and you have permission before uploading.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setPreviewError('Please upload a photo file.');
        return;
      }

      if (file.size > 12 * 1024 * 1024) {
        setPreviewError('Please use a photo smaller than 12 MB.');
        return;
      }

      setPhotoPreviewing(true);
      setMessages((current) => [
        ...current,
        {
          id: `user-photo-${Date.now()}`,
          role: 'user',
          text: 'I uploaded a clothed photo for a tan preview.',
          meta: 'Photo upload',
        },
      ]);

      try {
        const result = await createTanPreview(file);
        setMessages((current) => [
          ...current,
          {
            id: `assistant-photo-${Date.now()}`,
            role: 'assistant',
            text:
              'Here’s your spray-tanned version. It stays in this conversation, and it’s meant as a visual reference — not a promise of the exact final shade.',
            meta: result.note,
            image: {
              src: result.previewUrl,
              alt: 'Local spray tan preview mockup',
            },
          },
          {
            id: `assistant-photo-followup-${Date.now()}`,
            role: 'assistant',
            text:
              'What do you think? If you like the direction, I can help you book Meesh or send you to House Call Bronze to check for specials.',
            meta: 'Next step',
          },
        ]);
      } catch {
        setPreviewError('I couldn’t build the preview from that image. Please try another photo.');
      } finally {
        setPhotoPreviewing(false);
      }
    },
    [photoConsent]
  );

  const openPhotoPicker = useCallback(() => {
    if (!photoConsent) {
      setPreviewError('Please confirm the clothed-photo consent first.');
      return;
    }
    photoInputRef.current?.click();
  }, [photoConsent]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitMessage(draft);
    },
    [draft, submitMessage]
  );

  const bookWithMeesh = () => {
    onClose();

    window.setTimeout(() => {
      const bookButton = document.getElementById('book');
      if (bookButton instanceof HTMLElement) {
        bookButton.click();
        return;
      }

      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (showReadStory) {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#120c09]/95 px-5 py-8 text-left text-[#f7efe6] sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#f7efe6]/10 bg-[#1d130f]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-8">
          <p className="eyebrow">Meet Meesh</p>
          <h2 className="display mt-5 text-4xl text-[#f7efe6] sm:text-5xl">
            The story behind the <em className="italic text-bronze">glow.</em>
          </h2>

          <div className="mt-8 space-y-6 text-[15px] leading-[1.9] text-[#f7efe6]/78">
            <p>
              I’m Meesh, and House Call Bronze started with something I’ve always loved — that effortless, sun-kissed glow.
            </p>
            <p>
              I was born in California, and a love for sun-kissed skin has stayed with me ever since. It makes me feel beautiful. It makes me feel confident. I wanted other women to have that feeling too.
            </p>
            <p>
              But after experiencing the effects of sun damage and navigating my own skin challenges, I began to see tanning differently.
            </p>
            <p>
              I still wanted the warmth of a beautiful tan. I just no longer wanted that glow at the expense of my skin.
            </p>
            <p className="border-l border-gold pl-5 font-serif text-2xl italic leading-snug text-[#f7efe6]">
              So I went looking for a better way.
            </p>
            <p>
              That search became House Call Bronze — a tan designed around you, your skin, and your life.
            </p>
            <p>
              Every tan is customized for your skin tone, the depth you want, and the look you feel your best in.
            </p>
            <p className="border-l border-gold pl-5 font-serif text-2xl italic leading-snug text-[#f7efe6]">
              Your tan should fit your life, not the other way around.
            </p>
            <p>
              No UV. Just glow. And because luxury should feel effortless, your tan is finished wherever you feel most comfortable.
            </p>
          </div>

          <button type="button" onClick={() => setShowReadStory(false)} className="btn-primary mt-10">
            Have the conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_50%_0%,rgba(168,134,79,0.18),transparent_34%)]">
      <div className="flex h-full w-full flex-col bg-[#140e0b] backdrop-blur-sm">
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#f7efe6]/10 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-[#1f140f] font-serif text-lg italic text-gold">
              M
            </div>
            <div>
              <p className="font-serif text-lg leading-none text-[#f7efe6]">Meesh</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-gold">
                House Call Bronze
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundOn((current) => !current)}
              aria-label={soundOn ? 'Mute conversation sounds' : 'Enable conversation sounds'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f7efe6]/15 text-[#f7efe6]/70 transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {soundOn ? (
                <Volume2 className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <VolumeX className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Meet Meesh"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f7efe6]/15 text-[#f7efe6]/70 transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div ref={conversationRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-end">
            <div className="mb-8 text-center">
              <p className="text-[9px] uppercase tracking-[0.35em] text-gold/80">
                A conversation with Meesh
              </p>
              <p className="mt-2 font-serif text-sm italic text-[#f7efe6]/48">
                Ask anything — I’ll keep the history visible.
              </p>
            </div>

            <div className="space-y-4" role="log" aria-live="polite" aria-relevant="additions text">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] sm:max-w-[82%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-[24px] px-4 py-4 text-[15px] leading-[1.75] shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:px-5 ${
                        message.role === 'user'
                          ? 'rounded-br-[8px] bg-[#b97841] text-[#140d09]'
                          : 'rounded-bl-[8px] border border-[#f7efe6]/12 bg-[#f7f1e8] text-[#25170f]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      {message.image && (
                        <img
                          src={message.image.src}
                          alt={message.image.alt}
                          className="mt-4 w-full rounded-[18px] border border-[#281a12]/10 object-cover"
                        />
                      )}
                    </div>
                    <div
                      className={`mt-1.5 text-[10px] uppercase tracking-[0.18em] ${
                        message.role === 'user' ? 'pr-2 text-right text-[#f7efe6]/55' : 'pl-2 text-[#f7efe6]/62'
                      }`}
                    >
                      {message.meta ?? (message.role === 'user' ? 'You' : 'Meesh')}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="rounded-[24px] rounded-bl-[8px] border border-[#f7efe6]/10 bg-[#f5efe5] px-5 py-4 text-[#281a12]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#8c623f] [animation-delay:-0.25s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#8c623f] [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#8c623f]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showPhotoUpload ? (
              <div className="mt-6 rounded-[28px] border border-[#f7efe6]/10 bg-[#f7f1e8] p-4 text-[#25170f] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#7b5f4c]">
                  <ImageUp className="h-3.5 w-3.5 text-[#8c623f]" />
                  Tan preview photo
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#5f4638]">
                  {TAN_PREVIEW_MESSAGE}
                </p>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[18px] border border-[#281a12]/10 bg-white/90 p-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    checked={photoConsent}
                    onChange={(event) => setPhotoConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#8c623f] text-[#8c623f] focus:ring-[#8c623f]"
                  />
                  <span>
                    I confirm this is a clothed photo of an adult user, and I want a local spray-tan visual mockup.
                  </span>
                </label>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={openPhotoPicker}
                    disabled={!photoConsent || photoPreviewing}
                    className="inline-flex items-center gap-2 rounded-full bg-[#8c623f] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#fff8ef] transition hover:bg-[#a26e43] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {photoPreviewing ? 'Building preview…' : 'Upload photo'}
                  </button>
                  <span className="text-[11px] leading-snug text-[#7b5f4c]">
                    Processed locally in your browser.
                  </span>
                </div>
                {previewError && <p className="mt-3 text-sm text-[#9b4c3f]">{previewError}</p>}
              </div>
            ) : (
              <div className="mt-6 rounded-[28px] border border-[#f7efe6]/10 bg-[#1b120e] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#f7efe6]/45">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  Ask for a preview
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#f7efe6]/70">
                  Ask what you’d look like with a spray tan, and I’ll unlock the photo mockup.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void submitMessage(prompt)}
                      className="rounded-full border border-[#f7efe6]/12 bg-[#f7efe6]/8 px-3.5 py-2 text-left text-[12px] leading-tight text-[#f7efe6]/88 transition hover:border-gold hover:bg-[#f7efe6]/14 hover:text-[#fff6ea] focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="relative z-10 shrink-0 border-t border-[#f7efe6]/10 bg-[#100b09] px-4 py-4 backdrop-blur-md sm:px-8"
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
            <label htmlFor="meesh-message" className="sr-only">
              Ask Meesh anything
            </label>
            <textarea
              id="meesh-message"
              ref={draftRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void submitMessage(draft);
                }
              }}
              rows={2}
              placeholder="Ask about spray tans, Meesh, or anything else you want to know…"
              className="min-h-[84px] w-full resize-none rounded-[22px] border border-[#f7efe6]/12 bg-[#f7f1e8] px-4 py-3 text-[15px] leading-relaxed text-[#25170f] placeholder:text-[#7a6655] focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowReadStory(true)}
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#f7efe6]/42 transition hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
              >
                Read instead
                <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={bookWithMeesh}
                  className="inline-flex items-center gap-2 rounded-full border border-[#f7efe6]/12 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#f7efe6]/72 transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  Book now
                </button>
                <button
                  type="submit"
                  disabled={!draft.trim() || isThinking}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-5 text-[10px] uppercase tracking-[0.2em] text-[#1f130d] shadow-[0_0_25px_rgba(168,134,79,0.3)] transition hover:bg-[#d5ae73] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#f7efe6]"
                >
                  Send
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#f7efe6]/34">
              <Globe className="h-3.5 w-3.5 text-gold" />
              Answers stay in the thread, and public info is looked up when helpful.
            </div>
          </div>
        </form>
        <div className="sr-only" aria-live="polite">
          {isThinking ? 'Meesh is typing' : 'Conversation ready'}
        </div>
      </div>
    </div>
  );
}
