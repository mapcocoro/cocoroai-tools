import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import QueueBoardTool from "./QueueBoardTool";

const tool = getTool("queue-board");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="queue-board">
      <QueueBoardTool />
    </ToolLayout>
  );
}
