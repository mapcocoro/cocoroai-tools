import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import BreakEvenTool from "./BreakEvenTool";

const tool = getTool("break-even");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="break-even">
      <BreakEvenTool />
    </ToolLayout>
  );
}
