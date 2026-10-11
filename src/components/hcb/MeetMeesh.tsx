import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Volume2, VolumeX, X } from 'lucide-react';

interface MeetMeeshProps {
  onClose: () => void;
}

type Phase =
  | 'typing-question'
  | 'ready'
  | 'sending'
  | 'read'
  | 'meesh-typing'
  | 'replying'
  | 'done';

interface Step {
  question: string;
  replies: string[];
}

const STEPS: Step[] = [
  {
    question: 'Why did you start House Call Bronze?',
    replies: [
      'Honestly? It started with something I’ve always loved — that effortless, sun-kissed glow.',
      'I was born in California, so loving bronzed skin has kind of always been part of me.',
      'But eventually, my relationship with tanning changed.',
      'I still wanted the confidence and warmth of a beautiful tan. I just didn’t want it at the expense of my skin.',
    ],
  },
  {
    question: 'can spay tans protect me from sunburn?',
    replies: [
      'No. Since Sunless Tanning is cosmetic, it doesnt have the ability to protect you from harmful rays.',
      'After experiencing the effects of sun damage and navigating my own skin challenges, I started looking for a better way.',
      'I realized I didn’t have to give up the glow I loved. I just needed a different way to get it.',
    ],
  },
  {
    question: 'So what made you decide spray tanning was the answer?',
    replies: [
      'I wanted something that could actually fit into real life.',
      'Something personalized. Something beautiful. And something that didn’t require hours in the sun.',
      'That search became House Call Bronze.',
      'Your tan should fit your life, not the other way around.',
    ],
  },
  {
    question: 'Okay, but how do you make the tan look natural?',
    replies: [
      'I don’t believe in one-color-fits-all tanning.',
      'Your skin tone, the depth you want, and the way you want your tan to look all matter.',
      'So I look at you first, then I customize the solution around you.',
      'The goal is simple: people should notice that you look amazing — not wonder why you look orange.',
    ],
  },
  {
    question: 'So you actually customize every tan?',
    replies: [
      'Every single one.',
      'I can adjust the depth and the undertone so your tan feels like yours.',
      'Some people want a soft golden glow. Some want a deeper, richer bronze.',
      'There’s no reason your tan should look like everyone else’s.',
    ],
  },
  {
    question: 'What’s actually in the solution you’re spraying?',
    replies: [
      'I spray Sjolie.',
      'The color comes from DHA derived from sugar beets and sugar cane, and it develops brown instead of orange.',
      'It’s vegan, PETA-approved, gluten-free, and free of parabens, mineral oil, urea, and added fragrance.',
      'It also has aloe and vitamins C and E to help keep your skin comfortable while it develops.',
    ],
  },
  {
    question: 'And what’s the difference between the olive and violet finishes?',
    replies: [
      'The olive base gives you more of that warm, golden finish.',
      'The violet base gives you a richer brown.',
      'I choose the direction that works best with your skin and the look you’re going for.',
      'That’s the fun part — we make it yours.',
    ],
  },
  {
    question: 'Wait… you actually come to me?',
    replies: [
      'Yes. That’s the whole House Call part.',
      'Your place or mine.',
      'Home, hotel, getting ready for an event — wherever you feel most comfortable.',
      'Luxury should feel effortless. You shouldn’t have to rearrange your entire day around your tan.',
    ],
  },
  {
    question: 'Okay Meesh… I’m interested. How do I book?',
    replies: [
      'Easy.',
      'You can book right here on the site, or text me directly.',
      'Tell me what you’re looking for, and we’ll figure out the perfect glow for you.',
      'I can’t wait to meet you.',
    ],
  },
];

function Typewriter({
  text,
  speed = 38,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState('');
  const completeRef = useRef(false);

  useEffect(() => {
    setDisplayed('');
    completeRef.current = false;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        if (!completeRef.current) {
          completeRef.current = true;
          onComplete?.();
        }
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed, onComplete]);

  return <>{displayed}</>;
}

function WhoopSound({ incoming }: { incoming?: boolean }) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
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

  return { play };
}

