"use client";

const LINES = [
  "Maybe you want to start a business.",
  "Maybe you want to get into sports.",
  "Maybe you're confused about your career.",
  "Maybe you're dealing with something you don't know how to handle.",
];

export function ProblemSection() {
  return (
    <section className="border-b-[1.5px] border-[#111] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">THE PROBLEM</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-[#111] sm:text-5xl md:text-6xl">
            Sometimes you don&apos;t know <span className="marker-yellow">who to ask.</span>
          </h2>
        </div>

        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          {LINES.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="pt-2 text-[#111]">
            You don&apos;t necessarily need another article or another AI-generated answer.
          </p>
          <p className="font-serif text-2xl text-[#111] sm:text-3xl">
            Sometimes you need someone who&apos;s actually been there.
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            <span className="sticker sticker-yellow">REAL EXPERIENCE</span>
            <span className="sticker sticker-mint">NOT JUST CONTENT</span>
            <span className="sticker sticker-white">HUMAN ANSWERS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
