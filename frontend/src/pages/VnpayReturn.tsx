import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type PaymentResult = {
  success: boolean;
  txnRef: string;
  amount: string;
  message: string;
};

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Đảm bảo authentication được restore khi redirect từ VNPay về
  useEffect(() => {
    // Kiểm tra và restore authentication từ localStorage
    const token = localStorage.getItem("token");
    const authUserStr = localStorage.getItem("auth_user");
    
    if (token && authUserStr) {
      // User đã authenticated, không cần làm gì
      // AuthContext sẽ tự động restore từ localStorage
      return;
    }
    
    // Nếu không có token hoặc user, có thể đã bị logout
    // Nhưng đợi một chút để AuthContext có thời gian restore
    const timer = setTimeout(() => {
      const checkToken = localStorage.getItem("token");
      const checkUser = localStorage.getItem("auth_user");
      
      if (!checkToken || !checkUser) {
        // Nếu vẫn không có, redirect về login
        console.warn("No authentication found, redirecting to login");
        navigate("/login", { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    // Parse VNPay return parameters
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const vnpTxnRef = searchParams.get("vnp_TxnRef");
    const vnpAmount = searchParams.get("vnp_Amount");

    if (!vnpResponseCode || !vnpTxnRef) {
      setResult({
        success: false,
        txnRef: "",
        amount: "0",
        message: "Invalid payment response"
      });
      setLoading(false);
      return;
    }

    // QUAN TRỌNG: Gọi backend return URL để xử lý payment
    const processPayment = async () => {
      try {
        // Build query string từ searchParams
        const queryString = searchParams.toString();
        const token = localStorage.getItem("token");
        
        // Gọi backend return URL để xử lý payment
        const response = await fetch(`/api/payment/vnpay/return?${queryString}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Payment processed:", data);
        } else {
          console.error("Failed to process payment:", await response.text());
        }
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    };

    // Process payment ngay khi component mount
    processPayment();

    // Parse amount (VNPay returns amount * 100)
    const amount = vnpAmount ? (parseInt(vnpAmount) / 100).toLocaleString() : "0";

    // Check response code
    const success = vnpResponseCode === "00";
    const message = success
      ? "Thanh toán thành công! Số tiền sẽ được cập nhật vào ví của bạn."
      : getErrorMessage(vnpResponseCode);

    setResult({
      success,
      txnRef: vnpTxnRef,
      amount,
      message
    });
    setLoading(false);
  }, [searchParams]);

  const getErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
      "07": "Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán.",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định."
    };
    return errorMessages[code] || `Thanh toán thất bại hoặc bị hủy (Mã lỗi: ${code})`;
  };

  const handleBackToDashboard = () => {
    // Redirect về dashboard thay vì wallet
    navigate("/dashboard");
  };
  
  const handleBackToWallet = () => {
    navigate("/wallet");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader className="text-center">
          {result?.success ? (
            <>
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
              <CardTitle className="mt-4 text-2xl text-green-600">
                Thanh toán thành công!
              </CardTitle>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
              <CardTitle className="mt-4 text-2xl text-red-600">
                Thanh toán không thành công
              </CardTitle>
            </>
          )}
          <CardDescription className="mt-2">
            {result?.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Mã giao dịch:</span>
                <span className="font-mono font-semibold">{result?.txnRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Số tiền:</span>
                <span className="font-semibold">{result?.amount} VND</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Trạng thái:</span>
                <span
                  className={`font-semibold ${
                    result?.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result?.success ? "Thành công" : "Thất bại"}
                </span>
              </div>
            </div>
          </div>

          {result?.success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">💡 Lưu ý:</p>
              <p className="mt-1">
                Số dư trong ví của bạn đã được cập nhật. Bạn có thể quay lại trang ví để kiểm tra.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={result?.success ? handleBackToDashboard : handleBackToWallet}
              className="flex-1"
              variant={result?.success ? "default" : "outline"}
            >
              {result?.success ? "Về trang chủ" : "Thử lại"}
            </Button>
            {result?.success && (
              <Button
                onClick={handleBackToWallet}
                className="flex-1"
                variant="outline"
              >
                Xem ví
              </Button>
            )}
            {!result?.success && (
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex-1"
                variant="outline"
              >
                Về trang chủ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VnpayReturn;


