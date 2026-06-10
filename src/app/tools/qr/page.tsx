import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import QrTool from "./QrTool";

const tool = getTool("qr");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="qr">
      <QrTool />
    </ToolLayout>
  );
}
