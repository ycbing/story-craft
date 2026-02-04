import {
  Header,
  HeroSection,
  FeaturesSection,
  ProcessSection,
  StylesShowcase,
  AgeGroupsSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function HomePage() {
  return (
    // 添加 selection: 样式，让用户选中文字时也符合绘本主题色
    <div className="min-h-screen selection:bg-orange-200 selection:text-orange-900 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      <Header />
      {/* 给 main 增加一个溢出隐藏，防止某些动画组件宽度溢出导致手机端左右晃动 */}
      <main className="overflow-x-hidden">
        <HeroSection />
        
        {/* 可以用间隔线或微弱的装饰物区分 Section */}
        <FeaturesSection />
        
        {/* 建议在这些展示类组件外包裹一个容器，控制最大宽度 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProcessSection />
          <StylesShowcase />
          <AgeGroupsSection />
        </div>
        
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
