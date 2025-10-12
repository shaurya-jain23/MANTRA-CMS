import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Edit, Printer, Download, AlertCircle, Mail, PrinterIcon, Share2, Trash2, ArrowLeft } from 'lucide-react';
import { selectUser } from '../../features/user/userSlice';
import {
  fetchPis,
  selectPIStatus,
  setPIStatus,
  selectPIById,
} from '../../features/performa-invoices/PISlice';
import { Button, InvoiceDetail, Loading, Container, PIPDFDocument } from '../../components';
import toast from 'react-hot-toast';
import { PDFDownloadLink, PDFViewer, BlobProvider } from '@react-pdf/renderer';
import { usePIActions } from '../../hooks/usePIActions';

function PIShowPage() {
  const { piId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [piData, setPiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = useSelector(selectUser);
  const piRef = useRef();
  const printIframeRef = useRef();
  const piToShow = useSelector((state) => selectPIById(state, piId)) || null;
  const PIStatus = useSelector(selectPIStatus);
  const {
    processingAction,
    handleConfirmAction,
    alertState,
    setAlertState
  } = usePIActions();

  const handlePrint = (blob) => {
    if (!blob) {
      toast.error('PDF is not ready yet. Please try again.');
      return;
    }

    const blobUrl = URL.createObjectURL(blob);

    // Clean up previous iframe if exists
    if (printIframeRef.current) {
      document.body.removeChild(printIframeRef.current);
      printIframeRef.current = null;
    }

    // Create hidden iframe
    const iframe = document.createElement('iframe');
    printIframeRef.current = iframe;
    iframe.style.display = 'none';
    iframe.src = blobUrl;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      // Trigger print after content loads
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Listen for afterprint event to cleanup
          const cleanup = () => {
            // Cleanup after printing is done
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              URL.revokeObjectURL(blobUrl);
              printIframeRef.current = null;

              // Remove the event listener
              iframe.contentWindow?.removeEventListener('afterprint', cleanup);
            }, 1000);
          };

          iframe.contentWindow?.addEventListener('afterprint', cleanup);

          // Fallback cleanup in case afterprint doesn't fire
          setTimeout(cleanup, 10000);
        } catch (error) {
          console.error('Print failed:', error);
          toast.error('Failed to print PDF');
          // Fallback cleanup
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            URL.revokeObjectURL(blobUrl);
            printIframeRef.current = null;
          }, 5000);
        }
      }, 1000);
    };

    // Error handling for iframe loading
    iframe.onerror = () => {
      toast.error('Failed to load PDF for printing');
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      URL.revokeObjectURL(blobUrl);
      printIframeRef.current = null;
    };
  };

  const handleShare = async (blob) => {
    if (!blob) {
      toast.error('PDF is not ready yet. Please try again.');
      return;
    }
    if (blob && navigator.share) {
      try {
        const file = new File([blob], `Invoice_${piData.pi_number}.pdf`, {
          type: 'application/pdf',
        });

        await navigator.share({
          title: `Performa Invoice ${piData.pi_number}`,
          text: `Performa Invoice ${piData.pi_number}`,
          files: [file],
        });
        toast.success('Invoice shared successfully');
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share invoice');
        }
      }
    } else if (blob) {
      // Fallback: download if share not supported
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${piData.pi_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded (share not supported)');
    }
  };


  useEffect(() => {
    if (PIStatus === 'idle' && userData) {
      dispatch(fetchPis({ role: userData.role, userId: userData.uid }));
    }
    if (PIStatus === 'succeeded' && !piToShow) {
      toast.error('Failed to fetch PI');
      setPiData(piToShow);
      setLoading(false);
    }
    if (PIStatus === 'succeeded' && piToShow) {
      setPiData(piToShow);
      setLoading(false);
    }
    if (PIStatus === 'failed') {
      setError('Failed to fetch PI.');
      setLoading(false);
    }
  }, [PIStatus, dispatch, userData, piId]);

  if (loading) {
    return <Loading isOpen={true} message="Loading Page..." />;
  }
  if (!piData) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Perform Invoice Not Found</h3>
          <p className="text-slate-500 mb-6 max-w-md">
            The invoice you are looking for does not exist or could not be loaded.
          </p>
          <Button variant="primary" onClick={() => navigate('/performa-invoices')}>
            Back to All Performa Invoices
          </Button>
        </div>
        ;
      </>
    );
  }

  return (
    <Container>
      <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-md">
        <div className="w-full flex flex-col justify-center mb-6 items-start print:hidden">
          <div className='flex flex-col sm:flex-row w-full mb-4 sm:mb-8 justify-between'>
            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900">
              Performa Invoice: <span className="font-mono text-slate-500">{piData.pi_number}</span>
            </h1>
            <div
                className={`h-fit py-1 px-3 flex lg:flex items-center gap-1 text-sm leading-5 font-bold rounded-full outline ${
                  piData.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : piData.status === 'unpaid' ?  'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                <div className='h-2 w-2 rounded-full bg-white outline'></div>{piData.status.toUpperCase()}
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 w-full">
            {piData.bookingId ? 
              <Button variant="secondary" size='small' onClick={()=> navigate(`/bookings/${piData.bookingId}`)} className="gap-2">
                <ArrowLeft size={16} />
                  Back to your booking
              </Button> :
              <Button variant="secondary" size='small' onClick={()=> navigate('/performa-invoices')} className="gap-2">
                <ArrowLeft size={16} />
                  Back to All PIs
              </Button>}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size='small'
                onClick={() => navigate(`/performa-invoices/${piId}/edit`)}
                className="flex-1 sm:flex-initial"
              >
                <Edit size={16} className="mr-2" /> Edit
              </Button>
              <Button
                variant="secondary"
                size='small'
                onClick={() => setAlertState({ isOpen: true, action : 'delete', performa_invoice:piToShow })}
                className="text-red-500"
              >
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>

              <BlobProvider document={<PIPDFDocument piData={piData} />}>
                {({ blob: shareBlob, loading: shareLoading }) => (
                  <Button 
                    variant="secondary" 
                    size='small'
                    onClick={() => handleShare(shareBlob)} 
                    disabled={shareLoading || !shareBlob}
                    className="text-blue-700"
                  >
                    <Share2 size={16} className="mr-2" /> 
                    {shareLoading ? 'Preparing...' : 'Share'}
                  </Button>
                )}
              </BlobProvider>

              {/* PDF Download Link */}
              <PDFDownloadLink
                document={<PIPDFDocument piData={piData} />}
                fileName={`Invoice_${piData.pi_number.replace(/\//g, '_')}.pdf`}
                className="flex-1 sm:flex-initial"
              >
                {({ loading }) => (
                  <Button variant="primary" size='small' className="w-fit" disabled={loading}>
                    <Download size={16} className="mr-2" />
                    {loading ? 'Generating...' : 'Download PDF'}
                  </Button>
                )}
              </PDFDownloadLink>
              {/* PDF Print with Blob Provider */}
              <BlobProvider document={<PIPDFDocument piData={piData} />}>
                {({ blob: printBlob, loading: printLoading }) => (
                  <Button 
                    onClick={() => handlePrint(printBlob)} 
                    variant='primary'
                    size='small'
                    disabled={printLoading || !printBlob}
                    className="flex-1 sm:flex-initial w-fit"
                  >
                    <Printer size={16} className="mr-2" /> 
                    {printLoading ? 'Preparing...' : 'Print PDF'}
                  </Button>
                )}
              </BlobProvider>
            </div>
          </div>
        </div>
        <div id="invoice-content-wrapper">
          <div className="hidden lg:block border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">PDF Preview</h3>
                  <p className="text-sm text-gray-600">A4 Size Preview</p>
                </div>
                <div className="h-[1000px] border">
                  <PDFViewer width="100%" height="100%">
                    <PIPDFDocument piData={piData} />
                  </PDFViewer>
                </div>
              </div>
          {/* <div
            id="invoice-preview"
            className="bg-white p-2 sm:p-8 md:p-12 md:px-20 rounded-sm shadow-md border border-slate-200"
            ref={piRef}
          >
            <InvoiceDetail piData={piData} />
          </div> */}
        </div>
      </div>
    </Container>
  );
}

export default PIShowPage;
