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
    padding: 8,
  },
  companyName: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 6,
    color: '#0f172a',
  },
  companyAddress: {
    fontSize: 7,
    marginBottom: 1,
    maxWidth: 350,
    color: '#4b5563',
    fontWeight: 400,
  },
  
  // Title Section
  titleSection: {
    borderBottom: '1pt solid #6b7280',
    paddingTop: 1,
    alignItems: 'center',
    display:'flex',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#000',
    lineHeight: 1.5,
    letterSpacing: 1,
  },
  
  // Invoice Info Section
  invoiceInfo: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
  },
  invoiceInfoColumn: {
    width: '50%',
    paddingHorizontal: 5,
    paddingVertical: 3,
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
    fontSize: 7,
    lineHeight: 1.5,
  },
  infoValue: {
    width: '65%',
    color: '#000',
    fontSize: 7,
    fontWeight: 400,
    lineHeight: 1.2,
  },
  
  // Address Header
  addressHeader: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
    backgroundColor: '#f1f5f9',
  },
  addressHeaderCell: {
    width: '50%',
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#1e293b',
    fontSize: 7,
    lineHeight: 1.2,
    textAlign: "left",
  },
  
  rightBorder: {
    borderRight: '1pt solid #6b7280',
  },
  // Address Content
  addressContent: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
    minHeight: 60,
  },
  addressCell: {
    width: '50%',
    paddingHorizontal: 5,
    paddingTop: 3,
  },
  firmName: {
    fontWeight: 600,
    color: '#0f172a',
    fontSize: 7,
  },
  addressText: {
    marginBottom: 1,
    color: '#4b5563',
    lineHeight: 1.5,
    fontSize: 6,
    fontWeight: 400,
  },
  gstText: {
    fontWeight: 500,
    color: '#1f2937',
    lineHeight: 1.5,
    fontSize: 7,
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
    minHeight: 25,
  },
  tableCol: {
    borderRight: '1pt solid #d1d5db',
    paddingTop: 3,
    paddingBottom: 1,
    paddingHorizontal: 3,
    fontSize: 6.5,
    color: '#6b7280',
    lineHeight: 1.2,
    justifyContent: 'center',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'semibold',
    textTransform: 'uppercase',
    fontSize: 6,
    color: '#4b5563',
  },
  rightBorder2: {
    borderRight: 'none',
  },
  // Column Widths
  colIndex: { width: '5%' },
  colDescription: { width: '43%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
   },
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
    minHeight: '200'
  },
  // Product Styles
  productName: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 6.5,
  },
  
  productDescription: {
    fontSize: 6,
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
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  subtotalRight: {
    width: '40%',
    display: 'flex', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 2,
    
  },
  subTotalLabel: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 8,
    lineHeight: 1.2,
  },
  subTotalValue: {
    fontWeight: 400,
    color: '#1f2937',
    fontSize: 8,
    lineHeight: 1.2,
  },
  
  // Summary Section
  summarySection: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
  },
  summaryLeft: {
    width: '60%',
    borderRight: '1pt solid #6b7280',
    paddingHorizontal: 5,
    paddingVertical: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  summaryRight: {
    width: '40%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  summaryItem: {
    flexDirection: 'row',
    gap: 3,
    alignContent: 'center',
  },
  summaryLabel: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 7,
  },
  summaryWords: {
    color: '#1f2937',
    fontSize: 7,
    fontWeight: 400,
  },
  amountWords: {
    fontStyle: 'italic',
    color: '#1f2937',
    fontSize: 7,
    fontWeight: 400,
  },
  
  // Totals Section
  totalsSection: {
    marginTop: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 7,
  },
  totalValue: {
    fontWeight: 400,
    color: '#1f2937',
    fontSize: 7,
  },
  grandTotalRow: {
    paddingTop: 3,
  },
  grandTotalLabel: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: 8,
  },
  grandTotalValue: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: 8,
  },
  
  // Bank Details Section
  bankDetailsSection: {
    flexDirection: 'row',
    borderBottom: '1pt solid #6b7280',
  },
  bankLeft: {
    width: '40%',
    borderRight: '1pt solid #6b7280',
    paddingHorizontal: 3,
    paddingVertical: 4,
  },
  bankRight: {
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  bankTitle: {
    fontWeight: 600,
    marginBottom: 3,
    color: '#111827',
    fontSize: 7,
  },
  bankText: {
    marginBottom: 0.9,
    fontSize: 7,
    color: '#111827',
    fontWeight: 400,
  },
  
  // Footer Section
  footer: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  footerTitle: {
    fontWeight: 700,
    marginBottom: 2,
    color: '#0f172a',
    fontSize: 8,
    textAlign: 'left',
  },
  termsList: {
    marginBottom: 4,
  },
  termsItem: {
    marginBottom: 3,
    fontStyle: 'italic',
    fontSize: 7,
    color: '#1f2937',
    fontWeight: 400,
    lineHeight: 1,
  },
  signature: {
    textAlign: 'right',
    marginTop: 10,
    fontWeight: 600,
    fontSize: 8,
    color: '0f172a',
  },
  computerGenerated: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 6,
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
    placeOfDelivery=null,
    generated_by_name,
    billing,
    shipping,
    delivery_terms,
    items = [],
    transport = {},
    billing_remarks,
    totals = {},
    type= 'normal',
    warranty_terms, 
    pi_location='hisar'
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
            <Text style={styles.title}>PROFORMA INVOICE</Text>
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
                <Text style={styles.infoValue}>{placeOfDelivery || shippingInfo.state || 'N/A'}</Text>
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
                const descriptionModel = (item.description?.model)?.replace(/_/g, ' ')?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const descriptionBattery = (item.description?.battery)?.replace(/_/g, ' ')?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const descriptionCharger = (item.description?.charger)?.replace(/_/g, ' ')?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const fullDescription= type==='container' ? `${descriptionModel}, ${item.with_battery ? `With ${descriptionBattery} Battery` : 'Without Battey'}, ${item.with_charger ? `With ${descriptionCharger} Charger` : 'Without Charger'}, ${item.with_tyre ? 'With tyre' : 'Without tyre'}, ${item.with_assembling ? 'With Assembling' : 'In CKD'}` 
                : `${descriptionModel}, ${item.with_battery ? `With ${descriptionBattery} Battery` : 'Without Battey'}, ${item.with_charger ? `With ${descriptionCharger} Charger` : 'Without Charger'}`;
                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCol, styles.colIndex, styles.textCenter]}>{index + 1}</Text>
                    <View style={[styles.tableCol, styles.colDescription, styles.textLeft]}>
                      <Text style={styles.productName}>{model} {item.with_accessories ? '(With Accessories)' : null}</Text>
                      <Text style={styles.productDescription}>{['BATTERY', 'CHARGER'].includes(model) ? descriptionModel : fullDescription}</Text>
                    </View>
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
                <Text style={styles.subTotalValue}>{(transport.included === 'true' || transport.included === true ) ? 'Included' : 'Extra'}</Text>
                 
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
                {type=== 'container' ? (<Text style={styles.summaryWords}> The container will be dispatched
                  {delivery_terms?.replace(/_/g, ' ').toLowerCase() || ' N/A'} of receiving 30% advance payment.
                </Text>) : null}
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
                 {(['false', false].includes(transport.included)) &&  <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Freight Charges:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(transport.charges)}</Text>
                </View> }
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
                { pi_location=== 'noida' && type==='normal' ? <View>
                  <Text style={styles.bankText}>Bank Name: Punjab National Bank</Text>
                  <Text style={styles.bankText}>Bank Branch: Mandi Adampur</Text>
                  <Text style={styles.bankText}>A/C Name: MANTRA E-BIKES</Text>
                  <Text style={styles.bankText}>A/C No.: 1816102100000514</Text>
                  <Text style={styles.bankText}>IFSC Code: PUNB0181610</Text>
                </View> : <View>
                <Text style={styles.bankText}>Bank Name: Punjab National Bank</Text>
                <Text style={styles.bankText}>Bank Branch: Fatehabad</Text>
                <Text style={styles.bankText}>A/C Name: MANTRA E-BIKES</Text>
                <Text style={styles.bankText}>A/C No.: 0146108700000032</Text>
                <Text style={styles.bankText}>IFSC Code: PUNB0014610</Text>
                </View>
              }
            </View>
            <View style={styles.bankRight}>
              <View>
                <Text style={styles.bankTitle}>Remarks:</Text>
                <Text style={styles.bankText}>{billing_remarks || 'N/A'}</Text>
              </View>
              {warranty_terms && 
                <View>
                  <Text style={styles.bankTitle}>{warranty_terms ? '': 'NO GUARANTEE NO WARRANTY'}</Text>
                </View>}
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
              <Text style={styles.termsItem}>5. Please use this proforma invoice only for Payment Purpose & don't use for road permit/way bills or return.</Text>
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