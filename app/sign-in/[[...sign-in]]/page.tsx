import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      {/* 品牌标识可以放在组件上方 */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-orange-600">Story Craft</h2>
      </div>

      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-orange-500 hover:bg-orange-600 transition-all",
            card: "shadow-xl border border-orange-100",
            headerTitle: "text-gray-800",
            headerSubtitle: "text-gray-600"
          }
        }}
      />
    </div>
  );
}