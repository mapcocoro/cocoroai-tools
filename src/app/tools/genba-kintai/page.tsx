import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import GenbaKintaiTool from "./GenbaKintaiTool";

const tool = getTool("genba-kintai");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="genba-kintai">
      <GenbaKintaiTool />
    </ToolLayout>
  );
}
