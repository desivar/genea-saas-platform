import { Handle, Position } from 'reactflow';
import { HERITAGE_STICKERS } from '../constants/stickers';

interface ArtisticNodeProps {
  data: {
    name: string;
    lifespan?: string;
    photoUrl?: string;
    heritage?: string;
    gender?: 'Male' | 'Female' | 'Unknown';
  };
}
// ✅ Component uses the interface right here
export default function ArtisticNode({ data }: ArtisticNodeProps) {
  const sticker = HERITAGE_STICKERS[data.heritage ?? ''];

  const genderColor = {
    Male: 'bg-blue-50/40 border-blue-200',
    Female: 'bg-rose-50/40 border-rose-200',
    Unknown: 'bg-amber-50/40 border-stone-300'
  }[data.gender ?? 'Unknown'];

  return (
    <div className="relative flex flex-col items-center">
      {/* Invisible connection ports hidden behind our custom shapes */}
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {/* Elegant Circular Frame */}
      <div className="w-24 h-24 rounded-full bg-amber-50/40 p-1.5 border-2 border-stone-300 shadow-sm hover:border-amber-700/60 transition-all duration-500 flex items-center justify-center group relative">
        <div className="w-full h-full rounded-full bg-stone-100 overflow-hidden border border-stone-200">
          {data.photoUrl ? (
            <img src={data.photoUrl} alt={data.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50 text-xl font-light">📜</div>
          )}
        </div>

        {/* 🎨 Floating Sticker: Placed fluidly overlapping the bottom corner */}
        {sticker && (
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center text-lg transform hover:scale-120 hover:rotate-12 transition-all duration-300 cursor-help" title={sticker.label}>
            {sticker.icon.replace(/[a-zA-Z]/g, '')}
          </div>
        )}
      </div>

      {/* Minimalist Typographic Text below the frame */}
      <div className="text-center mt-2 w-32">
        <h5 className="text-stone-800 font-serif text-xs font-medium tracking-wide leading-tight">{data.name}</h5>
        <p className="text-stone-400 text-[10px] mt-0.5 tracking-wider font-light">{data.lifespan}</p>
      </div>

      / ...
<Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
