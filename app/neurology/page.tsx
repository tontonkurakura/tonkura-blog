import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NeurologyContent from "./NeurologyContent";
import ScrollHandler from "./ScrollHandler";
import { redirect } from "next/navigation";

export default async function NeurologyPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  // 開発中のページなのでホームページにリダイレクト
  redirect("/");

  // searchParamsをawaitする
  const params = await searchParams;

  // デフォルトのタブ値を設定（URLパラメータがない場合は'anatomy'）
  const tab = params?.tab || "anatomy";

  return (
    <div className="max-w-7xl mx-auto px-6">
      <h1 className="text-3xl font-bold mb-8">Neurology Notes</h1>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8 h-auto p-1">
          <TabsTrigger value="anatomy" asChild>
            <a
              href="?tab=anatomy"
              className="flex flex-col items-center py-2 px-4 w-full min-h-[3rem]"
            >
              <span className="text-sm">解剖</span>
              <span className="text-xs text-gray-500">Neuroanatomy</span>
            </a>
          </TabsTrigger>
          <TabsTrigger value="disease" asChild>
            <a
              href="?tab=disease"
              className="flex flex-col items-center py-2 px-4 w-full min-h-[3rem]"
            >
              <span className="text-sm">疾患</span>
              <span className="text-xs text-gray-500">Diseases</span>
            </a>
          </TabsTrigger>
          <TabsTrigger value="symptoms" asChild>
            <a
              href="?tab=symptoms"
              className="flex flex-col items-center py-2 px-4 w-full min-h-[3rem]"
            >
              <span className="text-sm">症候</span>
              <span className="text-xs text-gray-500">Symptoms</span>
            </a>
          </TabsTrigger>
          <TabsTrigger value="tests" asChild>
            <a
              href="?tab=tests"
              className="flex flex-col items-center py-2 px-4 w-full min-h-[3rem]"
            >
              <span className="text-sm">検査</span>
              <span className="text-xs text-gray-500">Tests</span>
            </a>
          </TabsTrigger>
          <TabsTrigger value="treatments" asChild>
            <a
              href="?tab=treatments"
              className="flex flex-col items-center py-2 px-4 w-full min-h-[3rem]"
            >
              <span className="text-sm">治療</span>
              <span className="text-xs text-gray-500">Treatments</span>
            </a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anatomy">
          <ScrollHandler>
            <NeurologyContent basePath="Neuroanatomy" />
          </ScrollHandler>
        </TabsContent>

        <TabsContent value="disease">
          <ScrollHandler>
            <NeurologyContent basePath="Diseases" />
          </ScrollHandler>
        </TabsContent>

        <TabsContent value="symptoms">
          <ScrollHandler>
            <NeurologyContent basePath="Symptoms" />
          </ScrollHandler>
        </TabsContent>

        <TabsContent value="tests">
          <ScrollHandler>
            <NeurologyContent basePath="Examination" />
          </ScrollHandler>
        </TabsContent>

        <TabsContent value="treatments">
          <ScrollHandler>
            <NeurologyContent basePath="Treatment" />
          </ScrollHandler>
        </TabsContent>
      </Tabs>
    </div>
  );
}
