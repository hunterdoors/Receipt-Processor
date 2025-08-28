import { notFound } from "next/navigation"
import { ArrowLeft, Download, Printer, CheckCircle, XCircle, Clock, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'

// Mock function to fetch receipt data - replace with actual API call
async function getReceipt(id: string) {
  // In a real app, this would be an API call to your backend
  const receipts = [
    {
      id: '1',
      vendor: 'Office Supplies Inc.',
      amount: 125.99,
      date: '2023-04-15',
      status: 'approved',
      project: 'Office Supplies Q2',
      category: 'Office',
      description: 'Monthly office supplies including paper, pens, and notebooks',
      tax: 15.12,
      receiptNumber: 'INV-2023-0421',
      paymentMethod: 'Credit Card',
      receiptImage: '/receipt-placeholder.jpg',
      lineItems: [
        { description: 'Premium Paper (10 reams)', quantity: 2, unitPrice: 25.99, amount: 51.98 },
        { description: 'Ballpoint Pens (12 pack)', quantity: 3, unitPrice: 12.99, amount: 38.97 },
        { description: 'Spiral Notebooks', quantity: 5, unitPrice: 7.00, amount: 35.00 }
      ]
    },
    // Add more mock receipts as needed
  ]

  return receipts.find(receipt => receipt.id === id) || null
}

export default async function ReceiptDetailPage({ params }: { params: { id: string } }) {
  const receipt = await getReceipt(params.id)

  if (!receipt) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; icon: React.ReactNode; className: string }> = {
      approved: { 
        text: 'Approved', 
        icon: <CheckCircle className="h-4 w-4" />, 
        className: 'bg-green-100 text-green-800' 
      },
      pending: { 
        text: 'Pending Review', 
        icon: <Clock className="h-4 w-4" />, 
        className: 'bg-yellow-100 text-yellow-800' 
      },
      rejected: { 
        text: 'Rejected', 
        icon: <XCircle className="h-4 w-4" />, 
        className: 'bg-red-100 text-red-800' 
      },
    }
    
    const { text, icon, className } = statusMap[status] || { 
      text: 'Unknown', 
      icon: null, 
      className: 'bg-gray-100 text-gray-800' 
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}>
        {icon && <span className="mr-1.5">{icon}</span>}
        {text}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const subtotal = receipt.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const total = subtotal + receipt.tax

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/receipts" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Receipts
          </Link>
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold tracking-tight">Receipt #{receipt.receiptNumber}</h1>
            {getStatusBadge(receipt.status)}
          </div>
          <p className="text-muted-foreground">
            {new Date(receipt.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-9">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm" className="h-9">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vendor</p>
                    <p className="font-medium">{receipt.vendor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="font-medium">{receipt.project}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{receipt.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{receipt.paymentMethod}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{receipt.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receipt.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                <Image
                  src={receipt.receiptImage}
                  alt="Receipt"
                  width={500}
                  height={500}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="font-medium">{formatCurrency(receipt.tax)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {receipt.status === 'pending' && (
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" size="lg">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button className="flex-1" size="lg">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </div>
          )}

          {receipt.status === 'approved' && (
            <Button variant="outline" className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Export to QuickBooks
            </Button>
          )}

          <Button variant="outline" className="w-full text-destructive" size="lg">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Receipt
          </Button>
        </div>
      </div>
    </div>
  )
}
