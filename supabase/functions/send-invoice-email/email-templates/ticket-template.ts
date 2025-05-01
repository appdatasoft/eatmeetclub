
export function generateTicketInvoiceEmail({
  name,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  quantity,
  unitPrice,
  serviceFee,
  total,
  purchaseDate,
  receiptUrl
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Eat Meet Club Event Ticket Invoice</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
      }
      .container {
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #B5642A;
        margin-bottom: 5px;
      }
      .invoice-box {
        border: 1px solid #eee;
        padding: 20px;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      .event-details {
        background-color: #f0f0f0;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
      }
      .event-details h2 {
        margin-top: 0;
        color: #B5642A;
      }
      .event-detail-row {
        display: flex;
        margin-bottom: 8px;
      }
      .event-detail-label {
        font-weight: bold;
        width: 100px;
        flex-shrink: 0;
      }
      .invoice-details {
        margin-bottom: 20px;
      }
      .invoice-details table {
        width: 100%;
        border-collapse: collapse;
      }
      .invoice-details th,
      .invoice-details td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      .total {
        font-weight: bold;
        font-size: 1.1em;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 0.9em;
        color: #777;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #B5642A;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 15px;
      }
      .status {
        padding: 5px 10px;
        border-radius: 15px;
        display: inline-block;
        font-size: 0.8em;
        color: white;
        background-color: #28a745;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Eat Meet Club</h1>
        <p>Event Ticket Invoice</p>
      </div>
      
      <div class="invoice-box">
        <div class="invoice-details">
          <p><strong>Invoice Date:</strong> ${purchaseDate}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Status:</strong> <span class="status">Paid</span></p>
          
          <div class="event-details">
            <h2>${eventTitle}</h2>
            <div class="event-detail-row">
              <span class="event-detail-label">Date:</span>
              <span>${eventDate}</span>
            </div>
            <div class="event-detail-row">
              <span class="event-detail-label">Time:</span>
              <span>${eventTime}</span>
            </div>
            <div class="event-detail-row">
              <span class="event-detail-label">Location:</span>
              <span>${eventLocation}</span>
            </div>
            <div class="event-detail-row">
              <span class="event-detail-label">Tickets:</span>
              <span>${quantity}</span>
            </div>
          </div>
          
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Event Tickets (${quantity} x $${unitPrice.toFixed(2)})</td>
              <td>$${(unitPrice * quantity).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Service Fee</td>
              <td>$${serviceFee.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td>Total</td>
              <td>$${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center;">
          ${receiptUrl ? `<a href="${receiptUrl}" class="button" target="_blank">View Receipt</a>` : ''}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for your purchase! We're excited to see you at the event.</p>
        <p>For any questions about your tickets, please contact us at support@eatmeetclub.com</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
