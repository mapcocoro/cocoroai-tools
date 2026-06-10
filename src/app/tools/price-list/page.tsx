import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import PriceListTool from "./PriceListTool";

const tool = getTool("price-list");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="price-list">
      <PriceListTool />
    </ToolLayout>
  );
}
