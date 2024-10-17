import React from "react";
import { X, Printer } from "lucide-react";

interface InvoiceProps {
  submission: {
    id: string;
    email: string;
    country: string;
    subject: string;
    price: number;
    submittedAt: string;
  };
  onClose: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ submission, onClose }) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${submission.id}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .invoice-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .invoice-title {
                font-size: 24px;
                font-weight: bold;
                color: #4F46E5;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              .total {
                font-weight: bold;
                text-align: right;
              }
              @media print {
                body {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <div>
                <div class="invoice-title">FACTURA</div>
                <div>${submission.id}</div>
              </div>
              <div>
                <div><strong>Tutorías Universitarias</strong></div>
                <div>soporte.tutoriasuniversitarias@gmail.com</div>
                <div>+34 608 83 72 72</div>
                <div>+1 849 270 1295</div>
              </div>
            </div>
            
            <div class="invoice-header">
              <div>
                <div><strong>Facturado a:</strong></div>
                <div>${submission.email}</div>
                <div>${submission.country}</div>
              </div>
              <div>
                <div><strong>Detalles de la factura:</strong></div>
                <div>Fecha de emisión: ${new Date(
                  submission.submittedAt
                ).toLocaleDateString()}</div>
                <div>Fecha de vencimiento: ${new Date(
                  new Date(submission.submittedAt).setDate(
                    new Date(submission.submittedAt).getDate() + 30
                  )
                ).toLocaleDateString()}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${submission.subject}</td>
                  <td>1</td>
                  <td>$${submission.price.toFixed(2)}</td>
                  <td>$${submission.price.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total">
              <strong>Total: $${submission.price.toFixed(2)}</strong>
            </div>
            
            <div>
              <h3>Términos y condiciones:</h3>
              <p>
                El pago debe realizarse en un plazo de 30 días. Esta factura incluye todos los impuestos aplicables.
                Para cualquier consulta relacionada con esta factura, por favor contacte a nuestro equipo de soporte.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666;">
              Gracias por confiar en Tutorías Universitarias para su éxito académico.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl p-4 sm:p-6 m-4">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Factura
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-blue-600 transition duration-300 flex items-center text-sm sm:text-base"
            >
              <Printer size={16} className="mr-1 sm:mr-2" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition duration-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-8 border rounded-lg bg-white overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start">
            <div className="mb-4 sm:mb-0">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600">
                FACTURA
              </div>
              <div className="text-gray-600 mt-1">{submission.id}</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-xl font-bold text-gray-800">
                Tutorías Universitarias
              </div>
              <div className="text-gray-600">
                soporte.tutoriasuniversitarias@gmail.com
              </div>
              <div className="text-gray-600">+34 608 83 72 72</div>
              <div className="text-gray-600">+1 849 270 1295</div>
            </div>
          </div>

          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="font-bold text-gray-800 mb-2">Facturado a:</div>
              <div className="text-gray-600">{submission.email}</div>
              <div className="text-gray-600">{submission.country}</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-bold text-gray-800 mb-2">
                Detalles de la factura:
              </div>
              <div className="text-gray-600">
                Fecha de emisión:{" "}
                {new Date(submission.submittedAt).toLocaleDateString()}
              </div>
              <div className="text-gray-600">
                Fecha de vencimiento:{" "}
                {new Date(
                  new Date(submission.submittedAt).setDate(
                    new Date(submission.submittedAt).getDate() + 30
                  )
                ).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mb-6 sm:mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-700">
                    Descripción
                  </th>
                  <th className="px-4 py-2 text-right text-gray-700">
                    Cantidad
                  </th>
                  <th className="px-4 py-2 text-right text-gray-700">Precio</th>
                  <th className="px-4 py-2 text-right text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-gray-600">
                    {submission.subject}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">1</td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    ${submission.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    ${submission.price.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6 sm:mb-8">
            <div className="w-full sm:w-1/2 md:w-1/3">
              <div className="flex justify-between border-t pt-4">
                <div className="px-4 py-2 font-bold text-gray-800">Total:</div>
                <div className="px-4 py-2 font-bold text-gray-800">
                  ${submission.price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 sm:pt-8">
            <div className="font-bold text-gray-800 mb-2">
              Términos y condiciones:
            </div>
            <p className="text-gray-600 text-sm">
              El pago debe realizarse en un plazo de 30 días. Esta factura
              incluye todos los impuestos aplicables. Para cualquier consulta
              relacionada con esta factura, por favor contacte a nuestro equipo
              de soporte.
            </p>
          </div>

          <div className="mt-6 sm:mt-8 text-center text-gray-500 text-sm">
            Gracias por confiar en Tutorías Universitarias para su éxito
            académico.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
