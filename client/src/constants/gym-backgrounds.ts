/**
 * Danh sách các ảnh nền gym có sẵn trong /public/gym/.
 * Thêm ảnh mới bằng cách bỏ file vào public/gym/ rồi thêm vào đây.
 */
export const GYM_BACKGROUNDS = [
  {
    id: "gym-1",
    src: "/gym/gym-1.jpg",
    alt: "Đàn ông cơ bắp tập trong phòng gym ánh sáng mờ",
    credit: "Aldrich louis Alvarado — Unsplash",
  },
  {
    id: "gym-2",
    src: "/gym/gym-2.jpg",
    alt: "Người đàn ông tập pull-ups trong gym",
    credit: "Rodrigo Rodrigues — Unsplash",
  },
  {
    id: "gym-3",
    src: "/gym/gym-3.jpg",
    alt: "Đàn ông nâng tạ đơn khi tập",
    credit: "Praise Judah — Unsplash",
  },
  {
    id: "gym-4",
    src: "/gym/gym-4.jpg",
    alt: "Đàn ông nâng tạ qua đầu trong gym",
    credit: "Rodrigo Rodrigues — Unsplash",
  },
  {
    id: "gym-5",
    src: "/gym/gym-5.jpg",
    alt: "Đàn ông nâng tạ đòn trong phòng tối",
    credit: "David Beneš — Unsplash",
  },
  {
    id: "gym-6",
    src: "/gym/gym-6.jpg",
    alt: "Người tập push-ups trong ánh sáng mờ",
    credit: "Anastase Maragos — Unsplash",
  },
] as const;

export type GymBackgroundId = (typeof GYM_BACKGROUNDS)[number]["id"];

export function getGymBackground(id?: GymBackgroundId) {
  return (
    GYM_BACKGROUNDS.find((bg) => bg.id === id) ?? GYM_BACKGROUNDS[0]
  );
}