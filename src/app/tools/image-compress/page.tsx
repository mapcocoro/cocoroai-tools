import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import CompressTool from "./CompressTool";

const tool = getTool("image-compress");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="image-compress">
      <CompressTool />
    </ToolLayout>
  );
}
