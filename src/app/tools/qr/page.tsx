import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

const tool = getTool("qr");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="qr">
      <div className="rounded-2xl border border-dashed border-line bg-card p-10 text-center text-sm text-ink-mute">
        ただいま準備中です。もうすぐ使えるようになります!
      </div>
    </ToolLayout>
  );
}
