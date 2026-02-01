import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              欢迎回来
            </h1>
            <p className="text-gray-600">
              登录 Story Craft 继续创作你的绘本
            </p>
          </div>
          <SignIn />
        </div>
      </div>
    </div>
  );
}
