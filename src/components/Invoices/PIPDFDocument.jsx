import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Font
} from '@react-pdf/renderer';
import { ToWords } from 'to-words';

// Register Urbanist font
Font.register({
  family: 'Urbanist',
  fonts: [
    {
      src: '/fonts/Urbanist-Regular.ttf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/Urbanist-Medium.ttf',
      fontWeight: 'medium',
    },
    {
      src: '/fonts/Urbanist-SemiBold.ttf',
      fontWeight: 'semibold',
    },
    {
      src: '/fonts/Urbanist-Bold.ttf',
      fontWeight: 'bold',
    },
    {
      src: '/fonts/Urbanist-Italic.ttf', // Added italic variant
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    {
      src: '/fonts/Urbanist-BoldItalic.ttf', // Added bold-italic variant
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0.00';
  
  // Handle string inputs and remove any existing formatting
  const numAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.-]/g, '')) 
    : Number(amount);
  
  if (isNaN(numAmount)) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});

// Create styles with pixel-perfect measurements
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Urbanist',
    lineHeight: 1.3,
    padding: 10,
  },
  outerBorder: {
    border: '1pt solid #6b7280',
    margin: 15,
    padding: 0,
    flex: 1,
  },
  // Header Section
  header: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
    alignItems: 'center',
  },
  logoContainer: {
    width: '30%',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    paddingRight: 15,
    backgroundColor: '#f1f5f9',
  },
  logo: {
    height: 50,
  },
  companyInfo: {
    width: '70%',
    borderLeft: '1pt solid #6b7280',
    padding: 10,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
    color: '#0f172a',
  },
  companyAddress: {
    fontSize: 8,
    marginBottom: 1,
    maxWidth: 350,
    color: '#4b5563',
    fontWeight: 400,
  },
  
  // Title Section
  titleSection: {
    borderBottom: '1pt solid #6b7280',
    paddingBottom: 5,
    paddingTop: 3,
    alignItems: 'center',
    display:'flex',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#000',
    letterSpacing: 1,
  },
  
  // Invoice Info Section
  invoiceInfo: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
  },
  invoiceInfoColumn: {
    width: '50%',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  invoiceInfoLeft: {
    borderRight: '1pt solid #6b7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: 600,
    width: '35%',
    color: '#000',
    fontSize: 9,
  },
  infoValue: {
    width: '65%',
    color: '#000',
    fontSize: 9,
    fontWeight: 400,
  },
  
  // Address Header
  addressHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
    backgroundColor: '#f1f5f9',
  },
  addressHeaderCell: {
    width: '50%',
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#1e293b',
    fontSize: 9,
    textAlign: "left",
  },
  
  rightBorder: {
    borderRight: '1pt solid #6b7280',
  },
  // Address Content
  addressContent: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
    minHeight: 85,
  },
  addressCell: {
    width: '50%',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  firmName: {
    fontWeight: 600,
    marginBottom: 2,
    color: '#0f172a',
    fontSize: 9,
  },
  addressText: {
    marginBottom: 2,
    color: '#4b5563',
    fontSize: 8,
    fontWeight: 400,
  },
  gstText: {
    marginTop: 2,
    fontWeight: 500,
    color: '#1f2937',
    fontSize: 9,
  },
  
  // Table Styles
  tableContainer: {
    borderBottom: '1pt solid #6b7280',
  },
  table: {
    width: '100%',
    display: 'table',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #d1d5db',
    minHeight: 32,
  },
  tableCol: {
    borderRight: '1pt solid #d1d5db',
    padding: 4,
    color: '#6b7280',
    justifyContent: 'center',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'semibold',
    textTransform: 'uppercase',
    fontSize: 8,
    color: '#4b5563',
  },
  rightBorder2: {
    borderRight: 'none',
  },
  // Column Widths
  colIndex: { width: '5%' },
  colDescription: { width: '35%' },
  colQty: { width: '8%' },
  colUnitWithGst: { width: '12%' },
  colUnitWithoutGst: { width: '12%' },
  colGst: { width: '8%' },
  colAmount: { width: '12%' },
  
  // Text Alignment
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },
  
  tBody: {
    minHeight: '100'
  },
  // Product Styles
  productName: {
    fontWeight: 700,
    marginBottom: 1,
    color: '#1f2937',
    fontSize: 9,
  },
  productDescription: {
    fontSize: 8,
    color: '#6b7280',
    fontWeight: 400,
  },
  // Subtotal Header
  subtotalLeft: {
     width: '60%',
     borderRight: '1pt solid #6b7280',
     display: 'flex', 
     flexDirection: 'row',
     gap: '5',
     justifyContent: 'flex-start',
     alignItems: 'center',
     paddingHorizontal: 6,
    paddingVertical: 4,
  },
  subtotalRight: {
    width: '40%',
    display: 'flex', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 4,
    
  },
  subTotalLabel: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 9,
  },
  subTotalValue: {
    fontWeight: 400,
    color: '#1f2937',
    fontSize: 9,
  },
  
  // Summary Section
  summarySection: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
  },
  summaryLeft: {
    width: '60%',
    borderRight: '1pt solid #6b7280',
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'space-between'
  },
  summaryRight: {
    width: '40%',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignContent: 'center'
  },
  summaryLabel: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 9,
  },
  summaryWords: {
    color: '#1f2937',
    fontSize: 8,
    fontWeight: 400,
  },
  amountWords: {
    fontStyle: 'italic',
    color: '#1f2937',
    fontSize: 8,
    fontWeight: 400,
  },
  
  // Totals Section
  totalsSection: {
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 9,
  },
  totalValue: {
    fontWeight: 400,
    color: '#1f2937',
    fontSize: 9,
  },
  grandTotalRow: {
    paddingTop: 4,
  },
  grandTotalLabel: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: 10,
  },
  grandTotalValue: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: 10,
  },
  
  // Bank Details Section
  bankDetailsSection: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
  },
  bankLeft: {
    width: '40%',
    borderRight: '1pt solid #6b7280',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  bankRight: {
    width: '60%',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  bankTitle: {
    fontWeight: 700,
    marginBottom: 4,
    color: '#111827',
    fontSize: 10,
  },
  bankText: {
    marginBottom: 1,
    fontSize: 8,
    color: '#111827',
    fontWeight: 400,
  },
  
  // Footer Section
  footer: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  footerTitle: {
    fontWeight: 700,
    marginBottom: 3,
    color: '#0f172a',
    fontSize: 10,
    textAlign: 'left',
  },
  termsList: {
    marginBottom: 5,
  },
  termsItem: {
    marginBottom: 2,
    fontStyle: 'italic',
    fontSize: 8,
    color: '#1f2937',
    fontWeight: 400,
    lineHeight: 1.2,
  },
  signature: {
    textAlign: 'right',
    marginTop: 15,
    fontWeight: 600,
    fontSize: 10,
    color: '0f172a',
  },
  computerGenerated: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 8,
    color: '#1f2937',
    fontStyle: 'italic',
    fontWeight: 400,
  },
});

