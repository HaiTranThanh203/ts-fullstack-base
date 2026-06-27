export default async function Home() {
  let apiStatus = "Chưa kiểm tra";
  let apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "Chưa cấu hình";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/`,
      { cache: "no-store" }
    );
    apiStatus = res.ok
      ? `✅ Kết nối thành công (${res.status})`
      : `⚠️ Status: ${res.status}`;
  } catch {
    apiStatus = "❌ Không kết nối được backend";
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 thanhhaidev.me
          </h1>
          <p className="text-gray-400">Frontend đã deploy thành công</p>
        </div>

        <div className="grid gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">Frontend</p>
            <p className="text-lg font-semibold text-green-400">
              ✅ Next.js đang chạy
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">Backend API</p>
            <p className="text-lg font-semibold">{apiStatus}</p>
            <p className="text-xs text-gray-600 mt-1">{apiUrl}</p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm">
          NestJS + Next.js · Docker · Nginx · VPS
        </p>
      </div>
    </main>
  );
}
