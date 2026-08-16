"use client";

const MESSAGE = "BUILDING A COMMUNITY FOR PEOPLE WHO ARE FIGURING THINGS OUT";
const ITEMS = Array.from({ length: 10 }, () => MESSAGE);

export function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b-[1.5px] border-[#111] bg-[#111] text-[#F5F0E8]">
      <div className="announce-track flex w-max whitespace-nowrap py-2 font-mono text-[10px] font-medium tracking-[0.18em] sm:text-[11px]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {ITEMS.map((text, i) => (
              <span key={`${copy}-${i}`} className="inline-flex items-center gap-6 px-3">
                <span>{text}</span>
                <span aria-hidden>*</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
