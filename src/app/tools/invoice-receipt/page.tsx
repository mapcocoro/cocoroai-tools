import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import InvoiceReceiptTool from "./InvoiceReceiptTool";

const tool = getTool("invoice-receipt");
export const metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolLayout toolId="invoice-receipt">
      <InvoiceReceiptTool />
    </ToolLayout>
  );
}
