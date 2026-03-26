type Props = {
  src: string;
  alt: string;
  widthClassName?: string;
};

export default function PhoneMockup({ src, alt, widthClassName = "w-[320px]" }: Props) {
  return (
    <div className={`relative mx-auto ${widthClassName} aspect-[310/640]`}>
      <div className="absolute inset-0 rounded-[52px] border border-[#8a93ad] bg-[#07090d] shadow-[0_16px_30px_rgba(0,0,0,0.25),inset_0_0_0_2px_rgba(255,255,255,0.08)]" />
      <div className="absolute left-1/2 top-[12px] z-40 h-[10px] w-[92px] -translate-x-1/2 rounded-full bg-[#2b303b]" />
      <div className="absolute inset-[10px] rounded-[44px] border border-[#2e3441]" />
      <div className="absolute inset-[18px_14px_16px_14px] z-30 overflow-hidden rounded-[34px] bg-black">
        <img alt={alt} className="h-full w-full object-cover object-top" src={src} />
      </div>
    </div>
  );
}
