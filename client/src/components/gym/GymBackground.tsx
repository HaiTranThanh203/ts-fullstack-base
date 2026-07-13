import { getGymBackground, type GymBackgroundId } from "@/constants/gym-backgrounds";

interface GymBackgroundProps {
  id?: GymBackgroundId;
  /** Lớp phủ tối lên ảnh (0 = trong suốt, 1 = đen hoàn toàn). Mặc định 0.65 */
  overlay?: number;
  /** Cố định khi cuộn (parallax). Mặc định false */
  fixed?: boolean;
  /** Có hiển thị credit photographer ở góc dưới. Mặc định true */
  showCredit?: boolean;
  /** Class bổ sung cho section bao ngoài */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Section nền có ảnh gym kèm overlay tối, dùng cho hero / landing / login.
 * Dùng background-image CSS để đảm bảo render cả SSR và client.
 *
 * @example
 *   <GymBackground id="gym-1">
 *     <h1>Chào mừng</h1>
 *   </GymBackground>
 */
export function GymBackground({
  id,
  overlay = 0.65,
  fixed = false,
  showCredit = true,
  className = "",
  children,
}: GymBackgroundProps) {
  const bg = getGymBackground(id);

  return (
    <section
      className={`relative min-h-screen w-full overflow-hidden bg-[#121212] ${className}`}
    >
      {/* Layer 1: ảnh nền (CSS background) */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-no-repeat bg-center bg-cover ${fixed ? "bg-fixed" : ""}`}
        style={{ backgroundImage: `url("${bg.src}")`, zIndex: 0 }}
      />
      {/* Layer 2: overlay đen */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlay, zIndex: 1 }}
        aria-hidden
      />
      {/* Layer 3: content wrapper */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {children}
      </div>
      {/* Credit */}
      {showCredit && (
        <span
          className="absolute bottom-3 right-4 text-[10px] text-white/40 tracking-wide"
          style={{ zIndex: 3 }}
        >
          Photo: {bg.credit}
        </span>
      )}
    </section>
  );
}