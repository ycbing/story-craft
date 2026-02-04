import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              创建账户
            </h1>
            <p className="text-gray-600">
              开始你的 AI 绘本创作之旅
            </p>
          </div>
          <SignUp />
        </div>
      </div>
    </div>
  );
}