const PIPDFDocument = ({ piData }) => {
  if (!piData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No invoice data available</Text>
        </Page>
      </Document>
    );
  }

  const {
    pi_number,
    pi_date,
    generated_by_name,
    billing,
    shipping,
    delivery_terms,
    items = [],
    extras = {},
    transport = {},
    billing_remarks,
    totals = {}
  } = piData;

  const isShippingSame = shipping === 'same_as_billing';
  const shippingInfo = isShippingSame ? billing : shipping;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          
          {/* Header with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image src="/images/Mantra_logo2.png" style={styles.logo} />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>MANTRA E-BIKES</Text>
              <Text style={styles.companyAddress}>MANTRA E-BIKES</Text>
              <Text style={styles.companyAddress}>
                Kharampur Road, Opposite to Shagun Marriage Place, Mandi Adampur, Hisar, Haryana, 125052
              </Text>
              <Text style={styles.companyAddress}>GSTIN: 06ABJFM7393Q1ZA</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>PERFORMA INVOICE</Text>
          </View>

          {/* Invoice Information */}
          <View style={styles.invoiceInfo}>
            <View style={[styles.invoiceInfoColumn, styles.invoiceInfoLeft]}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PI #:</Text>
                <Text style={styles.infoValue}>{pi_number}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PI Date:</Text>
                <Text style={styles.infoValue}>{pi_date || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.invoiceInfoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Place of Supply:</Text>
                <Text style={styles.infoValue}>{shippingInfo?.state || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sales Person:</Text>
                <Text style={styles.infoValue}>{generated_by_name}</Text>
              </View>
            </View>
          </View>

          {/* Address Header */}
          <View style={styles.addressHeader}>
            <Text style={[styles.addressHeaderCell, styles.rightBorder]}>Bill To:</Text>
            <Text style={styles.addressHeaderCell}>Ship To:</Text>
          </View>

          {/* Address Content */}
          <View style={styles.addressContent}>
            <View style={[styles.addressCell, styles.rightBorder]}>
              <Text style={styles.firmName}>{billing?.firm}</Text>
              <Text style={styles.addressText}>{billing?.address}</Text>
              <Text style={styles.addressText}>{billing?.district}, {billing?.state}</Text>
              <Text style={styles.gstText}>GSTIN: {billing?.gst_no}</Text>
            </View>
            <View style={styles.addressCell}>
              <Text style={styles.firmName}>{shippingInfo?.firm}</Text>
              <Text style={styles.addressText}>{shippingInfo?.address}</Text>
              <Text style={styles.addressText}>{shippingInfo?.district}, {shippingInfo?.state}</Text>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.tableContainer}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCol, styles.colIndex, styles.textCenter]}>#</Text>
                <Text style={[styles.tableCol, styles.colDescription, styles.textLeft]}>Product Name & Description</Text>
                <Text style={[styles.tableCol, styles.colQty, styles.textCenter]}>Qty</Text>
                <Text style={[styles.tableCol, styles.colUnitWithGst, styles.textCenter]}>Unit Price (With GST)</Text>
                <Text style={[styles.tableCol, styles.colUnitWithoutGst, styles.textCenter]}>Unit Price (Without GST)</Text>
                <Text style={[styles.tableCol, styles.colGst, styles.textCenter]}>GST %</Text>
                <Text style={[styles.tableCol, styles.colAmount, styles.textCenter, styles.rightBorder2]}>Amount</Text>
              </View>
                  {/* Table Body */}
                <View style={styles.tBody}>
                    {items.map((item, index) => {
                const amount = (item.qty || 0) * ((item.unit_price) * (100/105) || 0);
                const model = (item.model || '').replace(/_/g, ' ').toUpperCase();
                const description = (item.description || '').replace(/_/g, ' ').split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCol, styles.colIndex, styles.textCenter]}>{index + 1}</Text>
                    <Text style={[styles.tableCol, styles.colDescription, styles.textLeft]}>
                      <Text style={styles.productName}>{model}</Text>
                      {'\n'}
                      <Text style={styles.productDescription}>{description}</Text>
                    </Text>
                    <Text style={[styles.tableCol, styles.colQty, styles.textCenter]}>{item.qty}</Text>
                    <Text style={[styles.tableCol, styles.colUnitWithGst, styles.textRight]}>{formatCurrency(item.unit_price)}</Text>
                    <Text style={[styles.tableCol, styles.colUnitWithoutGst, styles.textRight]}>{formatCurrency(item.unit_price * (100/105))}</Text>
                    <Text style={[styles.tableCol, styles.colGst, styles.textRight]}>5%</Text>
                    <Text style={[styles.tableCol, styles.colAmount, styles.textRight, styles.rightBorder2]}>{formatCurrency(amount)}</Text>
                  </View>
                );
              })}
                </View>
            </View>
          </View>

        {/* Subtotal Header */}
          <View style={styles.addressHeader}>
            <View style={[styles.subtotalLeft]}>
                <Text style={styles.subTotalLabel}>Freight:</Text>
                <Text style={styles.subTotalValue}>{transport.included === 'true' ? 'Included' : 'Extra'}</Text>
                 
            </View>
            <View style={styles.subtotalRight}>
                <Text style={styles.subTotalLabel}>Sub Total:</Text>
                <Text style={styles.subTotalValue}>{formatCurrency(totals.subTotal)}</Text>
            </View>
          </View>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryLeft}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  Note: 
                </Text>
                <Text style={styles.summaryWords}> The container will be dispatched
                  {delivery_terms?.replace(/_/g, ' ').toLowerCase() || 'N/A'} of receiving 30% advance payment.
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Grand Total In Words:</Text>
                <Text style={styles.amountWords}>
                  {toWords.convert(totals.grandTotal || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.summaryRight}>
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Taxable Amount:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(totals.subTotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax Amount:</Text>
                  <Text style={styles.totalValue}>{formatCurrency((totals.subTotal || 0) * 5/100)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                  <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                  <Text style={styles.grandTotalValue}>{formatCurrency(totals.grandTotal)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bank Details & Remarks */}
          <View style={styles.bankDetailsSection}>
            <View style={styles.bankLeft}>
              <Text style={styles.bankText}>Bank Name: Punjab National Bank</Text>
              <Text style={styles.bankText}>Bank Branch: Fatehabad</Text>
              <Text style={styles.bankText}>A/C Name: MANTRA E-BIKES</Text>
              <Text style={styles.bankText}>A/C No.: 0146108700000032</Text>
              <Text style={styles.bankText}>IFSC Code: PUNB0014610</Text>
            </View>
            <View style={styles.bankRight}>
              <Text style={styles.bankTitle}>Remarks: {billing_remarks || 'N/A'}</Text>
              <Text style={[styles.bankText, {marginTop: 4}]}>
                Extras: {Object.entries(extras).filter(([, value]) => value).map(([key]) => 
                  key.charAt(0).toUpperCase() + key.slice(1)).join(', ') || 'None'
                }
              </Text>
            </View>
          </View>

          {/* Footer - Terms & Conditions */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Terms & Conditions</Text>
            <View style={styles.termsList}>
              <Text style={styles.termsItem}>1. Payment: 100% Advance</Text>
              <Text style={styles.termsItem}>2. This quotation is valid for a period of 14 days only from the PI Date.</Text>
              <Text style={styles.termsItem}>3. Goods once sold cannot be returned in any case and once payment received, it cannot be returned in any case.</Text>
              <Text style={styles.termsItem}>4. Goods will dispatch from 2-3 days after receiving full payment.</Text>
              <Text style={styles.termsItem}>5. Please use this performa invoice only for Payment Purpose & don't use for road permit/way bills or return.</Text>
              <Text style={styles.termsItem}>6. "Subject to 'HISAR' Jurisdiction only. E.&.O.E"</Text>
              <Text style={styles.termsItem}>We hope you will find our offer acceptable and looking forward towards a long term business relationship with us.</Text>
              <Text style={styles.termsItem}>Warm Regards,</Text>
            </View>
            <Text style={styles.computerGenerated}>
              This is a computer-generated document and does not require a signature.
            </Text>
            <Text style={styles.signature}>For, MANTRA E-BIKES</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PIPDFDocument;