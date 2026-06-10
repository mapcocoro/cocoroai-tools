import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import EstimateTool from "./EstimateTool";

const tool = getTool("estimate");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="estimate">
      <EstimateTool />
    </ToolLayout>
  );
}
