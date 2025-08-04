import { InvoiceDetailPage } from "@/components/pages/invoice-detail-page";
import { getInvoice } from "@/app/actions";

export default async function InvoicePage({ params }: { params: { id: string } }) {
    const invoice = await getInvoice(params.id);

    if (!invoice) {
        return <div>Factura no encontrada</div>;
    }

    return <InvoiceDetailPage invoice={invoice} />;
}
