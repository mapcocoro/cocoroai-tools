import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import MultilingualMenuTool from "./MultilingualMenuTool";

const tool = getTool("multilingual-menu");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="multilingual-menu">
      <MultilingualMenuTool />
    </ToolLayout>
  );
}
