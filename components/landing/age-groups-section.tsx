import { Card } from "@/components/ui/card";
import { Baby, User, GraduationCap } from "lucide-react";
import { AGE_PRESETS } from "@/lib/constants/style-presets";

const ageIcons = {
  "3-6": Baby,
  "6-9": User,
  "9-12": GraduationCap,
};

export function AgeGroupsSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          适配不同年龄段
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          根据孩子的年龄自动调整故事难度和表达方式
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {AGE_PRESETS.map((age) => {
          const Icon = ageIcons[age.value as keyof typeof ageIcons];
          return (
            <Card
              key={age.value}
              className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 hover:-translate-y-1"
            >
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-amber-700 dark:text-amber-400">
                {age.label}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {age.description}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
