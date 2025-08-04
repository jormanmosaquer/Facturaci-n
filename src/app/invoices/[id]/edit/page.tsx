import { InvoiceEditPage } from "@/components/pages/invoice-edit-page";
import { getInvoice } from "@/app/actions";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
    const invoice = await getInvoice(params.id);

    if (!invoice) {
        return <div>Factura no encontrada</div>;
    }

    return <InvoiceEditPage invoice={invoice} />;
}
