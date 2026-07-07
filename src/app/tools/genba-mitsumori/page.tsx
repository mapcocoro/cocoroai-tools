import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import GenbaTool from "./GenbaTool";

const tool = getTool("genba-mitsumori");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="genba-mitsumori">
      <GenbaTool />
    </ToolLayout>
  );
}