export default function MeetMeesh({ onClose }: MeetMeeshProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing-question');
  const [sentQuestion, setSentQuestion] = useState('');
  const [visibleReplies, setVisibleReplies] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [showReadStory, setShowReadStory] = useState(false);

  const conversationRef = useRef<HTMLDivElement | null>(null);
  const question = STEPS[stepIndex]?.question ?? '';
  const replies = STEPS[stepIndex]?.replies ?? [];

  const outgoingSound = WhoopSound({ incoming: false });
  const incomingSound = WhoopSound({ incoming: true });

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
  }, [visibleReplies, phase, sentQuestion, scrollToBottom]);

  const questionFinished = useCallback(() => {
    window.setTimeout(() => {
      setPhase('ready');
    }, 300);
  }, []);

  const sendQuestion = useCallback(() => {
    if (phase !== 'ready') return;

    if (soundOn) {
      outgoingSound.play();
    }

    setSentQuestion(question);
    setPhase('sending');

    window.setTimeout(() => {
      setPhase('read');

      window.setTimeout(() => {
        setPhase('meesh-typing');

        window.setTimeout(() => {
          if (soundOn) {
            incomingSound.play();
          }

          setPhase('replying');
          let replyIndex = 0;

          const revealNext = () => {
            if (replyIndex >= replies.length) {
              if (stepIndex >= STEPS.length - 1) {
                setPhase('done');
              } else {
                window.setTimeout(() => {
                  setSentQuestion('');
                  setVisibleReplies([]);
                  setStepIndex((current) => current + 1);
                  setPhase('typing-question');
                }, 900);
              }
              return;
            }

            setVisibleReplies((current) => [...current, replies[replyIndex]]);
            replyIndex += 1;
            window.setTimeout(revealNext, 850);
          };

          revealNext();
        }, 1300);
      }, 700);
    }, 650);
  }, [phase, question, replies, soundOn, outgoingSound, incomingSound, stepIndex]);

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
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-espresso/95 px-5 py-8 text-left text-white sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-espresso/90 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-8">
          <p className="eyebrow">Meet Meesh</p>
          <h2 className="display mt-5 text-4xl text-espresso sm:text-5xl">
            The story behind the <em className="italic text-bronze">glow.</em>
          </h2>

          <div className="mt-8 space-y-6 text-[15px] leading-[1.9] text-espresso/75">
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
            <p className="border-l border-gold pl-5 font-serif text-2xl italic leading-snug text-espresso">
              So I went looking for a better way.
            </p>
            <p>
              That search became House Call Bronze — a tan designed around you, your skin, and your life.
            </p>
            <p>
              Every tan is customized for your skin tone, the depth you want, and the look you feel your best in.
            </p>
            <p className="border-l border-gold pl-5 font-serif text-2xl italic leading-snug text-espresso">
              Your tan should fit your life, not the other way around.
            </p>
            <p>
              No UV. Just glow. And because luxury should feel effortless, your tan is finished wherever you feel most comfortable.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReadStory(false)}
            className="btn-primary mt-10"
          >
            Have the conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_50%_0%,rgba(168,134,79,0.12),transparent_38%)]">
      <div className="flex h-full w-full flex-col bg-espresso/90 backdrop-blur-sm">
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-espresso font-serif text-lg italic text-gold">
              M
            </div>
            <div>
              <p className="font-serif text-lg leading-none text-cream">Meesh</p>
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div
          ref={conversationRef}
          className="relative z-10 flex-1 overflow-y-auto px-5 py-8 sm:px-8"
        >
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-end">
            <div className="mb-8 text-center">
              <p className="text-[9px] uppercase tracking-[0.35em] text-gold/80">
                The story behind the glow
              </p>
              <p className="mt-2 font-serif text-sm italic text-white/45">
                A conversation with Meesh
              </p>
            </div>

            {sentQuestion && (
              <div className="mb-5 flex justify-end">
                <div className="max-w-[85%]">
                  <div className="rounded-[24px] rounded-br-[7px] bg-[#8a5a38] px-5 py-3.5 text-[15px] leading-relaxed text-white shadow-lg">
                    {sentQuestion}
                  </div>
                  <div className="mt-1.5 pr-2 text-right text-[10px] text-white/35">
                    {phase === 'sending' && 'Sending…'}
                    {phase === 'read' && 'Read'}
                    {phase === 'meesh-typing' && 'Read'}
                    {phase === 'replying' && 'Read'}
                    {phase === 'done' && 'Read'}
                  </div>
                </div>
              </div>
            )}

            {visibleReplies.length > 0 && (
              <div className="mb-6 space-y-2.5">
                {visibleReplies.map((reply, index) => (
                  <div
                    key={`${stepIndex}-${index}`}
                    className="flex justify-start"
                  >
                    <div className="max-w-[88%] rounded-[22px] rounded-bl-[7px] border border-white/10 bg-white/[0.08] px-5 py-3.5 text-[15px] leading-[1.65] text-white/90 shadow-lg backdrop-blur-sm">
                      {reply}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {phase === 'meesh-typing' && (
              <div className="mb-6 flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-[20px] rounded-bl-[7px] bg-white/[0.08] px-5 py-4">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
                </div>
                <span className="text-[10px] text-white/35">Meesh is typing…</span>
              </div>
            )}

            {phase === 'typing-question' && (
              <div className="mt-4 flex justify-end">
                <div className="max-w-[88%]">
                  <div className="rounded-[24px] rounded-br-[7px] bg-[#8a5a38]/80 px-5 py-3.5 text-[15px] leading-relaxed text-white/95">
                    <Typewriter key={stepIndex} text={question} onComplete={questionFinished} />
                  </div>
                </div>
              </div>
            )}

            {phase === 'ready' && (
              <div className="mt-5 flex flex-col items-end">
                <div className="max-w-[88%] rounded-[24px] rounded-br-[7px] bg-[#8a5a38] px-5 py-3.5 text-[15px] leading-relaxed text-white shadow-lg">
                  {question}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span className="animate-pulse text-[10px] uppercase tracking-[0.18em] text-gold">
                    Tap to send
                  </span>
                  <button
                    type="button"
                    onClick={sendQuestion}
                    aria-label={`Send: ${question}`}
                    className="group flex h-12 w-12 items-center justify-center rounded-full bg-gold text-espresso shadow-[0_0_25px_rgba(168,134,79,0.35)] transition duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(168,134,79,0.5)] focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <ArrowRight
                      className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={1.7}
                    />
                  </button>
                </div>
              </div>
            )}

            {phase === 'done' && (
              <div className="mt-8 border-t border-white/10 pt-8 text-center">
                <p className="font-serif text-2xl italic text-cream sm:text-3xl">
                  Okay. Now you know me.
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55">
                  Whenever you’re ready, I’d love to create your glow.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button type="button" onClick={bookWithMeesh} className="btn-primary">
                    Book with Meesh
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReadStory(true)}
                    className="btn-ghost border-white/20 text-white hover:border-gold hover:text-gold"
                  >
                    Read the story
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 shrink-0 border-t border-white/10 bg-black/40 px-5 py-4 text-center backdrop-blur-md">
          <button
            type="button"
            onClick={() => setShowReadStory(true)}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 transition hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            Read instead
            <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
